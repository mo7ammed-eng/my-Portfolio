import { NextResponse } from 'next/server';
import { laravelAdmin, isAdmin, unauthorized } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();

  const { currentPassword, newPassword } = await request.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const res = await laravelAdmin('/auth/change-password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });

  if (!res.ok) {
    const message =
      res.data?.message ||
      res.data?.errors?.current_password?.[0] ||
      'Current password is incorrect';
    return NextResponse.json({ error: message }, { status: res.status || 400 });
  }

  return NextResponse.json({ success: true, message: 'Password updated successfully.' });
}
