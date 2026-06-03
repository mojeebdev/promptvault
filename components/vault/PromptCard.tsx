'use client';

import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Evaluation } from '@/lib/openrouter';
import { Copy } from 'lucide-react';

interface PromptCardProps {
  id: string;
  promptBlobId: string;
  title: string;
  tags: string[];
  targetModel: string;
  score?: number;
  oneLineVerdict?: string;
  txDigest?: string;
  parentBlobId?: string | null;
  isDemo?: boolean;
  evaluation?: Evaluation | null;
}

export function PromptCard(props: PromptCardProps) {
  const {
    promptBlobId,
    title,
    tags = [],
    targetModel,
    score,
    oneLineVerdict,
    txDigest,
    parentBlobId,
    isDemo,
  } = props;

  const detailHref = `/prompt/${encodeURIComponent(promptBlobId)}`;

  const copy = async (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(text);
    // simple feedback
    const orig = (e?.currentTarget as HTMLElement)?.textContent;
    if (e?.currentTarget) (e.currentTarget as HTMLElement).textContent = 'copied';
    setTimeout(() => {
      if (e?.currentTarget) (e.currentTarget as HTMLElement).textContent = orig || 'copy';
    }, 1200);
  };

  return (
    <Link href={detailHref} className="prompt-card block">
      <div className="card p-5 h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[21px] leading-tight font-semibold tracking-[-0.01em] mb-1.5">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
              <span>{targetModel}</span>
              {parentBlobId && <span className="tag">fork</span>}
              {isDemo && <span className="tag">demo</span>}
            </div>
          </div>
          {score !== undefined && (
            <ScoreBadge
              evaluation={{ score_overall: score ?? 0, one_line_verdict: oneLineVerdict || '' } as import('@/lib/openrouter').Evaluation}
            />
          )}
        </div>

        {oneLineVerdict && (
          <p className="mt-3 text-sm text-[var(--ink-secondary)] line-clamp-2">
            {oneLineVerdict}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
          <div className="flex items-center gap-2">
            <span className="mono">blob:{promptBlobId.slice(0, 10)}…</span>
            <button
              onClick={(e) => copy(promptBlobId, e)}
              className="copy-btn"
              title="Copy blob ID"
            >
              <Copy size={12} />
            </button>
          </div>

          {txDigest && (
            <span className="mono">tx:{txDigest.slice(0, 8)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
