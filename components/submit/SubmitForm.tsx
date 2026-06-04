'use client';

import { useState } from 'react';
import { Evaluation } from '@/lib/openrouter';

interface SubmitFormProps {
  initialPrompt?: string;
  initialTitle?: string;
  initialTags?: string[];
  initialModel?: string;
  parentBlobId?: string | null;
  author?: string;
  onEvaluated: (data: {
    promptBlobId: string;
    evalBlobId: string;
    evaluation: Evaluation;
    title: string;
    prompt: string;
    tags: string[];
    targetModel: string;
    parentBlobId?: string | null;
  }) => void;
}

const MODEL_OPTIONS = [
  'gemini-2.5-flash',
  'claude-3.5-sonnet',
  'gpt-4o',
  'llama-3.1-70b',
  'o3-mini',
];

export function SubmitForm({
  initialPrompt = '',
  initialTitle = '',
  initialTags = [],
  initialModel = 'gemini-2.5-flash',
  parentBlobId = null,
  author,
  onEvaluated,
}: SubmitFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '));
  const [targetModel, setTargetModel] = useState(initialModel);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      setError('Title and prompt are required.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          prompt: prompt.trim(),
          tags,
          targetModel,
          parentBlobId,
          author,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to store prompt');
      }

      onEvaluated({
        promptBlobId: data.promptBlobId,
        evalBlobId: data.evalBlobId,
        evaluation: data.evaluation,
        title: title.trim(),
        prompt: prompt.trim(),
        tags,
        targetModel,
        parentBlobId,
      });
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {parentBlobId && (
        <div className="text-xs px-3 py-2 rounded bg-[var(--gold-dim)] border border-[var(--gold-border)] text-[var(--gold)]">
          Forking from <span className="mono">{parentBlobId}</span>. Your new version will link back to the original.
        </div>
      )}

      <div>
        <label className="form-label">Title</label>
        <input
          className="input"
          placeholder="e.g. Expert Sui Move Auditor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          required
        />
      </div>

      <div>
        <label className="form-label">Target Model</label>
        <select
          className="input model-select"
          value={targetModel}
          onChange={(e) => setTargetModel(e.target.value)}
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Prompt</label>
        <textarea
          className="input font-mono text-sm"
          placeholder="You are a world-class..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <div className="text-xs text-right text-[var(--ink-muted)] mt-1">{prompt.length} chars</div>
      </div>

      <div>
        <label className="form-label">Tags (comma separated)</label>
        <input
          className="input"
          placeholder="code, review, security"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t, i) => (
              <span key={i} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={submitting || !title.trim() || !prompt.trim()}
        className="btn-primary w-full justify-center text-base"
      >
        {submitting ? 'Evaluating with AI + Storing to Walrus…' : 'Evaluate & Store to Walrus'}
      </button>

      <p className="text-[10px] text-center text-[var(--ink-muted)]">
        Your prompt + the AI evaluation will both become immutable Walrus blobs.
      </p>
    </form>
  );
}
