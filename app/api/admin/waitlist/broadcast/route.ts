import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { ADMIN_EMAIL, sendBatch } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const supabase = createAdminClient();

    const { subject, body, recipientIds } = await req.json();
    if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    if (!body?.trim()) return NextResponse.json({ error: 'Email body is required.' }, { status: 400 });
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json({ error: 'No recipients selected.' }, { status: 400 });
    }

    const { data: recipients } = await supabase
      .from('waitlist')
      .select('email, first_name')
      .in('id', recipientIds);

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found.' }, { status: 400 });
    }

    // The same person can be on several retreat waitlists; email them once.
    const uniqueEmails = Array.from(new Set(recipients.map((r) => r.email)));

    const emails = uniqueEmails.map((to) => ({
      from: 'Alpha Retreats <hello@alpha-retreats.com>',
      to,
      replyTo: ADMIN_EMAIL,
      subject,
      html: body.replace(/\n/g, '<br>'),
    }));

    const { sent, failed } = await sendBatch(emails, 'waitlist broadcast');
    if (sent === 0) {
      return NextResponse.json({ error: 'Failed to send broadcast. Check the Vercel logs.' }, { status: 500 });
    }
    return NextResponse.json({
      message: `Broadcast sent to ${sent} recipient${sent === 1 ? '' : 's'}${failed ? `, ${failed} failed` : ''}.`,
    });
  } catch (err) {
    console.error('Broadcast error:', err);
    return NextResponse.json({ error: 'Failed to send broadcast.' }, { status: 500 });
  }
}
