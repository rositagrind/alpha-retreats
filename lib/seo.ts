// Shared SEO/structured-data helpers (Nov 2026 SEO + AI-visibility pass).
// SITE_URL mirrors the existing fallback pattern in lib/email.ts rather than
// introducing a second, possibly-inconsistent way of resolving the site origin.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://alpha-retreats.com').replace(/\/+$/, '');

export const ORG_NAME = 'Alpha Retreats';

// Reused by the sitewide Organization schema (layout.tsx) and anywhere else
// that needs a single, consistent entity description — the same description
// should eventually be reused in the Instagram bio / Google Business Profile
// once those exist, per the AI-visibility plan.
export const ORG_DESCRIPTION =
  'Alpha Retreats runs premium men-only wilderness retreats — one to seven days of primitive skills, ice baths, fire, and real disconnection from modern life, for a community of driven, successful men.';

// sameAs targets AI entity-resolution (it's how a model ties "Alpha Retreats"
// to one consistent thing across the web) as much as it targets search. Only
// list accounts that actually exist and are live — a dead/empty profile here
// is worse than omitting it. Update this array as real social accounts go
// live (see claude/instagram-socials-strategy.md for current status).
export const ORG_SAME_AS: string[] = [];

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: ORG_DESCRIPTION,
    email: 'hello@alpha-retreats.com',
    ...(ORG_SAME_AS.length > 0 ? { sameAs: ORG_SAME_AS } : {}),
  };
}

type RetreatForSchema = {
  name: string;
  slug: string;
  tagline: string | null;
  location: string;
  country: string;
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  price_euros: number;
  hero_image: string | null;
};

// TouristTrip is the schema.org type built for exactly this (a planned,
// bookable, multi-day trip to a destination) — closer to what a retreat
// actually is than the more generic Event, and still fully understood by
// Google and AI engines.
export function retreatJsonLd(retreat: RetreatForSchema) {
  const url = `${SITE_URL}/retreats/${retreat.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: retreat.name,
    description: retreat.tagline || `${retreat.name} — a ${retreat.duration_days}-day men's retreat in ${retreat.location}, ${retreat.country}.`,
    url,
    ...(retreat.hero_image ? { image: [retreat.hero_image] } : {}),
    ...(retreat.start_date ? { startDate: retreat.start_date } : {}),
    ...(retreat.end_date ? { endDate: retreat.end_date } : {}),
    touristType: 'Men seeking wilderness, primitive-skills, and personal-development experiences',
    itinerary: {
      '@type': 'Place',
      name: `${retreat.location}, ${retreat.country}`,
    },
    offers: {
      '@type': 'Offer',
      price: retreat.price_euros,
      priceCurrency: 'EUR',
      url,
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
