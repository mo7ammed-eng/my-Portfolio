import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized, collection } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const wantsAll = searchParams.get('all') === 'true' && (await isAdmin());

  const qs = new URLSearchParams();
  if (wantsAll) qs.set('all', '1');
  if (category && category !== 'All') qs.set('category', category);

  const res = await laravelAdmin(`/works${qs.toString() ? `?${qs}` : ''}`);
  if (!res.ok) return NextResponse.json([], { status: res.status || 503 });
  return NextResponse.json(collection(res.data));
}

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();
  const res = await laravelAdmin('/admin/works', { method: 'POST', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to create work';
    return NextResponse.json({ error: message, errors: res.data?.errors }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data, { status: 201 });
}
