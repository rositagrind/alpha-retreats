import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import type { Retreat } from '@/types/database';
import WaitlistForm from '@/components/sections/WaitlistForm';
import RetreatCard from '@/components/sections/RetreatCard';
import HeroSection from '@/components/sections/HeroSection';
import ActivitiesGrid from '@/components/sections/ActivitiesGrid';
import TwoPaths from '@/components/sections/TwoPaths';
import Testimonials from '@/components/sections/Testimonials';

export const metadata: Metadata = {
  title: 'Alpha Retreats — Built for Men. Forged in the Wild.',
  description:
    'Premium men-only retreat experiences worldwide. Ice baths, wilderness hiking, fire cooking, motorcycling, and brotherhood. 3–7 days from €3,000.',
  openGraph: {
    title: 'Alpha Retreats — Built for Men. Forged in the Wild.',
    description: 'Premium men-only retreat experiences worldwide.',
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

export default async function HomePage() {
  const featuredRetreats = await getFeaturedRetreats();

  return (
    <main>
      <HeroSection />
      <WhatIsSection />
      <ActivitiesGrid />
      <TwoPaths />
      <UpcomingRetreats retreats={featuredRetreats} />
      <Testimonials />
      <WaitlistSection />
    </main>
  );
}

function WhatIsSection() {
  return (
    <section className="section-padding bg-dark-bg">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-8">WHAT IS ALPHA RETREATS?</h2>
          <p className="text-gray-300 font-body text-xl leading-relaxed mb-6">
            Alpha Retreats is not a wellness holiday. It is a deliberately hard, deliberately raw
            experience designed to strip away everything soft and remind you what you are made of.
          </p>
          <p className="text-gray-400 font-body text-lg leading-relaxed mb-6">
            We take men — successful, driven, but often disconnected — and put them in wilderness
            environments that demand full presence. Ice-cold water. Open fire. Axes. Mountains.
            Other men who refuse to settle for less.
          </p>
          <p className="text-gray-400 font-body text-lg leading-relaxed">
            Three to seven days. Global locations. A price that reflects the depth of what happens.
            You will leave different. That is a guarantee.
          </p>
        </div>
      </div>
    </section>
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
