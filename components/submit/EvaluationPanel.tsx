'use client';

import { Evaluation } from '@/lib/openrouter';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface EvaluationPanelProps {
  evaluation: Evaluation | null;
  loading?: boolean;
  originalPrompt?: string;
}

export function EvaluationPanel({ evaluation, loading, originalPrompt }: EvaluationPanelProps) {
  if (loading) {
    return (
      <div className="surface p-6 rounded-xl">
        <div className="flex items-center gap-3 text-sm">
          <div className="spinner" />
          <span>AI Evaluator is scoring your prompt…</span>
        </div>
      </div>
    );
  }

  if (!evaluation) return null;

  const { clarity, model_fit, structure, score_overall, prompt_type, weaknesses, recommended_models, improved_prompt, one_line_verdict } = evaluation;

  return (
    <div className="surface p-6 rounded-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--ink-muted)] tracking-widest">AI EVALUATION</div>
          <div className="text-xl font-semibold">Score: {score_overall}/100</div>
        </div>
        <ScoreBadge evaluation={evaluation} />
      </div>

      <div className="text-[var(--ink-secondary)] text-sm">{one_line_verdict}</div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Clarity', val: clarity },
          { label: 'Model Fit', val: model_fit },
          { label: 'Structure', val: structure },
        ].map((m) => (
          <div key={m.label} className="p-3 bg-[var(--void-02)] rounded-lg border border-[var(--void-border)]">
            <div className="text-xs text-[var(--ink-muted)]">{m.label}</div>
            <div className="text-2xl font-semibold text-[var(--gold)] mt-1">{m.val}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="form-label">Prompt Type</div>
        <div className="tag">{prompt_type}</div>
      </div>

      {weaknesses?.length > 0 && (
        <div>
          <div className="form-label mb-2">Weaknesses</div>
          <ul className="list-disc pl-5 text-sm space-y-1 text-[var(--ink-secondary)]">
            {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {recommended_models?.length > 0 && (
        <div>
          <div className="form-label mb-1.5">Recommended Models</div>
          <div className="flex flex-wrap gap-2">
            {recommended_models.map((m, i) => (
              <span key={i} className="tag">{m}</span>
            ))}
          </div>
        </div>
      )}

      {improved_prompt && improved_prompt !== originalPrompt && (
        <div>
          <div className="form-label mb-2">Improved Prompt (suggested)</div>
          <div className="p-4 bg-[var(--void)] border border-[var(--void-border)] rounded-lg text-sm whitespace-pre-wrap font-mono">
            {improved_prompt}
          </div>
        </div>
      )}
    </div>
  );
}
