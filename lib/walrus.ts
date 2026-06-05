// lib/walrus.ts
// Walrus blob storage helpers — core of PromptVault (Sui MAINNET only)
// 
// CRITICAL (from official docs):
// - https://docs.wal.app/operators.json  → Mainnet lists ONLY aggregators; ZERO publishers under mainnet.
// - https://docs.wal.app/docs/system-overview/public-aggregators-and-publishers
//   "On Mainnet, there are no public publishers without authentication, as they consume both SUI and WAL."
// - https://docs.wal.app/docs/operator-guide/publishers/mainnet-production-guide
//   "Do not rely on community publishers for production uploads. Community endpoints can change, go offline..."
//
// The app uses volunteer/community-operated mainnet publishers (Staketab is the primary documented free one
// via MystenLabs/awesome-walrus) + aggressive retry + cross-endpoint fallback for the HTTP PUT /v1/blobs flow.
// This is acceptable for a hackathon/public demo. For real production, run your own authenticated publisher.
//
// Default publisher: Staketab (listed in awesome-walrus). Override with NEXT_PUBLIC_WALRUS_PUBLISHER.
// Aggregators have many public options (see operators.json); we use Mysten + Staketab + fallbacks.

// Force IPv4 DNS resolution first. This fixes a lot of EAI_AGAIN / getaddrinfo
// transient DNS failures on Windows and some networks.
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

const RAW_PUBLISHER = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || 'https://walrus-mainnet-publisher-1.staketab.org';
const RAW_AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus-mainnet.walrus.space';

// Normalize: remove trailing slashes
const PUBLISHER = RAW_PUBLISHER.replace(/\/+$/, '');
const AGGREGATOR = RAW_AGGREGATOR.replace(/\/+$/, '');

// Public mainnet aggregators (many available per operators.json). Use for retrieve with fallbacks.
// Prioritize ones marked cache:true + functional in the JSON.
const AGGREGATOR_ENDPOINTS = [
  AGGREGATOR,
  'https://wal-aggregator-mainnet.staketab.org',
  'https://aggregator.mainnet.walrus.mirai.cloud',
  'https://aggregator.walrus-mainnet.tududes.com',
  'https://mainnet-aggregator.walrus.graphyte.dev',
];

// Fallback publishers for resilience.
// Primary sources: Staketab (the main "free" mainnet publisher documented in MystenLabs/awesome-walrus).
// We cycle through these aggressively because community mainnet publishers are the only zero-cost option
// and they go up/down independently.
// Nami Cloud requires an endpoint key — not included here.
const PUBLISHER_ENDPOINTS = [
  PUBLISHER,
  'https://walrus-mainnet-publisher-1.staketab.org',
  'https://publish.walrus.site',
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function storeBlob(data: string): Promise<string> {
  // Zero-cost reality on mainnet: we have to hammer the small set of known community publishers
  // until one succeeds. We cycle through them with short backoffs for best chance without user waiting forever.
  const maxTotalAttempts = 20; // be extra patient with flaky community publishers
  const perFetchTimeoutMs = 12000;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxTotalAttempts; attempt++) {
    // Cycle through publishers round-robin
    const endpointIndex = (attempt - 1) % PUBLISHER_ENDPOINTS.length;
    const publisher = PUBLISHER_ENDPOINTS[endpointIndex];
    const url = `${publisher}/v1/blobs`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), perFetchTimeoutMs);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new TextEncoder().encode(data),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Walrus store failed: ${response.status} ${response.statusText} ${text}`);
      }

      const result = await response.json();

      const blobId =
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobId;

      if (!blobId) {
        throw new Error('No blobId returned from Walrus');
      }

      console.log(`[walrus] Success on attempt ${attempt} via ${publisher}`);
      return blobId;
    } catch (err: unknown) {
      clearTimeout(timeout);
      lastError = err as Error;

      const msg = (err as Error)?.message || String(err);
      const isNetworkError =
        err instanceof TypeError &&
        (msg.includes('fetch failed') || msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN') || msg.includes('ECONNREFUSED') || msg.includes('abort'));
      const is5xx = msg.includes('Walrus store failed: 5');
      const isTransient = isNetworkError || is5xx;

      if (isTransient && attempt < maxTotalAttempts) {
        // Short, aggressive backoff when cycling publishers
        const backoff = Math.min(400 + (attempt * 150), 2200);
        console.warn(`[walrus] Transient error (attempt ${attempt}/${maxTotalAttempts}) on ${publisher}. Retrying in ${backoff}ms...`, msg);
        await sleep(backoff);
        continue;
      }

      // Non-transient or exhausted attempts — will throw below
      break;
    }
  }

  // Exhausted all attempts across all publishers
  const isVercel = !!process.env.VERCEL;
  const publisherList = PUBLISHER_ENDPOINTS.join(', ');
  throw new Error(
    `Failed to store blob on Walrus after ${maxTotalAttempts} attempts across community publishers (${publisherList}).\n\n` +
    `Mainnet has no free public unauthenticated publisher (per https://docs.wal.app/operators.json and public-aggregators-and-publishers docs). ` +
    `We rely on volunteer-operated endpoints (Staketab is the primary documented free one). These can be temporarily overloaded or unreachable.\n\n` +
    (isVercel
      ? `This is a known transient issue on community mainnet infrastructure. Please try submitting again in a minute or two.`
      : `Try again shortly.`) +
    (lastError ? ` Last error: ${lastError.message}` : '')
  );
}

export async function retrieveBlob(blobId: string, attempt = 1, endpointIndex = 0): Promise<string> {
  const maxAttempts = 3;
  const aggregator = AGGREGATOR_ENDPOINTS[endpointIndex] || AGGREGATOR;
  const url = `${aggregator}/v1/blobs/${blobId}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      const is5xx = response.status >= 500 && response.status < 600;
      if (is5xx && (attempt < maxAttempts || endpointIndex < AGGREGATOR_ENDPOINTS.length - 1)) {
        // transient on aggregator — try again or next
        throw new Error(`Walrus retrieve failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Walrus retrieve failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new TextDecoder().decode(buffer);
  } catch (err: unknown) {
    clearTimeout(timeout);

    const msg = err instanceof Error ? err.message : String(err);
    const isTransient =
      (err instanceof TypeError && /fetch|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|abort/i.test(err.message)) ||
      /Walrus retrieve failed: 5/.test(msg);

    if (isTransient && attempt < maxAttempts) {
      const backoff = Math.min(800 * Math.pow(2, attempt - 1), 3000);
      console.warn(`[walrus] Transient error retrieving ${blobId} from ${aggregator} (attempt ${attempt}/${maxAttempts}). Retrying...`);
      await sleep(backoff);
      return retrieveBlob(blobId, attempt + 1, endpointIndex);
    }

    if (isTransient && endpointIndex < AGGREGATOR_ENDPOINTS.length - 1) {
      console.warn(`[walrus] Switching aggregator for retrieve ${blobId}...`);
      return retrieveBlob(blobId, 1, endpointIndex + 1);
    }

    throw err;
  }
}

export async function storeJSON(obj: unknown): Promise<string> {
  return storeBlob(JSON.stringify(obj));
}

export async function retrieveJSON<T = unknown>(blobId: string): Promise<T> {
  const text = await retrieveBlob(blobId);
  return JSON.parse(text) as T;
}
