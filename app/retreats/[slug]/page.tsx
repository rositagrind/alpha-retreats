import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import type { Retreat, ItineraryDay } from '@/types/database';
import RetreatBookingPanel from '@/components/sections/RetreatBookingPanel';
import ItineraryAccordion from '@/components/sections/ItineraryAccordion';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

async function getRetreat(slug: string): Promise<Retreat | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('retreats')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'draft')
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const retreat = await getRetreat(params.slug);
  if (!retreat) return { title: 'Retreat Not Found' };
  return {
    title: retreat.meta_title || `${retreat.name} — Alpha Retreats`,
    description: retreat.meta_description || retreat.tagline || '',
    openGraph: {
      title: retreat.meta_title || retreat.name,
      description: retreat.meta_description || retreat.tagline || '',
      images: retreat.hero_image ? [retreat.hero_image] : [],
    },
  };
}

export default async function RetreatPage({ params }: Props) {
  const retreat = await getRetreat(params.slug);
  if (!retreat) notFound();

  const itinerary = (Array.isArray(retreat.itinerary) ? retreat.itinerary : []) as ItineraryDay[];
  const heroImage = retreat.hero_image || retreat.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920';

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src={heroImage}
          alt={retreat.name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="container-wide">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-400 font-body text-sm">{retreat.location}, {retreat.country}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400 font-body text-sm">{retreat.duration_days} days</span>
            </div>
            <h1 className="heading-xl mb-2">{retreat.name.toUpperCase()}</h1>
            {retreat.tagline && (
              <p className="text-gray-300 font-body text-xl max-w-2xl">{retreat.tagline}</p>
            )}
          </div>
        </div>
      </section>

      {/* Content + Booking */}
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {retreat.description && (
              <div>
                <h2 className="heading-md mb-6">ABOUT THIS RETREAT</h2>
                <div
                  className="retreat-content text-gray-300 font-body leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: retreat.description }}
                />
              </div>
            )}

            {/* Activities */}
            {retreat.activity_tags && retreat.activity_tags.length > 0 && (
              <div>
                <h2 className="heading-md mb-6">ACTIVITIES</h2>
                <div className="flex flex-wrap gap-3">
                  {retreat.activity_tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-dark-card border border-dark-border text-off-white font-body text-sm px-4 py-2 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div>
                <h2 className="heading-md mb-6">DAY BY DAY</h2>
                <ItineraryAccordion itinerary={itinerary} />
              </div>
            )}

            {/* Included / Not Included */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {retreat.included && retreat.included.length > 0 && (
                <div>
                  <h2 className="heading-md mb-4 text-green-400">INCLUDED</h2>
                  <ul className="space-y-2">
                    {retreat.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 font-body text-sm">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {retreat.not_included && retreat.not_included.length > 0 && (
                <div>
                  <h2 className="heading-md mb-4 text-red-400">NOT INCLUDED</h2>
                  <ul className="space-y-2">
                    {retreat.not_included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-400 font-body text-sm">
                        <span className="text-red-400 mt-0.5">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {retreat.images && retreat.images.length > 1 && (
              <div>
                <h2 className="heading-md mb-6">GALLERY</h2>
                <div className="grid grid-cols-2 gap-3">
                  {retreat.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={img}
                        alt={`${retreat.name} image ${i + 2}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enquiry form */}
            <RetreatEnquiry retreatName={retreat.name} />
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RetreatBookingPanel retreat={retreat} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function RetreatEnquiry({ retreatName }: { retreatName: string }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-8">
      <h2 className="heading-md mb-2">HAVE A QUESTION?</h2>
      <p className="text-gray-400 font-body text-sm mb-6">
        Not ready to book? We&apos;re happy to answer any questions about {retreatName}.
      </p>
      <Link href="/contact" className="btn-secondary inline-flex">
        Contact Us
      </Link>
    </div>
  );
}
