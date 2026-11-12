import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return NextResponse.json({ error: 'Only images and videos allowed' }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 50 MB' }, { status: 400 });
  }

  const forward = new FormData();
  forward.append('file', file, file.name || 'upload');

  const res = await laravelAdmin('/uploads', { method: 'POST', body: forward });

  if (!res.ok) {
    const message = res.data?.message || res.data?.error || 'Upload failed';
    return NextResponse.json({ error: message }, { status: res.status || 500 });
  }

  return NextResponse.json({
    url: res.data?.url,
    path: res.data?.path,
    success: true,
  });
}
