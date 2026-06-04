'use client';

import { useEffect, useState } from 'react';
import { PromptCard } from './PromptCard';

interface PromptItem {
  id: string;
  promptBlobId: string;
  title: string;
  tags: string[];
  targetModel: string;
  score?: number;
  oneLineVerdict?: string;
  parentBlobId?: string | null;
  author?: string | null;
  isDemo?: boolean;
}

export function PromptFeed() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/prompts');
        const data = await res.json();
        setPrompts(data.prompts || []);
        setIsDemo(!!data.isDemo);
      } catch (e) {
        console.error(e);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="spinner" />
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--ink-secondary)]">
        No prompts yet. Be the first to publish one.
      </div>
    );
  }

  return (
    <>
      {isDemo && (
        <div className="mb-4 text-xs px-3 py-1.5 rounded bg-[var(--gold-dim)] border border-[var(--gold-border)] text-[var(--gold)] inline-block">
          Demo data — real entries from Firestore + Walrus will appear once prompts are submitted.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((p) => (
          <PromptCard key={p.id} {...p} />
        ))}
      </div>
    </>
  );
}
