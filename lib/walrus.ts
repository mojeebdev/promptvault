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
// Primary sources: Staketab (documented free mainnet publisher in Mysten awesome-walrus).
// Nami Cloud requires an endpoint key (https://walrus-mainnet-publisher.nami.cloud/${key}/) — not usable unauth here.
// Other community endpoints may exist but are not guaranteed (see docs above).
const PUBLISHER_ENDPOINTS = [
  PUBLISHER,
  'https://walrus-mainnet-publisher-1.staketab.org',
  'https://publish.walrus.site',
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function storeBlob(data: string, attempt = 1, endpointIndex = 0): Promise<string> {
  const maxAttempts = 5; // more attempts for flaky DNS
  const publisher = PUBLISHER_ENDPOINTS[endpointIndex] || PUBLISHER;
  const url = `${publisher}/v1/blobs`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout per attempt

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

    // Response contains either newlyCreated or alreadyCertified
    const blobId =
      result.newlyCreated?.blobObject?.blobId ||
      result.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error('No blobId returned from Walrus');
    }
    return blobId;
  } catch (err: unknown) {
    clearTimeout(timeout);

    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND') || err.message.includes('EAI_AGAIN') || err.message.includes('ECONNREFUSED') || err.message.includes('abort'));

    const isTransient = isNetworkError || (err instanceof Error && err.message.includes('Walrus store failed: 5'));

    if (isTransient && attempt < maxAttempts) {
      const backoff = Math.min(1500 * Math.pow(2, attempt - 1), 8000);
      console.warn(`[walrus] Transient error storing blob (attempt ${attempt}/${maxAttempts}). Retrying in ${backoff}ms...`, (err as Error).message);
      await sleep(backoff);
      return storeBlob(data, attempt + 1, endpointIndex);
    }

    if (isTransient && endpointIndex < PUBLISHER_ENDPOINTS.length - 1) {
      console.warn(`[walrus] All retries failed for ${publisher}, trying next publisher endpoint...`);
      return storeBlob(data, 1, endpointIndex + 1);
    }

    // Surface a helpful message for the common transient case on community publishers
    if (isTransient || (err instanceof Error && err.message.includes('Walrus store failed'))) {
      const causeMsg = (err as Error).cause ? ` (cause: ${(err as Error).cause})` : '';
      const isVercel = !!process.env.VERCEL;
      throw new Error(
        `Failed to reach Walrus publisher at ${publisher}.\n\n` +
        `Mainnet has no public unauthenticated publisher (see https://docs.wal.app/docs/system-overview/public-aggregators-and-publishers and operators.json).\n` +
        `We are using community-operated endpoints (Staketab primary) which can return 5xx/DNS errors.\n` +
        `The code already retried 5\u00d7 + tried fallbacks.\n\n` +
        (isVercel
          ? `This is a temporary outage on the community publisher from Vercel. Retry in a few minutes or set NEXT_PUBLIC_WALRUS_PUBLISHER to another working endpoint.`
          : `Common on local/Windows. Try again, flush DNS, or override the env var.`) +
        causeMsg
      );
    }

    throw err;
  }
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
