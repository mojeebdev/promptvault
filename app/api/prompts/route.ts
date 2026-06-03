// app/api/prompts/route.ts
// Returns the public feed. Tries on-chain events first (if package configured), falls back to demo seeds.

import { NextResponse } from 'next/server';
import { retrieveJSON } from '@/lib/walrus';
import { DEFAULT_PACKAGE_ID } from '@/lib/tatum';
import { fetchPublishedPrompts } from '@/lib/sui';

export const dynamic = 'force-dynamic';

interface FeedItem {
  id: string;
  promptBlobId: string;
  evalBlobId?: string;
  title: string;
  tags: string[];
  targetModel: string;
  score?: number;
  oneLineVerdict?: string;
  txDigest?: string;
  parentBlobId?: string | null;
  createdAt?: number;
  isDemo?: boolean;
}

const DEMO_SEEDS: FeedItem[] = [
  {
    id: 'demo-1',
    promptBlobId: 'demo_blob_prompt_001',
    evalBlobId: 'demo_blob_eval_001',
    title: 'Expert Code Reviewer',
    tags: ['code', 'review', 'typescript'],
    targetModel: 'claude-3.5-sonnet',
    score: 92,
    oneLineVerdict: 'Excellent structured prompt for consistent, actionable code reviews.',
    txDigest: 'demo_tx_92f3a1',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    isDemo: true,
  },
  {
    id: 'demo-2',
    promptBlobId: 'demo_blob_prompt_002',
    evalBlobId: 'demo_blob_eval_002',
    title: 'Sui Move Auditor',
    tags: ['sui', 'move', 'security'],
    targetModel: 'gemini-2.5-flash',
    score: 87,
    oneLineVerdict: 'Strong domain-specific auditor prompt with clear output schema.',
    txDigest: 'demo_tx_7c9e2b',
    parentBlobId: 'demo_blob_prompt_001',
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
    isDemo: true,
  },
];

export async function GET() {
  const packageId = process.env.NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID || DEFAULT_PACKAGE_ID;

  try {
    if (packageId) {
      // Real on-chain path (mainnet only)
      const events = await fetchPublishedPrompts(packageId, 50);

      const items: FeedItem[] = [];

      for (const ev of events) {
        const p = ev.parsed || {};
        // Try to enrich from the blobs if we can (best effort, non-blocking)
        let title = p.title || 'Untitled Prompt';
        const tags: string[] = [];
        let score: number | undefined;
        let verdict: string | undefined;
        const promptBlob: string = p.prompt_blob_id || '';

        // If we have the blob ids embedded or can guess, try retrieve (may be slow for many)
        // For production we'd store more in the event or have an indexer.
        try {
          if (promptBlob && !promptBlob.startsWith('demo')) {
            const data = await retrieveJSON<Record<string, unknown>>(promptBlob);
            title = (data.title as string) || title;
            // tags = (data.tags as string[]) || [];
          }
        } catch {}

        items.push({
          id: ev.id,
          promptBlobId: promptBlob || p.prompt_blob_id,
          title,
          tags,
          targetModel: p.target_model || 'unknown',
          score,
          oneLineVerdict: verdict,
          txDigest: ev.txDigest,
          parentBlobId: p.parent_blob_id,
          createdAt: ev.timestamp ? Number(ev.timestamp) : undefined,
        });
      }

      if (items.length > 0) return NextResponse.json({ prompts: items });
    }
  } catch (e) {
    console.warn('On-chain feed fetch failed, using demo seeds', e);
  }

  // Fallback demo seeds so the vault is never empty during development / early judging
  return NextResponse.json({ prompts: DEMO_SEEDS, isDemo: true });
}
