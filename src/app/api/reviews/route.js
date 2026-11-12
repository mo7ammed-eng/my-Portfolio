import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized, collection } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const approvedOnly = searchParams.get('all') !== 'true' || !(await isAdmin());

  const res = await laravelAdmin('/testimonials');
  if (!res.ok) return NextResponse.json([], { status: res.status || 503 });

  const rows = collection(res.data);
  const mapped = approvedOnly ? rows.filter((r) => r.approved) : rows;
  return NextResponse.json(mapped);
}

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();

  const res = await laravelAdmin('/admin/testimonials', { method: 'POST', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to create review';
    return NextResponse.json({ error: message, errors: res.data?.errors }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data, { status: 201 });
}
