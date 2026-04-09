import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    return NextResponse.json({ message: 'Your enquiry has been received. We will be in touch within 24 hours.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
