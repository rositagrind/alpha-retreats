import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import type { Retreat } from '@/types/database';
import WaitlistForm from '@/components/sections/WaitlistForm';
import RetreatCard from '@/components/sections/RetreatCard';
import HeroSection from '@/components/sections/HeroSection';
import VideoBlock from '@/components/sections/VideoBlock';
import ActivitiesGrid from '@/components/sections/ActivitiesGrid';
import TwoPaths from '@/components/sections/TwoPaths';
import NearestRetreatPopup from '@/components/sections/NearestRetreatPopup';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Alpha Retreats | Built for Men. Forged in the Wild.',
  description:
    'Premium men-only retreats for a community of driven, successful men. One to seven days to disconnect from the noise and reconnect with nature and your primal instincts.',
  openGraph: {
    title: 'Alpha Retreats | Built for Men. Forged in the Wild.',
    description: 'Premium men-only retreats for driven, successful men.',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'],
  },
};

async function getFeaturedRetreats(): Promise<Retreat[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('retreats')
      .select('*')
      .eq('featured', true)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}

// The homepage popup: whichever bookable retreat has the soonest upcoming
// date. Retreats without a start_date yet (nullsFirst: false) sort last
// rather than first, so an undated "coming soon" listing doesn't jump the
// queue ahead of one with a real date on the calendar.
async function getNearestUpcomingRetreat(): Promise<Retreat | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('retreats')
      .select('*')
      .in('status', ['coming_soon', 'available'])
      .order('start_date', { ascending: true, nullsFirst: false })
      .limit(1);
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [featuredRetreats, nearestRetreat] = await Promise.all([
    getFeaturedRetreats(),
    getNearestUpcomingRetreat(),
  ]);

  return (
    <main>
      <NearestRetreatPopup retreat={nearestRetreat} />
      <HeroSection />
      <VideoBlock />
      <UpcomingRetreats retreats={featuredRetreats} />
      <ActivitiesGrid />
      <TwoPaths />
      <WaitlistSection />
    </main>
  );
}

function UpcomingRetreats({ retreats }: { retreats: Retreat[] }) {
  return (
    <section className="section-padding bg-dark-bg">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="heading-lg">UPCOMING RETREATS</h2>
            <p className="text-gray-400 font-body mt-2">Select dates are now available. Spots are extremely limited.</p>
          </div>
          <Link
            href="/retreats"
            className="hidden sm:inline-flex font-body text-sm uppercase tracking-widest text-burnt-orange hover:text-orange-400 transition-colors"
          >
            View All →
          </Link>
        </div>

        {retreats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {retreats.map((retreat) => (
              <RetreatCard key={retreat.id} retreat={retreat} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dark-border rounded-lg">
            <p className="font-heading text-3xl text-gray-600 mb-4">RETREATS COMING SOON</p>
            <p className="text-gray-500 font-body mb-8">
              Our next retreats are being finalized. Join the waitlist to be first to know.
            </p>
            <Link href="/#waitlist" className="btn-primary">
              Join The Waitlist
            </Link>
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/retreats" className="font-body text-sm uppercase tracking-widest text-burnt-orange hover:text-orange-400 transition-colors">
            View All Retreats →
          </Link>
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  return (
    <section id="waitlist" className="section-padding bg-forest-green">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="heading-lg mb-4">BE FIRST TO KNOW.</h2>
          <p className="text-gray-300 font-body text-lg mb-8">
            New retreats. Limited spots. Join the waitlist and get early access before the public.
          </p>
          <WaitlistForm source="homepage" />
          <p className="text-gray-500 font-body text-xs mt-4">
            No spam. No BS. Just the signal when it matters.
          </p>
        </div>
      </div>
    </section>
  );
}
