// app/api/store/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeBlob } from '@/lib/walrus';
import { evaluatePrompt } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { title, prompt, tags, targetModel, parentBlobId } = await req.json();

    if (!prompt || !title) {
      return NextResponse.json({ error: 'Missing required fields (title, prompt)' }, { status: 400 });
    }

    // 1. Evaluate prompt with AI (this is the creative meta layer)
    const evaluation = await evaluatePrompt(prompt, targetModel || 'gemini-2.5-flash');

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

    // 4. Return blob IDs — frontend is responsible for writing the on-chain record
    //    (using lib/sui.ts + wallet / ephemeral key)
    return NextResponse.json({
      success: true,
      promptBlobId,
      evalBlobId,
      evaluation,
      parentBlobId: parentBlobId || null,
    });
  } catch (error: unknown) {
    console.error('Store error:', error);
    const message = error instanceof Error ? error.message : 'Failed to store prompt';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
