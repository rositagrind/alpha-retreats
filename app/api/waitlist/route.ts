import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'You are already on the waitlist. We will be in touch.' },
          { status: 200 }
        );
      }
      return NextResponse.json({ error: 'Failed to join waitlist. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'You are on the list. We will be in touch when spots open.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
