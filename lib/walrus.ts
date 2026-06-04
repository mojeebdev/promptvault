// lib/walrus.ts
// Walrus blob storage helpers — core of PromptVault
// Mainnet only: publisher.walrus.space + aggregator.walrus.space

// Force IPv4 DNS resolution first. This fixes a lot of EAI_AGAIN / getaddrinfo
// transient DNS failures on Windows and some networks.
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

const RAW_PUBLISHER = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || 'https://publisher.walrus.space';
const RAW_AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus.space';

// Normalize: remove trailing slashes
const PUBLISHER = RAW_PUBLISHER.replace(/\/+$/, '');
const AGGREGATOR = RAW_AGGREGATOR.replace(/\/+$/, '');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function storeBlob(data: string, attempt = 1): Promise<string> {
  const maxAttempts = 5; // more attempts for flaky DNS
  const url = `${PUBLISHER}/v1/blobs`;

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

    if (isNetworkError && attempt < maxAttempts) {
      const backoff = Math.min(1500 * Math.pow(2, attempt - 1), 8000);
      console.warn(`[walrus] Network error storing blob (attempt ${attempt}/${maxAttempts}). Retrying in ${backoff}ms...`, (err as Error).message);
      await sleep(backoff);
      return storeBlob(data, attempt + 1);
    }

    // Surface a helpful message for the common DNS/network case
    if (isNetworkError) {
      const causeMsg = (err as Error).cause ? ` Cause: ${(err as Error).cause}` : '';
      throw new Error(
        `Failed to reach Walrus publisher at ${PUBLISHER}.\n\n` +
        `This is a DNS resolution problem (getaddrinfo EAI_AGAIN or ENOTFOUND).\n` +
        `Common on Windows.\n\n` +
        `Quick fixes to try (in PowerShell):\n` +
        `  1. ipconfig /flushdns\n` +
        `  2. nslookup publisher.walrus.space 8.8.8.8\n` +
        `  3. Restart your dev server\n` +
        `  4. Temporarily set your network DNS to 8.8.8.8 + 1.1.1.1\n\n` +
        `If it keeps happening, your network/VPN/firewall is blocking or rate-limiting DNS for walrus.space.` +
        causeMsg
      );
    }

    throw err;
  }
}

export async function retrieveBlob(blobId: string): Promise<string> {
  const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Walrus retrieve failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new TextDecoder().decode(buffer);
  } catch (err) {
    clearTimeout(timeout);
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
