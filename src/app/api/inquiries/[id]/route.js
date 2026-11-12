import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const body = await request.json();

  const res = await laravelAdmin(`/admin/messages/${id}`, { method: 'PATCH', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to update message';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data);
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;

  const res = await laravelAdmin(`/admin/messages/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to delete message';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }
  return NextResponse.json({ success: true });
}
