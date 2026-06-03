'use client';

import { Evaluation } from '@/lib/openrouter';

interface ScoreBadgeProps {
  evaluation: Evaluation | null;
  size?: 'sm' | 'md';
}

export function ScoreBadge({ evaluation, size = 'md' }: ScoreBadgeProps) {
  if (!evaluation) return null;

  const score = evaluation.score_overall;
  let cls = 'score-badge score-low';
  if (score >= 85) cls = 'score-badge score-high';
  else if (score >= 65) cls = 'score-badge score-mid';

  const label = size === 'sm' ? `${score}` : `${score} / 100`;

  return (
    <span className={cls} title={evaluation.one_line_verdict}>
      {label}
      {size === 'md' && (
        <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 4 }}>
          overall
        </span>
      )}
    </span>
  );
}
