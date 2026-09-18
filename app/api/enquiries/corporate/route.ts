import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'alpharetreatsorg@gmail.com';
const FROM_EMAIL = 'Alpha Retreats <notifications@alpha-retreats.com>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, contact_name, email, phone, team_size, preferred_dates, goals } = body;

    if (!company_name?.trim()) return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    if (!contact_name?.trim()) return NextResponse.json({ error: 'Contact name is required.' }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!goals?.trim()) return NextResponse.json({ error: 'Please describe your goals.' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from('corporate_enquiries').insert({
      company_name: company_name.trim(),
      contact_name: contact_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      team_size: team_size ? Number(team_size) : null,
      preferred_dates: preferred_dates?.trim() || null,
      goals: goals.trim(),
    });

    if (error) {
      console.error('Corporate enquiry insert error:', error);
      return NextResponse.json({ error: 'Failed to submit enquiry. Please try again.' }, { status: 500 });
    }

    // Notify admin — this was previously missing entirely for corporate enquiries,
    // the highest-value lead type, with nothing flagging a new one except checking
    // the admin panel manually.
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `\u{1F3E2} New CORPORATE enquiry — ${company_name.trim()}${team_size ? ` (${team_size} people)` : ''}`,
      html: `
        <p><strong>${contact_name.trim()}</strong> at <strong>${company_name.trim()}</strong> submitted a corporate enquiry.</p>
        <p>Email: ${email.trim().toLowerCase()}</p>
        ${phone ? `<p>Phone: ${phone.trim()}</p>` : ''}
        ${team_size ? `<p>Team size: ${team_size}</p>` : ''}
        ${preferred_dates ? `<p>Preferred dates: ${preferred_dates.trim()}</p>` : ''}
        <p>Goals:</p>
        <blockquote>${goals.trim()}</blockquote>
      `,
    }).catch(() => {});

    // Confirm to the enquirer — also previously missing. The site promises
    // "we will be in touch within 24 hours" but nothing backed that up by email.
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email.trim().toLowerCase(),
      subject: 'Enquiry received — Alpha Retreats',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.5px; color: #b5502e; margin-bottom: 16px;">ENQUIRY RECEIVED.</p>
          <p>${contact_name.trim()}, got it — ${company_name.trim()}'s enquiry is in.</p>
          <p>I personally review every corporate enquiry. You'll hear from me directly within 24 hours, not an autoresponder.</p>
          <p style="margin-top: 32px;">— Salvador<br>Alpha Retreats</p>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ message: 'Your enquiry has been received. We will be in touch within 24 hours.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
