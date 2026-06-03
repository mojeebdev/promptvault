// app/api/evaluate/route.ts
// Standalone evaluate endpoint (optional, store route already evaluates)

import { NextRequest, NextResponse } from 'next/server';
import { evaluatePrompt } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { prompt, targetModel } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }
    const evaluation = await evaluatePrompt(prompt, targetModel);
    return NextResponse.json({ evaluation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Evaluation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
