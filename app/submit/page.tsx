'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmitForm } from '@/components/submit/SubmitForm';
import { EvaluationPanel } from '@/components/submit/EvaluationPanel';
import { Evaluation } from '@/lib/openrouter';
import { publishWithPrivateKey, createDemoRecord } from '@/lib/sui';
import { Copy } from 'lucide-react';

interface StoredData {
  promptBlobId: string;
  evalBlobId: string;
  evaluation: Evaluation;
  title: string;
  prompt: string;
  tags: string[];
  targetModel: string;
  parentBlobId?: string | null;
}

// Inner component that safely uses useSearchParams (must be wrapped in Suspense by parent)
function SubmitClient() {
  const searchParams = useSearchParams();
  const forkBlob = searchParams.get('fork');

  const [stored, setStored] = useState<StoredData | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ digest?: string; objectId?: string; isDemo?: boolean } | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [useDemo, setUseDemo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // forkBlob read from search params for parent provenance (mainnet only)

  const handleEvaluated = (data: StoredData) => {
    setStored(data);
    setPublishResult(null);
    setError(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  async function handlePublishToSui() {
    if (!stored) return;
    setPublishing(true);
    setError(null);

    const packageId = process.env.NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID || '';

    try {
      let result;

      if (useDemo || !privateKey || !packageId) {
        // Demo mode (works immediately, no real on-chain tx until package deployed)
        result = createDemoRecord({
          promptBlobId: stored.promptBlobId,
          evalBlobId: stored.evalBlobId,
          title: stored.title,
          tags: stored.tags,
          targetModel: stored.targetModel,
          parentBlobId: stored.parentBlobId || null,
        });
      } else {
        result = await publishWithPrivateKey({
          privateKey,
          packageId,
          promptBlobId: stored.promptBlobId,
          evalBlobId: stored.evalBlobId,
          title: stored.title,
          tags: stored.tags,
          targetModel: stored.targetModel,
          parentBlobId: stored.parentBlobId || null,
        });
      }

      setPublishResult(result);
    } catch (e: unknown) {
      setError((e as Error).message || 'Publish failed. Check your key / package ID.');
    } finally {
      setPublishing(false);
    }
  }

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="uppercase text-xs tracking-[2px] text-[var(--gold)] mb-1">CONTRIBUTE</div>
        <h1 className="text-5xl font-semibold tracking-[-0.5px]">Publish a Prompt</h1>
        <p className="mt-2 text-[var(--ink-secondary)]">AI-evaluated. Walrus-stored. Sui-anchored.</p>
      </div>

      {!stored ? (
        <div className="card p-8">
          <SubmitForm
            parentBlobId={forkBlob}
            onEvaluated={handleEvaluated}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Success + blobs */}
          <div className="surface p-6 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">✓ STORED ON WALRUS</div>
            <div className="text-xl font-medium mb-4">Prompt + Evaluation saved as immutable blobs</div>

            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between bg-[var(--void-02)] p-3 rounded">
                <span className="text-[var(--ink-muted)]">Prompt Blob ID</span>
                <div className="flex items-center gap-2">
                  <span className="mono text-[var(--gold)]">{stored.promptBlobId}</span>
                  <button onClick={() => copy(stored.promptBlobId)} className="copy-btn"><Copy size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-[var(--void-02)] p-3 rounded">
                <span className="text-[var(--ink-muted)]">Eval Blob ID</span>
                <div className="flex items-center gap-2">
                  <span className="mono text-[var(--gold)]">{stored.evalBlobId}</span>
                  <button onClick={() => copy(stored.evalBlobId)} className="copy-btn"><Copy size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation */}
          <EvaluationPanel evaluation={stored.evaluation} originalPrompt={stored.prompt} />

          {/* On-chain publish step */}
          <div className="surface p-6 rounded-xl">
            <div className="uppercase tracking-widest text-xs text-[var(--gold)] mb-2">STEP 2 — ANCHOR ON SUI</div>
            <h3 className="text-xl mb-4">Write the record to the chain (immutable proof + provenance)</h3>

            <div className="mb-4 text-sm text-[var(--ink-secondary)]">
              This creates a <span className="mono">PromptRecord</span> object (or emits a <span className="mono">PromptPublished</span> event) pointing to your two Walrus blobs.
              Deploy the Move module in <span className="mono">/contracts</span> first for real txs.
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
                Use demo mode (no private key needed)
              </label>
            </div>

            {!useDemo && (
              <div className="mb-4">
                <label className="form-label">Mainnet Private Key (0x... — real SUI will be spent)</label>
                <input
                  type="password"
                  className="input font-mono"
                  placeholder="0x..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">⚠ MAINNET ONLY. This will create real on-chain records and consume real SUI gas. Use at your own risk.</div>
              </div>
            )}

            <button
              onClick={handlePublishToSui}
              disabled={publishing}
              className="btn-primary w-full"
            >
              {publishing ? 'Publishing to Sui...' : (useDemo ? 'Record Demo On-Chain Entry' : 'Sign & Publish with Key')}
            </button>

            {error && <div className="text-red-400 mt-3 text-sm">{error}</div>}

            {publishResult && (
              <div className="mt-5 p-4 bg-[var(--void-02)] border border-[var(--gold-border)] rounded text-sm space-y-2">
                <div className="text-[var(--gold)]">✓ RECORD ANCHORED</div>
                <div><span className="text-[var(--ink-muted)]">Digest:</span> <span className="mono">{publishResult?.digest ?? ''}</span></div>
                {publishResult?.objectId && <div><span className="text-[var(--ink-muted)]">Object:</span> <span className="mono">{publishResult.objectId}</span></div>}
                {publishResult?.isDemo && <div className="text-[var(--ink-muted)] text-xs">Demo record — view real txs after you deploy the package and use a real key.</div>}

                <div className="pt-2">
                  <a
                    href={`https://suiscan.xyz/tx/${publishResult?.digest ?? ''}`}
                    target="_blank"
                    className="underline text-[var(--gold)] text-xs"
                    rel="noreferrer"
                  >
                    View on SuiScan (mainnet) →
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <a href="/vault" className="btn-ghost">← Back to the Vault</a>
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
