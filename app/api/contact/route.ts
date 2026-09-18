import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'alpharetreatsorg@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: 'Please write a message (at least 10 characters).' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
    }

    // Notify admin
    await resend.emails.send({
      from: 'Alpha Retreats <notifications@alpha-retreats.com>',
      to: ADMIN_EMAIL,
      subject: `New contact form — ${name.trim()}`,
      html: `<p><strong>${name.trim()}</strong> sent a message via the contact form.</p><p>Email: ${email.trim().toLowerCase()}</p>${subject ? `<p>Subject: ${subject.trim()}</p>` : ''}<p>Message:</p><blockquote>${message.trim()}</blockquote>`,
    }).catch(() => {});

    return NextResponse.json({ message: 'Message sent. We will reply within 24 hours.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
