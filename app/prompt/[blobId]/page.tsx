import { retrieveJSON } from '@/lib/walrus';
import { ForkButton } from '@/components/vault/ForkButton';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import type { Evaluation } from '@/lib/openrouter';
import Link from 'next/link';

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
    error = (e as Error).message || 'Failed to load blob from Walrus';
  }

  // If we have an eval blob id reference we can try to fetch it too
  if (evalBlobId) {
    try {
      const ev = await retrieveJSON<Record<string, unknown>>(evalBlobId);
      evalData = ev as unknown as EvalData; // shape matches Evaluation for UI
    } catch {}
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12">
      <Link href="/vault" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink-primary)]">← Back to Vault</Link>

      {error && (
        <div className="mt-8 p-6 surface text-red-400">Error loading prompt: {error}. It may be a demo seed.</div>
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
              <div className="uppercase text-xs tracking-widest text-[var(--gold)] mb-2">AI EVALUATION (stored on Walrus)</div>
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

          <div className="mt-8 flex flex-wrap gap-3">
            <ForkButton promptBlobId={blobId} title={promptData.title} />
            <Link href="/submit" className="btn-ghost">Submit another prompt</Link>
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
