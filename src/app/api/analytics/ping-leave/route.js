import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ success: false }, { status: 400 });

    const res = await laravel('/sessions/leave', { method: 'POST', body: { sessionId } });

    return NextResponse.json({ success: res.ok });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
