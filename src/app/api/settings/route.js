import { NextResponse } from 'next/server';
import { laravel, laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

const SCOPES = new Set(['site', 'seo', 'theme']);

function resolveScope(request) {
  const scope = new URL(request.url).searchParams.get('scope') || 'site';
  return SCOPES.has(scope) ? scope : 'site';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const scope = resolveScope(request);

  const res = await laravel(key ? `/settings/${scope}/${encodeURIComponent(key)}` : `/settings/${scope}`);
  if (!res.ok) return NextResponse.json(key ? null : [], { status: res.status || 503 });

  if (key) {
    return NextResponse.json({ key, value: res.data?.value ?? null });
  }

  const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return NextResponse.json(rows);
}

export async function PATCH(request) {
  if (!(await isAdmin())) return unauthorized();
  const scope = resolveScope(request);
  const { key, value } = await request.json();

  const res = await laravelAdmin(`/settings/${scope}`, { method: 'PATCH', body: { key, value } });
  if (!res.ok) {
    const message = res.data?.message || 'Failed to save setting';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }
  return NextResponse.json(res.data);
}
