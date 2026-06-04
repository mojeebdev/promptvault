// app/api/prompts/route.ts
// Returns the public feed from Firebase Firestore metadata.
// Enriches with Walrus blob data for title etc. if needed.

import { NextResponse } from 'next/server';
import { retrieveJSON } from '@/lib/walrus';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
  parentBlobId?: string | null;
  author?: string | null;
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
    parentBlobId: 'demo_blob_prompt_001',
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
    isDemo: true,
  },
];

export async function GET() {
  try {
    if (isFirebaseConfigured && db) {
      const promptsCol = collection(db, 'prompts');
      const q = query(promptsCol, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      const items: FeedItem[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as any;
        const promptBlobId = data.promptBlobId;
        let title = data.title || 'Untitled Prompt';
        const tags: string[] = data.tags || [];
        let score: number | undefined;
        let verdict: string | undefined;
        let targetModel = data.targetModel || 'unknown';

        // Enrich from Walrus blob if metadata incomplete (best effort)
        if (!data.title && promptBlobId) {
          try {
            const blobData = await retrieveJSON<any>(promptBlobId);
            title = blobData.title || title;
            targetModel = blobData.targetModel || targetModel;
          } catch (e) {
            // ignore
          }
        }

        // If evalBlobId, could enrich score but skip for perf, or fetch if needed
        if (data.evalBlobId) {
          try {
            const evalData = await retrieveJSON<any>(data.evalBlobId);
            score = evalData.score_overall;
            verdict = evalData.one_line_verdict;
          } catch {}
        }

        items.push({
          id: doc.id,
          promptBlobId,
          evalBlobId: data.evalBlobId,
          title,
          tags,
          targetModel,
          score,
          oneLineVerdict: verdict,
          parentBlobId: data.parentBlobId || null,
          author: data.author || null,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        });
      }

      return NextResponse.json({ prompts: items });
    }
  } catch (e) {
    console.warn('Firestore feed fetch failed, using demo seeds', e);
  }

  // Fallback demo seeds so the vault is never empty during development / early judging
  return NextResponse.json({ prompts: DEMO_SEEDS, isDemo: true });
}
