import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    await laravel('/searches', { method: 'POST', body: { query: query.toLowerCase().trim() } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
