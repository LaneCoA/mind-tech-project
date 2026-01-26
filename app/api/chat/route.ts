import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const n8nRes = await fetch(
      process.env.N8N_WEBHOOK_URL!,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!n8nRes.ok) {
      throw new Error('n8n error');
    }

    const contentType = n8nRes.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await n8nRes.json();
    } else {
      const text = await n8nRes.text();
      data = { result: { text } };
    }

    const reply =
      typeof data?.result?.text === 'string'
        ? data.result.text
        : null;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API /chat error:', error);
    return NextResponse.json(
      { error: 'Error calling n8n' },
      { status: 500 }
    );
  }
}
