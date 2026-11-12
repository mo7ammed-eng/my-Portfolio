import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const res = await laravel('/sessions/active');
    if (!res.ok) return NextResponse.json({ count: 0, success: false }, { status: 500 });
    return NextResponse.json({ count: res.data?.count ?? 0, success: true });
  } catch {
    return NextResponse.json({ count: 0, success: false }, { status: 500 });
  }
}
