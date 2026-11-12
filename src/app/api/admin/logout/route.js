import { NextResponse } from 'next/server';
import { laravel } from '@/lib/laravel';

export async function POST(request) {
  const token = request.cookies.get('laravel_token')?.value;

  if (token) {
    await laravel('/auth/logout', { method: 'POST', token });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_token');
  res.cookies.delete('laravel_token');
  return res;
}
