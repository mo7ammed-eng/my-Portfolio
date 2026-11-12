import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { page, referrer, source } = await request.json();
    const headers = {
      'user-agent': request.headers.get('user-agent') || '',
      'x-forwarded-for':
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      'x-real-ip': request.headers.get('x-real-ip') || '',
      'x-vercel-ip-country': request.headers.get('x-vercel-ip-country') || '',
      'x-vercel-ip-city': request.headers.get('x-vercel-ip-city') || '',
      'cf-ipcountry': request.headers.get('cf-ipcountry') || '',
    };

    await laravel('/visits', {
      method: 'POST',
      body: { page: page || '/', referrer: referrer || '', source: source || '' },
      headers,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
