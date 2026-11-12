import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = await params;
  const res = await laravelAdmin(`/works/${id}`);
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status || 404 });
  return NextResponse.json(res.data?.data ?? res.data);
}

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const body = await request.json();
  const res = await laravelAdmin(`/admin/works/${id}`, { method: 'PATCH', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to update work';
    return NextResponse.json({ error: message, errors: res.data?.errors }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data);
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const res = await laravelAdmin(`/admin/works/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to delete work';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }
  return NextResponse.json({ success: true });
}
