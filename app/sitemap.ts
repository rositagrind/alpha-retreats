import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

// Generates /sitemap.xml. Retreat slugs are pulled live from Supabase so this
// never goes stale as retreats are added, published, or retired — the exact
// problem with a hand-maintained sitemap, flagged in the Nov 2026 SEO audit.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/retreats`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/corporate`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const supabase = createAdminClient();
    const { data: retreats } = await supabase
      .from('retreats')
      .select('slug, updated_at')
      .neq('status', 'draft');

    const retreatRoutes: MetadataRoute.Sitemap = (retreats || []).map((r) => ({
      url: `${SITE_URL}/retreats/${r.slug}`,
      lastModified: r.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...retreatRoutes];
  } catch {
    // Supabase unreachable at build/request time: still ship the static
    // routes rather than a broken sitemap.
    return staticRoutes;
  }
}
