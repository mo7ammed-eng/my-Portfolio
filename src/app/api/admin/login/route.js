import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { laravel } from '@/lib/laravel';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;
  const email = body.email || process.env.ADMIN_EMAIL;

  if (!password || !email) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const auth = await laravel('/auth/login', { method: 'POST', body: { email, password } });

  if (!auth.ok) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ admin: true, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  if (auth.data?.token) {
    res.cookies.set('laravel_token', auth.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  return res;
}
