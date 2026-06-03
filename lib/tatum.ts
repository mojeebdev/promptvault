// lib/tatum.ts
// Sui RPC via Tatum gateway (Best Use of Tatum Tools)

const RPC = process.env.NEXT_PUBLIC_SUI_MAINNET_RPC || 'https://sui-mainnet.gateway.tatum.io';
const API_KEY = process.env.TATUM_API_KEY || '';

interface RpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

export async function suiRpcCall<T = unknown>(
  method: string,
  params: unknown[]
): Promise<T> {
  // All RPC calls are forced to mainnet via Tatum (per project requirements)
  const url = RPC;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const data: RpcResponse<T> = await response.json();
  if (data.error) {
    throw new Error(`Sui RPC error: ${data.error.message}`);
  }
  return data.result as T;
}

// Health check — used in submission checklist
export async function getLatestCheckpoint() {
  return suiRpcCall('suix_getLatestCheckpointSequenceNumber', []);
}

// Example: fetch objects owned by an address (for a publisher address or our demo address)
export async function getOwnedObjects(owner: string, structType?: string) {
  const filter = structType
    ? { filter: { StructType: structType } }
    : undefined;

  return suiRpcCall(
    'suix_getOwnedObjects',
    [owner, filter ? { filter } : {}]
  );
}

// Query events (preferred for public registry feed)
export async function queryEvents(
  packageId: string,
  eventType: string,
  limit = 50
) {
  // Move event type is usually `${packageId}::promptvault::PromptPublished`
  // Note: eventType param kept for API compatibility but mainnet is enforced
  return suiRpcCall(
    'suix_queryEvents',
    [
      { MoveEventType: `${packageId}::promptvault::PromptPublished` },
      null,
      limit,
      false, // descending
    ]
  );
}

// For demo: if we don't have a full package yet, we can still accept tx digests from manual/client publish
export const DEFAULT_PACKAGE_ID = process.env.NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID || '';
