import { NextResponse } from 'next/server';
import { laravelAdmin } from '@/lib/laravel';

export async function POST(request) {
  try {
    const body = await request.json();

    // Verify it's an incoming email webhook from Resend
    if (body.type !== 'email.received') {
      return NextResponse.json({ error: 'Ignored: Not an email.received event' }, { status: 400 });
    }

    const { from, subject, text, html } = body.data;

    // Parse the sender's name and email
    // "from" usually looks like: "John Doe <john@example.com>" or just "john@example.com"
    let name = 'Unknown Sender';
    let email = from;

    const match = from.match(/(.*)<(.*)>/);
    if (match) {
      name = match[1].trim().replace(/^"|"$/g, '') || 'Unknown Sender';
      email = match[2].trim();
    }

    // Prepare the message text (use plain text if available, fallback to html)
    const messageBody = text || html || '[No content]';
    const fullMessage = `SUBJECT: ${subject || 'No Subject'}\n\n${messageBody}`;

    const saved = await laravelAdmin('/admin/messages', {
      method: 'POST',
      body: { name, email, message: fullMessage },
    });

    if (!saved.ok) {
      console.error('Webhook message insert error:', saved.data);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
