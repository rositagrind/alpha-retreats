import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL, FROM_EMAIL, SITE_URL, escapeHtml, sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, source, retreatId } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const first = typeof firstName === 'string' ? firstName.trim() : '';
    const cleanSource = typeof source === 'string' && source ? source : 'website';

    const supabase = createAdminClient();

    // Look the retreat up server-side instead of trusting the name the browser sends.
    let retreat: { id: string; name: string; slug: string } | null = null;
    if (typeof retreatId === 'string' && retreatId.length > 0) {
      const { data } = await supabase.from('retreats').select('id, name, slug').eq('id', retreatId).maybeSingle();
      retreat = data;
    }

    const { error } = await supabase.from('waitlist').insert({
      email: cleanEmail,
      first_name: first || null,
      source: cleanSource,
      retreat_id: retreat?.id ?? null,
    });

    const alreadyOnList = error?.code === '23505';

    if (error && !alreadyOnList) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist. Please try again.' }, { status: 500 });
    }

    const retreatLabel = retreat?.name ?? null;

    // Skip both emails for duplicate signups, no need to notify twice.
    if (!alreadyOnList) {
      let countQuery = supabase.from('waitlist').select('id', { count: 'exact', head: true });
      countQuery = retreat ? countQuery.eq('retreat_id', retreat.id) : countQuery.is('retreat_id', null);
      const { count } = await countQuery;

      const listingUrl = retreat ? `${SITE_URL}/retreats/${retreat.slug}` : null;
      const who = first || cleanEmail;

      await sendEmail({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: cleanEmail,
        subject: retreatLabel
          ? `New waitlist signup: ${retreatLabel} | ${who}`
          : `New waitlist signup: General | ${who}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; color: #1a1a1a;">
            <p><strong>${escapeHtml(first || 'Someone')}</strong> just joined the waitlist${retreatLabel ? ` for <strong>${escapeHtml(retreatLabel)}</strong>` : ' (general, no specific retreat)'}.</p>
            <p>Email: <a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a><br>Source: ${escapeHtml(cleanSource)}</p>
            ${typeof count === 'number' ? `<p>${retreatLabel ? 'This retreat\'s' : 'The general'} waitlist now has <strong>${count}</strong> ${count === 1 ? 'person' : 'people'}.</p>` : ''}
            ${listingUrl ? `<p><a href="${listingUrl}">View listing</a> · <a href="${SITE_URL}/admin/waitlist?retreat=${retreat!.id}">View this waitlist</a></p>` : `<p><a href="${SITE_URL}/admin/waitlist?retreat=general">View waitlist</a></p>`}
            <p style="color: #777; font-size: 12px;">Reply to this email to write to them directly.</p>
          </div>
        `,
      }, 'waitlist admin notification');

      await sendEmail({
        from: FROM_EMAIL,
        to: cleanEmail,
        replyTo: ADMIN_EMAIL,
        subject: "You're in | Alpha Retreats",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.5px; color: #b5502e; margin-bottom: 16px;">YOU'RE IN.</p>
            <p>${first ? `${escapeHtml(first)}, y` : 'Y'}ou're on the Alpha Retreats waitlist${retreatLabel ? ` for ${escapeHtml(retreatLabel)}` : ''}.</p>
            <p>No mass emails, no fake urgency. When ${retreatLabel ? 'a spot opens for this retreat' : 'a retreat opens'}, you hear about it first, before it goes public.</p>
            <p>That's it. That's the email.</p>
            <p style="margin-top: 32px;">Salvador<br>Alpha Retreats</p>
          </div>
        `,
      }, 'waitlist confirmation email');
    }

    return NextResponse.json({
      message: alreadyOnList
        ? retreatLabel
          ? `You are already on the waitlist for ${retreatLabel}. We will be in touch.`
          : 'You are already on the waitlist. We will be in touch.'
        : retreatLabel
          ? `You are on the list for ${retreatLabel}. We will be in touch when spots open.`
          : 'You are on the list. We will be in touch when spots open.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
