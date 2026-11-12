import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  if (month) qs.set('month', month);
  if (year) qs.set('year', year);

  const res = await laravelAdmin(`/admin/analytics/stats${qs.toString() ? `?${qs}` : ''}`);
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: res.status || 503 });
  }
  return NextResponse.json(res.data);
}
