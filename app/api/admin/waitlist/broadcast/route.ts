import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/server';
import { createRouteClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const authClient = createRouteClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

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

    const emails = recipients.map((r) => ({
      from: 'Alpha Retreats <hello@alpharetreats.com>',
      to: r.email,
      subject,
      html: body.replace(/\n/g, '<br>'),
    }));

    const results = await resend.batch.send(emails);
    return NextResponse.json({ message: `Broadcast sent to ${recipients.length} recipients.`, results });
  } catch (err) {
    console.error('Broadcast error:', err);
    return NextResponse.json({ error: 'Failed to send broadcast.' }, { status: 500 });
  }
}
