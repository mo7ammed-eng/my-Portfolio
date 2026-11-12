import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

const RESOURCES = new Set([
  'hero',
  'about',
  'skill-categories',
  'skills',
  'experiences',
  'services',
  'testimonials',
  'blog',
  'social-links',
]);

function pathFor(resource, id) {
  return `/admin/${resource}/${id}`;
}

export async function GET(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { resource, id } = await params;
  if (!RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const res = await laravelAdmin(pathFor(resource, id));
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status || 404 });
  return NextResponse.json(res.data?.data ?? res.data);
}

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { resource, id } = await params;
  if (!RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const body = await request.json();
  const res = await laravelAdmin(pathFor(resource, id), { method: 'PATCH', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to update item';
    return NextResponse.json({ error: message, errors: res.data?.errors }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data);
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { resource, id } = await params;
  if (!RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const res = await laravelAdmin(pathFor(resource, id), { method: 'DELETE' });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to delete item';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }
  return NextResponse.json({ success: true });
}
