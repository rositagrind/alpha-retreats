'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Booking, Profile } from '@/types/database';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300',
  deposit_paid: 'bg-blue-900/40 text-blue-300',
  fully_paid: 'bg-green-900/40 text-green-300',
  cancelled: 'bg-red-900/40 text-red-300',
  refunded: 'bg-gray-800 text-gray-400',
};

interface BookingWithRetreat extends Booking {
  retreats?: {
    name: string;
    location: string;
    country: string;
    start_date: string | null;
    end_date: string | null;
    duration_days: number;
    hero_image: string | null;
    slug: string;
  };
}

export default function MembersDashboard({
  bookings,
  profile,
  userEmail,
}: {
  bookings: BookingWithRetreat[];
  profile: Profile | null;
  userEmail: string;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/members/login');
  };

  return (
    <main className="pt-20">
      <div className="section-padding">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="heading-lg">MEMBERS DASHBOARD</h1>
              <p className="text-gray-400 font-body mt-1">
                Welcome back, {profile?.full_name || userEmail}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="font-body text-sm uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors"
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>

          {/* Bookings */}
          <div>
            <h2 className="heading-md mb-6">YOUR RETREATS</h2>
            {bookings.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
                <p className="font-heading text-3xl text-gray-600 mb-4">NO BOOKINGS YET</p>
                <p className="text-gray-500 font-body mb-6">
                  You haven&apos;t booked a retreat yet.
                </p>
                <Link href="/retreats" className="btn-primary">
                  Explore Retreats
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {booking.retreats?.hero_image && (
                        <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
                          <Image
                            src={booking.retreats.hero_image}
                            alt={booking.retreats.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-heading text-xl text-off-white">
                              {booking.retreats?.name || 'Alpha Retreat'}
                            </h3>
                            {booking.retreats && (
                              <p className="text-gray-500 font-body text-sm">
                                {booking.retreats.location}, {booking.retreats.country}
                                {booking.retreats.start_date && ` · ${new Date(booking.retreats.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                              </p>
                            )}
                          </div>
                          <span className={`status-badge text-xs px-2.5 py-1 rounded ${STATUS_COLORS[booking.status] || 'bg-gray-800 text-gray-400'}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-body">
                          <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Spots</p>
                            <p className="text-off-white">{booking.spots}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Deposit Paid</p>
                            <p className="text-burnt-orange">€{booking.deposit_euros.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Total</p>
                            <p className="text-off-white">€{booking.total_euros.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Balance</p>
                            <p className="text-off-white">€{(booking.total_euros - booking.deposit_euros).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dark-border">
                          <p className="text-gray-600 font-body text-xs">
                            Booking ref: {booking.id.slice(0, 8).toUpperCase()}
                            {booking.retreat_id && (
                              <> · <Link href={`/retreats/${booking.retreats?.slug}`} className="text-burnt-orange hover:text-orange-400 transition-colors">View retreat →</Link></>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-retreat docs placeholder */}
          <div className="mt-12">
            <h2 className="heading-md mb-6">PRE-RETREAT DOCUMENTS</h2>
            <div className="bg-dark-card border border-dark-border rounded-lg p-8">
              <p className="text-gray-500 font-body text-sm">
                Pre-retreat documents and information packs will appear here once your retreat is confirmed. Check back closer to your retreat date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
