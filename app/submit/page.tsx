'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmitForm } from '@/components/submit/SubmitForm';
import { EvaluationPanel } from '@/components/submit/EvaluationPanel';
import { Evaluation } from '@/lib/openrouter';
import { Copy, Plus } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface StoredData {
  promptBlobId: string;
  evalBlobId: string | null;
  evaluation: Evaluation;
  title: string;
  prompt: string;
  tags: string[];
  targetModel: string;
  parentBlobId?: string | null;
  walrusFailed?: boolean;
}

// Inner component that safely uses useSearchParams (must be wrapped in Suspense by parent)
function SubmitClient() {
  const searchParams = useSearchParams();
  const forkBlob = searchParams.get('fork');
  const account = useCurrentAccount();

  const [stored, setStored] = useState<StoredData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluated = (data: StoredData) => {
    setStored(data);
    setError(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12" style={{ backgroundColor: 'rgba(10,10,11,0.05)', borderRadius: '12px', position: 'relative', zIndex: 1 }}>
      <div className="mb-8">
        <div className="uppercase text-xs tracking-[2px] text-[var(--gold)] mb-1">CONTRIBUTE</div>
        <h1 className="text-5xl font-semibold tracking-[-0.5px]">Publish a Prompt</h1>
        <p className="mt-2 text-[var(--ink-secondary)]">AI-evaluated. Walrus-stored. Indexed in Firestore for the public vault.</p>
      </div>

      {!stored ? (
        account ? (
          <div className="card p-8">
            <SubmitForm
              parentBlobId={forkBlob}
              author={account.address}
              onEvaluated={handleEvaluated}
            />
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-lg mb-4">Connect your Sui wallet to submit a prompt.</p>
            <p className="text-sm text-[var(--ink-muted)]">Browsing the vault is public. Submitting requires a connected wallet on Sui mainnet.</p>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {/* Success + blobs */}
          <div className="surface p-6 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
              {stored.walrusFailed ? '✓ SAVED (Walrus fallback)' : '✓ STORED ON WALRUS + FIRESTORE'}
            </div>
            <div className="text-xl font-medium mb-4">
              {stored.walrusFailed
                ? 'Prompt + Evaluation saved to reliable metadata (Firestore). We will switch to a paid, reliable Walrus publisher after the hackathon and backfill all fallback records.'
                : 'Prompt + Evaluation saved as immutable Walrus blobs. Metadata indexed for the public vault feed.'}
            </div>

            {!stored.walrusFailed && stored.promptBlobId && stored.evalBlobId && (
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between bg-[var(--void-02)] p-3 rounded">
                  <span className="text-[var(--ink-muted)]">Prompt Blob ID</span>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[var(--gold)]">{stored.promptBlobId}</span>
                    <button onClick={() => copy(stored.promptBlobId)} className="copy-btn"><Copy size={14} /></button>
                    <a href={`https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${stored.promptBlobId}`} target="_blank" className="text-xs text-[var(--gold)] underline">view blob</a>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[var(--void-02)] p-3 rounded">
                  <span className="text-[var(--ink-muted)]">Eval Blob ID</span>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[var(--gold)]">{stored.evalBlobId}</span>
                    <button onClick={() => copy(stored.evalBlobId!)} className="copy-btn"><Copy size={14} /></button>
                    <a href={`https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${stored.evalBlobId}`} target="_blank" className="text-xs text-[var(--gold)] underline">view blob</a>
                  </div>
                </div>
              </div>
            )}

            {stored.walrusFailed && (
              <div className="text-sm text-[var(--ink-muted)]">
                The full prompt and evaluation are preserved in the public vault. We plan to migrate everything to a paid, reliable
                Walrus publisher after the hackathon.
              </div>
            )}
          </div>

          {/* Evaluation */}
          <EvaluationPanel evaluation={stored.evaluation} originalPrompt={stored.prompt} />

          <div className="mt-8 p-4 bg-[var(--void-02)] rounded-xl border border-[var(--gold-border)] text-center">
            <div className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)] mb-3">Next steps</div>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/vault" className="btn-primary">View in the Vault →</a>
              <a href="/submit" className="btn-ghost inline-flex items-center gap-2">
                <Plus size={16} />
                Submit another prompt
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default export must wrap the hook-using component in Suspense
// (required by Next.js when using useSearchParams during static prerender)
export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-[820px] mx-auto px-6 py-12 text-[var(--ink-muted)]">Loading submit form...</div>}>
      <SubmitClient />
    </Suspense>
  );
}
