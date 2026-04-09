import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { retreatId, firstName, lastName, email, phone, spots } = body;

    if (!retreatId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    const numSpots = Number(spots) || 1;
    if (numSpots < 1 || numSpots > 10) {
      return NextResponse.json({ error: 'Invalid number of spots.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: retreat, error: retreatError } = await supabase
      .from('retreats')
      .select('*')
      .eq('id', retreatId)
      .eq('status', 'available')
      .single();

    if (retreatError || !retreat) {
      return NextResponse.json({ error: 'Retreat not found or not available for booking.' }, { status: 404 });
    }
    if (retreat.spots_remaining < numSpots) {
      return NextResponse.json(
        { error: `Only ${retreat.spots_remaining} spot${retreat.spots_remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    const depositAmount = retreat.deposit_euros * numSpots;
    const totalAmount = retreat.price_euros * numSpots;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: depositAmount * 100,
            product_data: {
              name: `${retreat.name} — Deposit (${numSpots} spot${numSpots > 1 ? 's' : ''})`,
              description: `${retreat.location}, ${retreat.country} · ${retreat.duration_days} days. Balance of €${(totalAmount - depositAmount).toLocaleString()} due 30 days before retreat.`,
              images: retreat.hero_image ? [retreat.hero_image] : [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        retreat_id: retreat.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        spots: String(numSpots),
        total_euros: String(totalAmount),
        deposit_euros: String(depositAmount),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/retreats/${retreat.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
