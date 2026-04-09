import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import type { Booking } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Booking Confirmed — Alpha Retreats',
  description: 'Your Alpha Retreats booking is confirmed.',
};

interface Props {
  searchParams: { session_id?: string };
}

async function getBooking(sessionId: string): Promise<Booking | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, retreats(name, location, country, start_date, duration_days)')
      .eq('stripe_session_id', sessionId)
      .single();
    return data as Booking | null;
  } catch {
    return null;
  }
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;
  const booking = sessionId ? await getBooking(sessionId) : null;

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center">
      <div className="container-wide px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🔥</div>
          <h1 className="heading-xl mb-4">YOU&apos;RE IN.</h1>
          <p className="text-gray-300 font-body text-xl mb-8 leading-relaxed">
            Your deposit has been received. You have secured your spot. We will be in touch within 48 hours with full pre-retreat details.
          </p>

          {booking && (
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-left mb-8">
              <h2 className="font-heading text-xl text-off-white mb-4">BOOKING SUMMARY</h2>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="text-off-white">{booking.first_name} {booking.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-off-white">{booking.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Spots</span>
                  <span className="text-off-white">{booking.spots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit Paid</span>
                  <span className="text-burnt-orange font-semibold">€{booking.deposit_euros.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="text-off-white">€{booking.total_euros.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance Due</span>
                  <span className="text-off-white">€{(booking.total_euros - booking.deposit_euros).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking Reference</span>
                  <span className="text-off-white text-xs">{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {!booking && sessionId && (
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
              <p className="text-gray-400 font-body text-sm">
                Your payment has been processed. If you don&apos;t receive a confirmation email within a few minutes, please contact us at hello@alpharetreats.com with your booking reference.
              </p>
            </div>
          )}

          <div className="bg-forest-green/30 border border-forest-green/50 rounded-lg p-6 text-left mb-8">
            <h3 className="font-heading text-lg text-off-white mb-3">WHAT HAPPENS NEXT</h3>
            <ul className="space-y-2 text-gray-300 font-body text-sm">
              <li>✓ You will receive a confirmation email shortly</li>
              <li>✓ Our team will contact you within 48 hours with full details</li>
              <li>✓ A pre-retreat information pack will be sent 4 weeks before your retreat</li>
              <li>✓ Your balance of €{booking ? (booking.total_euros - booking.deposit_euros).toLocaleString() : 'X'} is due 30 days before the retreat</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/retreats" className="btn-secondary">
              Explore More Retreats
            </Link>
            <Link href="/contact" className="btn-ghost font-body">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
