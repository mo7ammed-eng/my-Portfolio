import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdmin, laravelAdmin } from '@/lib/laravel';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: 'Email is not configured (missing RESEND_API_KEY)' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const to = formData.get('to');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const file = formData.get('file');

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let attachments = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // Note: If you do not have a verified domain in Resend, 
    // you can only send emails to the email address registered with your Resend account.
    // To send to "any mailer", you must verify a custom domain in the Resend dashboard 
    // and change the 'from' address below to something like 'hello@yourdomain.com'.
    const { data, error } = await resend.emails.send({
      from: 'Mohammed Waleed <support@mohammedwaleed.dev>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090F; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://mohammedwaleed.dev/photo/avatar-mw.svg" alt="Mohammed Waleed" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #8B5CF6; margin-bottom: 16px;" />
            <h2 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: -0.5px;">Mohammed Waleed</h2>
            <p style="margin: 4px 0 0; color: #8B5CF6; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Full Stack Developer</p>
          </div>
          <hr style="border: none; border-top: 1px solid #222; margin: 0 0 30px;" />
          <div style="font-size: 15px; line-height: 1.7; color: #d4d4d4; white-space: pre-wrap;">${message}</div>
          <hr style="border: none; border-top: 1px solid #222; margin: 40px 0 20px;" />
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">Sent directly from</p>
            <p style="margin: 4px 0 0;"><a href="https://mohammedwaleed.dev" style="color: #8B5CF6; text-decoration: none; font-weight: bold;">mohammedwaleed.dev</a></p>
          </div>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save the sent email to the inquiries database so the admin can see the history
    const saved = await laravelAdmin('/admin/messages', {
      method: 'POST',
      body: {
        name: 'Sent by Mohammed Waleed',
        email: to,
        message: `SUBJECT: ${subject}\n\n${message}`,
      },
    });
    if (saved.ok) {
      const id = saved.data?.data?.id ?? saved.data?.id;
      if (id) {
        await laravelAdmin(`/admin/messages/${id}`, { method: 'PATCH', body: { read: true } });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
