import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized, collection } from '@/lib/laravel';

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
  return `/admin/${resource}${id ? `/${id}` : ''}`;
}

export async function GET(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { resource } = await params;
  if (!RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const res = await laravelAdmin(`${pathFor(resource)}?all=1`);
  if (!res.ok) return NextResponse.json([], { status: res.status || 503 });
  return NextResponse.json(collection(res.data));
}

export async function POST(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { resource } = await params;
  if (!RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const body = await request.json();
  const res = await laravelAdmin(pathFor(resource), { method: 'POST', body });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to create item';
    return NextResponse.json({ error: message, errors: res.data?.errors }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data?.data ?? res.data, { status: 201 });
}
