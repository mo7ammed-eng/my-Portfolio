import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { laravel } from '@/lib/laravel';

export const dynamic = 'force-dynamic';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export async function POST(request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const ip = getIP(request);

  const stored = await laravel('/contact', {
    method: 'POST',
    body: { name, email, message },
    headers: {
      'x-forwarded-for': ip,
      'x-real-ip': ip,
      'user-agent': request.headers.get('user-agent') || '',
    },
  });

  if (stored.status === 429) {
    return NextResponse.json(
      { error: stored.data?.error || 'Too many messages today. Try again tomorrow.' },
      { status: 429 }
    );
  }
  if (stored.status === 422) {
    return NextResponse.json(
      { error: stored.data?.message || 'Please check the form and try again.' },
      { status: 422 }
    );
  }
  if (stored.status === 0) {
    return NextResponse.json({ error: 'Backend unavailable. Please try again later.' }, { status: 503 });
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Portfolio Contact <support@mohammedwaleed.dev>',
        to: process.env.ADMIN_EMAIL,
        replyTo: email,
        subject: `New message from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#15121F;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#8B5CF6;margin:0 0 24px">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#999;width:80px">From</td><td style="padding:8px 0;color:#fff">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0;color:#8B5CF6"><a href="mailto:${email}" style="color:#8B5CF6">${email}</a></td></tr>
            </table>
            <hr style="border:1px solid #222;margin:20px 0"/>
            <p style="color:#ccc;line-height:1.7;white-space:pre-wrap">${message}</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Contact email error:', err);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
