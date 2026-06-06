'use client';

import { Copy } from 'lucide-react';

interface BlobIdsProps {
  promptBlobId: string;
  evalBlobId?: string | null;
}

export function BlobIds({ promptBlobId, evalBlobId }: BlobIdsProps) {
  const copy = async (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(text);
    const btn = e.currentTarget;
    const orig = btn.textContent;
    btn.textContent = 'copied';
    setTimeout(() => {
      if (btn) btn.textContent = orig || 'copy';
    }, 1200);
  };

  return (
    <div className="mt-6 p-4 bg-[var(--void-02)] rounded-xl border border-[var(--gold-border)]">
      <div className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)] mb-3">Blob IDs</div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[var(--ink-muted)] w-14 shrink-0">Prompt:</span>
          <span className="mono text-[var(--gold)] break-all flex-1">{promptBlobId}</span>
          <button
            onClick={(e) => copy(promptBlobId, e)}
            className="copy-btn text-xs px-2 py-0.5"
          >
            copy
          </button>
        </div>
        {evalBlobId && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--ink-muted)] w-14 shrink-0">Eval:</span>
            <span className="mono text-[var(--gold)] break-all flex-1">{evalBlobId}</span>
            <button
              onClick={(e) => copy(evalBlobId, e)}
              className="copy-btn text-xs px-2 py-0.5"
            >
              copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
