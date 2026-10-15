import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL, FROM_EMAIL, escapeHtml, sendEmail } from '@/lib/email';

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
    await sendEmail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email.trim().toLowerCase(),
      subject: `New contact form from ${name.trim()}`,
      html: `<p><strong>${escapeHtml(name.trim())}</strong> sent a message via the contact form.</p><p>Email: ${escapeHtml(email.trim().toLowerCase())}</p>${subject ? `<p>Subject: ${escapeHtml(subject.trim())}</p>` : ''}<p>Message:</p><blockquote>${escapeHtml(message.trim())}</blockquote>`,
    }, 'contact notification');

    return NextResponse.json({ message: 'Message sent. We will reply within 24 hours.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
