import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'alpharetreatsorg@gmail.com';
const FROM_EMAIL = 'Alpha Retreats <notifications@alpha-retreats.com>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, source } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('waitlist').insert({
      email: email.trim().toLowerCase(),
      first_name: firstName?.trim() || null,
      source: source || 'website',
    });

    const alreadyOnList = error?.code === '23505';

    if (error && !alreadyOnList) {
      return NextResponse.json({ error: 'Failed to join waitlist. Please try again.' }, { status: 500 });
    }

    // Notify admin (skip for duplicate signups — no need to notify twice)
    if (!alreadyOnList) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New waitlist signup — ${firstName || email}`,
        html: `<p><strong>${firstName || 'Someone'}</strong> just joined the waitlist.</p><p>Email: ${email.trim().toLowerCase()}</p><p>Source: ${source || 'website'}</p>`,
      }).catch(() => {}); // don't fail the request if email fails
    }

    // Confirm to the person who signed up — this was previously missing entirely,
    // meaning every waitlist signup got silence instead of a welcome.
    if (!alreadyOnList) {
      const first = firstName?.trim();
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email.trim().toLowerCase(),
        subject: "You're in — Alpha Retreats",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.5px; color: #b5502e; margin-bottom: 16px;">YOU'RE IN.</p>
            <p>${first ? `${first}, y` : 'Y'}ou're on the Alpha Retreats waitlist.</p>
            <p>No mass emails, no fake urgency. When a retreat opens — before it goes public — you hear about it first.</p>
            <p>That's it. That's the email.</p>
            <p style="margin-top: 32px;">— Salvador<br>Alpha Retreats</p>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({
      message: alreadyOnList
        ? 'You are already on the waitlist. We will be in touch.'
        : 'You are on the list. We will be in touch when spots open.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
