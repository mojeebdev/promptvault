// lib/sui.ts
// Client-side Sui transaction helpers using @mysten/sui
// MAINNET ONLY — all transactions, events, and reads use Sui mainnet via Tatum RPC.
// WARNING: Publishing with a real private key on mainnet will spend real SUI gas and create permanent on-chain objects.

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

const MAINNET_RPC = process.env.NEXT_PUBLIC_SUI_MAINNET_RPC || 'https://sui-mainnet.gateway.tatum.io';

export function getSuiClient() {
  // Always mainnet per project requirements. No testnet/devnet support.
  return new SuiClient({ url: MAINNET_RPC });
}

// Build a publish tx for our Move module (requires deployed packageId)
export function buildPublishTx(params: {
  packageId: string;
  promptBlobId: string;
  evalBlobId: string;
  title: string;
  tags: string[];
  targetModel: string;
  parentBlobId?: string | null;
}) {
  const { packageId, promptBlobId, evalBlobId, title, tags, targetModel, parentBlobId } = params;

  const tx = new Transaction();

  // Convert strings to vectors for Move
  const promptBytes = Array.from(new TextEncoder().encode(promptBlobId));
  const evalBytes = Array.from(new TextEncoder().encode(evalBlobId));
  const titleBytes = Array.from(new TextEncoder().encode(title));
  const modelBytes = Array.from(new TextEncoder().encode(targetModel));
  const parentBytes = parentBlobId
    ? Array.from(new TextEncoder().encode(parentBlobId))
    : [];

  const tagBytes = tags.map((t) => Array.from(new TextEncoder().encode(t)));

  tx.moveCall({
    target: `${packageId}::promptvault::publish`,
    arguments: [
      tx.pure.vector('u8', promptBytes),
      tx.pure.vector('u8', evalBytes),
      tx.pure.vector('u8', titleBytes),
      tx.pure.vector('vector<u8>', tagBytes),
      tx.pure.vector('u8', modelBytes),
      tx.pure.vector('u8', parentBytes),
    ],
  });

  return tx;
}

// Publish using an ephemeral keypair on MAINNET.
// WARNING: This spends real SUI. Only use keys you control on mainnet. Prefer deploying a package
// and using a proper wallet integration for production use.
export async function publishWithPrivateKey(params: {
  privateKey: string; // 0x... 32 or 64 byte hex (MAINNET key — real funds)
  packageId: string;
  promptBlobId: string;
  evalBlobId: string;
  title: string;
  tags: string[];
  targetModel: string;
  parentBlobId?: string | null;
}) {
  const { privateKey, packageId, ...rest } = params;
  if (!packageId) throw new Error('Package ID required for on-chain publish');

  // Support both 0x + 64 char or raw 64 char
  const cleanKey = privateKey.replace(/^0x/, '');
  if (cleanKey.length !== 64) {
    throw new Error('Private key must be 32 bytes (64 hex chars)');
  }

  const keypair = Ed25519Keypair.fromSecretKey(fromHex(cleanKey));
  const client = getSuiClient(); // always mainnet

  const tx = buildPublishTx({ packageId, ...rest });

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return {
    digest: result.digest,
    objectId: result.effects?.created?.[0]?.reference?.objectId,
    events: result.events || [],
  };
}

// Simple helper: just return a "mock" publish record when no package yet (for early demo)
export function createDemoRecord(params: {
  promptBlobId: string;
  evalBlobId: string;
  title: string;
  tags: string[];
  targetModel: string;
  parentBlobId?: string | null;
}) {
  const digest = 'demo_' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return {
    digest,
    objectId: 'demo_obj_' + params.promptBlobId.slice(0, 12),
    isDemo: true as const,
    ...params,
  };
}

// Fetch recent published prompts via events (best for public feed) — MAINNET only
export async function fetchPublishedPrompts(packageId: string, limit = 30) {
  if (!packageId) return [];

  const client = getSuiClient(); // always mainnet
  const eventType = `${packageId}::promptvault::PromptPublished`;

  try {
    const events = await client.queryEvents({
      query: { MoveEventType: eventType },
      limit,
      order: 'descending',
    });

    return (events.data as unknown[]).map((e: unknown) => {
      const ev = e as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = ev.id as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedJson = (ev as any).parsedJson;
      return {
        id: String(id?.txDigest ?? '') + ':' + (id?.eventSeq ?? 0),
        txDigest: id?.txDigest,
        timestamp: ev.timestampMs,
        parsed: parsedJson || ev,
      };
    });
  } catch (e) {
    console.error('Failed to query PromptPublished events', e);
    return [];
  }
}
