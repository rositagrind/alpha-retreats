import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'salvadorsequerrarosa@gmail.com';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();

    if (existing) {
      return NextResponse.json({ received: true, note: 'Already processed.' });
    }

    const meta = session.metadata || {};
    const retreatId = meta.retreat_id;
    const spots = Number(meta.spots) || 1;

    const { error: bookingError } = await supabase.from('bookings').insert({
      retreat_id: retreatId,
      first_name: meta.first_name || '',
      last_name: meta.last_name || '',
      email: meta.email || session.customer_email || '',
      phone: meta.phone || '',
      spots,
      total_euros: Number(meta.total_euros) || 0,
      deposit_euros: Number(meta.deposit_euros) || 0,
      status: 'deposit_paid',
      stripe_session_id: session.id,
    });

    if (bookingError) {
      console.error('Failed to insert booking:', bookingError);
      return NextResponse.json({ error: 'Failed to record booking.' }, { status: 500 });
    }

    // Notify admin
    await resend.emails.send({
      from: 'Alpha Retreats <notifications@alpha-retreats.com>',
      to: ADMIN_EMAIL,
      subject: `🔥 New booking — ${meta.first_name} ${meta.last_name}`,
      html: `<p><strong>${meta.first_name} ${meta.last_name}</strong> just paid a deposit.</p><p>Email: ${meta.email}</p><p>Phone: ${meta.phone}</p><p>Spots: ${spots}</p><p>Deposit paid: €${meta.deposit_euros}</p><p>Total due: €${meta.total_euros}</p><p>Stripe session: ${session.id}</p>`,
    }).catch(() => {});

    const { data: retreat } = await supabase
      .from('retreats')
      .select('spots_remaining')
      .eq('id', retreatId)
      .single();

    if (retreat) {
      const newSpots = Math.max(0, retreat.spots_remaining - spots);
      await supabase
        .from('retreats')
        .update({
          spots_remaining: newSpots,
          status: newSpots === 0 ? 'sold_out' : undefined,
        })
        .eq('id', retreatId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('stripe_session_id', session.id)
      .eq('status', 'pending');
  }

  return NextResponse.json({ received: true });
}
