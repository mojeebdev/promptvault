// lib/openrouter.ts
// AI Evaluator via OpenRouter (Gemini 2.5 Flash Lite primary, fallbacks available)

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export interface Evaluation {
  clarity: number;
  model_fit: number;
  structure: number;
  prompt_type: string;
  recommended_models: string[];
  weaknesses: string[];
  improved_prompt: string;
  score_overall: number;
  one_line_verdict: string;
}

const SYSTEM_PROMPT = `You are PromptVault's AI Evaluator — a senior prompt engineer with deep expertise 
in crafting high-performance prompts for large language models including Gemini, 
Claude, GPT-4o, and Llama variants.

Your job is to receive a raw AI prompt submitted by a user and return a structured 
evaluation JSON. You do NOT chat. You do NOT add preamble. You return ONLY valid JSON.

Evaluate the prompt across these dimensions:

1. clarity (0-100): Is the instruction unambiguous and specific?
2. model_fit (0-100): Is it well-suited to the stated target model?
3. structure (0-100): Does it have proper context, instruction, and output format?
4. prompt_type: one of ["system", "user", "chain", "meta", "tool-call", "zero-shot", "few-shot"]
5. recommended_models: array of 1-3 model names this prompt performs best on
6. weaknesses: array of 2-3 short strings identifying what's missing or weak
7. improved_prompt: a rewritten version of the prompt that scores higher across all dimensions
8. score_overall: weighted average score (clarity 40%, model_fit 30%, structure 30%)
9. one_line_verdict: a single sentence summarizing the prompt's quality and purpose

Return format — strictly this JSON shape, nothing else, no markdown, no backticks:
{
  "clarity": 0,
  "model_fit": 0,
  "structure": 0,
  "prompt_type": "",
  "recommended_models": [],
  "weaknesses": [],
  "improved_prompt": "",
  "score_overall": 0,
  "one_line_verdict": ""
}

Target model for this session: {{TARGET_MODEL}}`;

export async function evaluatePrompt(rawPrompt: string, targetModel: string = 'gemini-2.5-flash'): Promise<Evaluation> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const systemPrompt = SYSTEM_PROMPT.replace('{{TARGET_MODEL}}', targetModel);

  // Primary + fallbacks using currently available free models on OpenRouter (as of mid-2026).
  // Primary remains google/gemini-2.5-flash-lite per project spec (the one used for the master system prompt).
  // Free models on OpenRouter are rate-limited and can be flaky (timeouts, temporary unavailability).
  // Multiple fallbacks + the store route now has a default evaluation so submits don't hard-fail.
  const models = [
    'google/gemini-2.5-flash-lite',
    'google/gemma-4-31b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'deepseek/deepseek-chat-v3-0324:free',
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout (free models can be slow)

      const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://promptvault.vercel.app',
          'X-Title': 'PromptVault',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenRouter ${model} failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const text: string = data.choices?.[0]?.message?.content || '';

      // Clean possible markdown fences
      const clean = text.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(clean) as Partial<Evaluation>;

      // Basic validation + defaults
      const evaluation: Evaluation = {
        clarity: Math.max(0, Math.min(100, Math.round(parsed.clarity || 0))),
        model_fit: Math.max(0, Math.min(100, Math.round(parsed.model_fit || 0))),
        structure: Math.max(0, Math.min(100, Math.round(parsed.structure || 0))),
        prompt_type: parsed.prompt_type || 'user',
        recommended_models: Array.isArray(parsed.recommended_models) ? parsed.recommended_models.slice(0, 3) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 3) : [],
        improved_prompt: parsed.improved_prompt || rawPrompt,
        score_overall: Math.max(0, Math.min(100, Math.round(parsed.score_overall || 0))),
        one_line_verdict: parsed.one_line_verdict || 'Solid prompt with room to improve.',
      };

      // Compute score_overall if not provided or suspicious
      if (!parsed.score_overall || evaluation.score_overall === 0) {
        evaluation.score_overall = Math.round(
          (evaluation.clarity * 0.4) + (evaluation.model_fit * 0.3) + (evaluation.structure * 0.3)
        );
      }

      return evaluation;
    } catch (err) {
      if (timeout) clearTimeout(timeout);
      lastError = err as Error;
      console.warn(`[openrouter] ${model} failed, trying next fallback...`, err);
      continue;
    }
  }

  throw new Error(`AI evaluation failed: ${lastError?.message || 'All models exhausted'}`);
}
