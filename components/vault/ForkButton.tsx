'use client';

import Link from 'next/link';
import { GitBranch } from 'lucide-react';

interface ForkButtonProps {
  promptBlobId: string;
  title?: string;
  className?: string;
}

export function ForkButton({ promptBlobId, title, className = "" }: ForkButtonProps & { className?: string }) {
  const href = `/submit?fork=${encodeURIComponent(promptBlobId)}`;
  return (
    <Link href={href} className={`btn-ghost inline-flex items-center gap-2 text-sm ${className}`}>
      <GitBranch size={16} />
      Fork this prompt
      {title && <span className="text-[var(--ink-muted)]">({title})</span>}
    </Link>
  );
}
