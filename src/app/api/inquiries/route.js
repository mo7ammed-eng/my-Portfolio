import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized, collection } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const res = await laravelAdmin('/admin/messages');
  if (!res.ok) return NextResponse.json([], { status: res.status || 503 });
  return NextResponse.json(collection(res.data));
}
