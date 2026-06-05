// app/api/store/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeBlob } from '@/lib/walrus';
import { evaluatePrompt } from '@/lib/openrouter';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { title, prompt, tags, targetModel, parentBlobId, author } = await req.json();

    if (!prompt || !title) {
      return NextResponse.json({ error: 'Missing required fields (title, prompt)' }, { status: 400 });
    }

    // 1. Evaluate prompt with AI (this is the creative meta layer)
    // OpenRouter free models can be flaky (timeouts, rate limits, model churn).
    // If it fails we still allow the submit using a reasonable default evaluation.
    let evaluation: Awaited<ReturnType<typeof evaluatePrompt>>;
    try {
      evaluation = await evaluatePrompt(prompt, targetModel || 'gemini-2.5-flash');
    } catch (evalErr) {
      console.warn('[store] AI evaluation failed, using fallback defaults:', evalErr);
      evaluation = {
        clarity: 60,
        model_fit: 50,
        structure: 55,
        prompt_type: 'user',
        recommended_models: [targetModel || 'gemini-2.5-flash'],
        weaknesses: ['Evaluation service temporarily unavailable'],
        improved_prompt: prompt,
        score_overall: 55,
        one_line_verdict: 'Prompt submitted successfully; AI evaluation unavailable at this time.',
      };
    }

    // 2. Store original prompt as Walrus blob
    const promptPayload = JSON.stringify({
      title,
      prompt,
      tags: tags || [],
      targetModel: targetModel || 'gemini-2.5-flash',
      parentBlobId: parentBlobId || null,
      createdAt: Date.now(),
    });
    const promptBlobId = await storeBlob(promptPayload);

    // 3. Store AI evaluation as second Walrus blob
    const evalPayload = JSON.stringify({
      ...evaluation,
      promptBlobId,
      evaluatedAt: Date.now(),
    });
    const evalBlobId = await storeBlob(evalPayload);

    // 4. Save metadata to Firebase Firestore for public vault indexing
    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, 'prompts'), {
        title,
        promptBlobId,
        evalBlobId,
        targetModel: targetModel || 'gemini-2.5-flash',
        tags: tags || [],
        createdAt: serverTimestamp(),
        parentBlobId: parentBlobId || null,
        author: author || null,
      });
    }

    // 5. Return blob IDs (Walrus blobs are the immutable records; verifiable via aggregator)
    return NextResponse.json({
      success: true,
      promptBlobId,
      evalBlobId,
      evaluation,
      parentBlobId: parentBlobId || null,
    });
  } catch (error: unknown) {
    console.error('Store error:', error);
    let userMessage = 'Failed to store prompt. Please try again later.';
    if (error instanceof Error) {
      if (error.message.includes('Walrus publisher') || error.message.includes('DNS resolution')) {
        userMessage = 'Temporary issue reaching Walrus storage (DNS problem). Please try again in a few minutes.';
      } else if (error.message.includes('AI evaluation')) {
        userMessage = 'AI evaluation temporarily unavailable. Your prompt may still be stored with default evaluation.';
      } else {
        userMessage = error.message;
      }
    }
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
