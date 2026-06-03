// lib/walrus.ts
// Walrus blob storage helpers — core of PromptVault

const PUBLISHER = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || 'https://publisher.walrus.space';
const AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus.space';

export async function storeBlob(data: string): Promise<string> {
  const response = await fetch(`${PUBLISHER}/v1/blobs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: new TextEncoder().encode(data),
  });

  if (!response.ok) {
    throw new Error(`Walrus store failed: ${response.status} ${response.statusText}`);
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
}

export async function retrieveBlob(blobId: string): Promise<string> {
  const response = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
  if (!response.ok) {
    throw new Error(`Walrus retrieve failed: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new TextDecoder().decode(buffer);
}

export async function storeJSON(obj: unknown): Promise<string> {
  return storeBlob(JSON.stringify(obj));
}

export async function retrieveJSON<T = unknown>(blobId: string): Promise<T> {
  const text = await retrieveBlob(blobId);
  return JSON.parse(text) as T;
}
