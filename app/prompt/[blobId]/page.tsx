import { retrieveJSON } from '@/lib/walrus';
import { ForkButton } from '@/components/vault/ForkButton';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import type { Evaluation } from '@/lib/openrouter';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PromptData {
  title: string;
  prompt: string;
  tags?: string[];
  targetModel?: string;
  parentBlobId?: string | null;
  createdAt?: number;
}

interface EvalData {
  clarity: number;
  model_fit: number;
  structure: number;
  score_overall: number;
  one_line_verdict: string;
  prompt_type?: string;
  weaknesses?: string[];
  improved_prompt?: string;
  recommended_models?: string[];
}

export const dynamic = 'force-dynamic';

export default async function PromptDetailPage({ params }: { params: Promise<{ blobId: string }> }) {
  const { blobId } = await params;

  let promptData: PromptData | null = null;
  let evalData: EvalData | null = null;
  let evalBlobId: string | null = null;
  let error: string | null = null;

  let isFallback = false;

  try {
    // Retrieve the original prompt blob
    const rawPrompt = await retrieveJSON<Record<string, unknown>>(blobId);
    promptData = {
      title: (rawPrompt.title as string) || 'Untitled',
      prompt: (rawPrompt.prompt as string) || '',
      tags: (rawPrompt.tags as string[]) || [],
      targetModel: rawPrompt.targetModel as string | undefined,
      parentBlobId: rawPrompt.parentBlobId as string | null | undefined,
      createdAt: rawPrompt.createdAt as number | undefined,
    };

    // Try to find the matching eval blob (the store route stores eval with promptBlobId inside)
    // In practice the detail page would be passed both ids or we store a pointer.
    // For this build we try a convention: if the blob contains an evalBlobId reference, use it.
    if (rawPrompt.evalBlobId) {
      evalBlobId = rawPrompt.evalBlobId as string;
    }
  } catch (e: unknown) {
    // Walrus retrieve failed — this param might be a Firestore fallback id (when community publishers were down)
    error = null; // we'll try fallback
  }

  // Firestore fallback: load embedded full content if Walrus path failed or no data
  if (!promptData && isFirebaseConfigured && db) {
    try {
      // Try direct doc by id (for fallback links that used the firestore doc.id)
      const direct = await getDoc(doc(db, 'prompts', blobId));
      if (direct.exists()) {
        const d = direct.data() as any;
        promptData = {
          title: d.title || 'Untitled',
          prompt: d.prompt || '',
          tags: d.tags || [],
          targetModel: d.targetModel,
          parentBlobId: d.parentBlobId || null,
          createdAt: d.createdAt?.toMillis?.() || undefined,
        };
        if (d.evaluation) {
          evalData = d.evaluation as EvalData;
        }
        isFallback = true;
      } else {
        // Try to find a doc that has this as its promptBlobId (rare fallback case)
        // For simplicity we skip complex query here; the direct id case covers the main fallback path.
      }
    } catch (fbErr) {
      // ignore
    }
  }

  // If we have an eval blob id reference we can try to fetch it too (only for real Walrus path)
  if (evalBlobId && !isFallback) {
    try {
      const ev = await retrieveJSON<Record<string, unknown>>(evalBlobId);
      evalData = ev as unknown as EvalData; // shape matches Evaluation for UI
    } catch {}
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12" style={{ backgroundColor: 'rgba(10,10,11,0.05)', borderRadius: '12px', position: 'relative', zIndex: 1 }}>
      <Link href="/vault" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink-primary)]">← Back to Vault</Link>

      {error && (
        <div className="mt-8 p-6 surface text-red-400">Error loading prompt: {error}. It may be a demo seed.</div>
      )}

      {isFallback && (
        <div className="mt-4 p-3 rounded bg-amber-900/20 border border-amber-800 text-amber-400 text-sm">
          This prompt was saved using our Firestore fallback because community Walrus publishers were temporarily unavailable.
          The full content and evaluation are safely stored. We plan to switch to a paid, reliable publisher after the hackathon
          and will backfill all fallback records to real immutable Walrus blobs.
        </div>
      )}

      {promptData && (
        <>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-semibold tracking-[-0.5px]">{promptData.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {promptData.targetModel && <span className="tag">{promptData.targetModel}</span>}
                {promptData.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
                {promptData.parentBlobId && <span className="tag">fork of {promptData.parentBlobId.slice(0, 8)}…</span>}
              </div>
            </div>
            {evalData && <ScoreBadge evaluation={evalData as Evaluation} />}
          </div>

          <div className="mt-8 surface p-6 rounded-xl">
            <div className="uppercase text-xs tracking-widest text-[var(--ink-muted)] mb-2">THE PROMPT</div>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--ink-primary)]">{promptData.prompt}</pre>
          </div>

          {evalData && (
            <div className="mt-6">
              <div className="uppercase text-xs tracking-widest text-[var(--gold)] mb-2">
                AI EVALUATION {isFallback ? '(from metadata fallback)' : '(stored on Walrus)'}
              </div>
              <div className="surface p-6 rounded-xl space-y-4">
                <div className="text-lg">{evalData.one_line_verdict}</div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { l: 'Clarity', v: evalData.clarity },
                    { l: 'Model Fit', v: evalData.model_fit },
                    { l: 'Structure', v: evalData.structure },
                  ].map((x) => (
                    <div key={x.l} className="p-4 bg-[var(--void-02)] rounded text-center">
                      <div className="text-xs text-[var(--ink-muted)]">{x.l}</div>
                      <div className="text-3xl mt-1 text-[var(--gold)]">{x.v}</div>
                    </div>
                  ))}
                </div>

                {evalData.weaknesses && evalData.weaknesses.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--ink-muted)] mb-1">WEAKNESSES</div>
                    <ul className="list-disc pl-5 text-sm text-[var(--ink-secondary)] space-y-0.5">
                      {evalData.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {evalData.improved_prompt && (
                  <div>
                    <div className="text-xs text-[var(--ink-muted)] mb-1">IMPROVED VERSION</div>
                    <pre className="p-4 bg-[var(--void)] text-xs whitespace-pre-wrap font-mono border border-[var(--void-border)] rounded">{evalData.improved_prompt}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-[var(--void-02)] rounded-xl border border-[var(--gold-border)]">
            <div className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)] mb-3">Actions</div>
            <div className="flex flex-wrap gap-3">
              <ForkButton promptBlobId={blobId} title={promptData.title} className="text-[var(--gold)]" />
              <Link href="/submit" className="btn-ghost inline-flex items-center gap-2">
                <Plus size={16} />
                Submit another prompt
              </Link>
              {isFallback && (
                <form action="/api/retry-walrus" method="POST" className="inline">
                  <input type="hidden" name="id" value={blobId} />
                  <button type="submit" className="btn-ghost inline-flex items-center gap-2 text-[var(--gold)]">
                    <RefreshCw size={16} />
                    Retry storing to Walrus
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-10 text-[10px] text-[var(--ink-muted)] mono break-all">
            Blob ID: {blobId}
            {evalBlobId && <> · Eval Blob: {evalBlobId}</>}
          </div>
        </>
      )}

      {!promptData && !error && (
        <div className="mt-12 text-[var(--ink-secondary)]">Loading prompt from Walrus…</div>
      )}
    </div>
  );
}
