import { PromptFeed } from '@/components/vault/PromptFeed';
import Link from 'next/link';

export const metadata = {
  title: 'The Vault — PromptVault',
  description: 'Browse all AI prompts stored as immutable Walrus blobs on Sui.',
};

export default function VaultPage() {
  return (
    <div className="bg-dot-grid min-h-[calc(100vh-var(--nav-height))]">
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-20 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="uppercase tracking-[3px] text-xs text-[var(--gold)] mb-2">PUBLIC REGISTRY</div>
            <h1 className="text-6xl font-semibold tracking-[-1px]">The Vault</h1>
          </div>
          <Link href="/submit" className="btn-primary hidden sm:inline-flex">Publish New Prompt</Link>
        </div>

        <p className="max-w-md text-[var(--ink-secondary)] mb-8">
          Every entry is a Walrus blob + an on-chain record on Sui. Fork any prompt to build on the collective intelligence.
        </p>

        <PromptFeed />

        <div className="mt-10 text-center">
          <Link href="/submit" className="btn-ghost">Submit your own prompt →</Link>
        </div>
      </div>
    </div>
  );
}
