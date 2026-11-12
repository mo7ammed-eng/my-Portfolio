import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { label, url, page } = await request.json();
    if (!label) return NextResponse.json({ error: 'label required' }, { status: 400 });

    await laravel('/clicks', {
      method: 'POST',
      body: { label, url: url || '', page: page || '' },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
