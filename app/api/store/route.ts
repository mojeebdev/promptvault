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

    // 2. Store original prompt as Walrus blob + 3. evaluation blob (best effort)
    // We hammer community publishers hard (see lib/walrus.ts). If they all fail we still save
    // the full data to Firestore so the submit "succeeds" for the user. Walrus is best-effort
    // immutable storage; Firestore is the reliable app index + fallback content.
    const promptPayload = JSON.stringify({
      title,
      prompt,
      tags: tags || [],
      targetModel: targetModel || 'gemini-2.5-flash',
      parentBlobId: parentBlobId || null,
      createdAt: Date.now(),
    });

    const evalBase = evaluation;

    let promptBlobId: string | null = null;
    let evalBlobId: string | null = null;
    let walrusFailed = false;

    try {
      promptBlobId = await storeBlob(promptPayload);

      const evalPayload = JSON.stringify({
        ...evalBase,
        promptBlobId,
        evaluatedAt: Date.now(),
      });
      evalBlobId = await storeBlob(evalPayload);
    } catch (walrusErr) {
      console.error('[store] Walrus best-effort failed after all retries:', walrusErr);
      walrusFailed = true;
      // continue — we will still save everything to Firestore
    }

    // 4. Always save to Firestore (with full content for fallback + metadata)
    // Wrapped in try/catch because Firestore rules or temporary issues should not
    // kill the entire submit (especially when Walrus is already down).
    let firestoreId = '';
    let firestoreFailed = false;
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'prompts'), {
          title,
          promptBlobId,
          evalBlobId,
          targetModel: targetModel || 'gemini-2.5-flash',
          tags: tags || [],
          createdAt: serverTimestamp(),
          parentBlobId: parentBlobId || null,
          author: author || null,
          // Full content for Firestore fallback when Walrus is unavailable
          prompt: prompt,
          evaluation: evalBase,
          walrusFailed,
        });
        firestoreId = docRef.id;
      } catch (fsErr) {
        console.error('[store] Firestore write failed (non-fatal):', fsErr);
        firestoreFailed = true;
        // Still return success so the user sees their evaluation
      }
    }

    // 5. Return usable response.
    // On Walrus success: normal blobIds (links use the real Walrus blobId)
    // On Walrus failure: return firestoreId as the "promptBlobId" so /prompt/{id} links work,
    // and the detail page will fall back to the embedded Firestore data.
    const effectivePromptBlobId = promptBlobId || firestoreId;

    return NextResponse.json({
      success: true,
      promptBlobId: effectivePromptBlobId,
      evalBlobId: evalBlobId || null,
      evaluation: evalBase,
      parentBlobId: parentBlobId || null,
      walrusFailed,
      firestoreFailed,
      // For the success panel we can also return the raw prompt if needed
      prompt: prompt,
    });
  } catch (error: unknown) {
    console.error('Store error:', error);
    let userMessage = 'Failed to store prompt. Please try again later.';
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('Walrus publisher') || msg.includes('community publishers') || msg.includes('Temporary issue reaching Walrus') || msg.includes('DNS resolution') || msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN')) {
        userMessage = 'Temporary issue reaching Walrus storage (community publishers busy). The form will auto-retry.';
      } else if (msg.includes('Walrus store failed: 5')) {
        userMessage = 'Walrus publisher temporarily unavailable (5xx). Auto-retrying...';
      } else if (msg.includes('AI evaluation')) {
        userMessage = 'AI evaluation temporarily unavailable. Your prompt may still be stored with default evaluation.';
      } else {
        userMessage = msg;
      }
    }
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
