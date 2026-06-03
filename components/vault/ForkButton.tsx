'use client';

import Link from 'next/link';
import { GitBranch } from 'lucide-react';

interface ForkButtonProps {
  promptBlobId: string;
  title?: string;
}

export function ForkButton({ promptBlobId, title }: ForkButtonProps) {
  const href = `/submit?fork=${encodeURIComponent(promptBlobId)}`;
  return (
    <Link href={href} className="btn-ghost inline-flex items-center gap-2 text-sm">
      <GitBranch size={16} />
      Fork this prompt
      {title && <span className="text-[var(--ink-muted)]">({title})</span>}
    </Link>
  );
}
