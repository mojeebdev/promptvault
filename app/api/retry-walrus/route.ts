import { NextRequest, NextResponse } from 'next/server';
import { storeBlob } from '@/lib/walrus';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    let id: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      id = body.id;
    } else {
      // support form post from detail page
      const form = await req.formData();
      id = form.get('id') as string | null;
    }

    if (!id || !isFirebaseConfigured || !db) {
      return NextResponse.json({ error: 'Invalid request or Firebase not configured' }, { status: 400 });
    }

    const promptDoc = await getDoc(doc(db, 'prompts', id));
    if (!promptDoc.exists()) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const data = promptDoc.data() as any;

    if (!data.walrusFailed || !data.prompt) {
      return NextResponse.json({ success: true, message: 'Already has Walrus blobs or no content to store' });
    }

    // Reconstruct payloads from embedded data
    const promptPayload = JSON.stringify({
      title: data.title,
      prompt: data.prompt,
      tags: data.tags || [],
      targetModel: data.targetModel,
      parentBlobId: data.parentBlobId || null,
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
    });

    const promptBlobId = await storeBlob(promptPayload);

    const evalPayload = JSON.stringify({
      ...data.evaluation,
      promptBlobId,
      evaluatedAt: Date.now(),
    });

    const evalBlobId = await storeBlob(evalPayload);

    // Update the doc with real blobIds
    await updateDoc(doc(db, 'prompts', id), {
      promptBlobId,
      evalBlobId,
      walrusFailed: false,
    });

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      // form submit from detail page -> redirect back
      return NextResponse.redirect(new URL(`/prompt/${id}`, req.url));
    }

    return NextResponse.json({
      success: true,
      promptBlobId,
      evalBlobId,
      message: 'Successfully stored to Walrus',
    });
  } catch (error: unknown) {
    console.error('Retry Walrus error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to store to Walrus: ' + msg },
      { status: 500 }
    );
  }
}
