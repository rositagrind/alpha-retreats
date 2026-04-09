import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import type { Retreat } from '@/types/database';
import RetreatFilters from '@/components/sections/RetreatFilters';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Retreats — Men\'s Wilderness Experiences',
  description:
    'Browse all Alpha Retreats experiences. Filter by duration, activity type, and availability. Premium men-only retreats from €3,000.',
  openGraph: {
    title: 'All Retreats | Alpha Retreats',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200'],
  },
};

async function getAllRetreats(): Promise<Retreat[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('retreats')
      .select('*')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export default async function RetreatsPage() {
  const retreats = await getAllRetreats();

  return (
    <main className="pt-20">
      <section className="section-padding bg-dark-bg">
        <div className="container-wide">
          <div className="mb-12">
            <h1 className="heading-xl mb-4">ALL RETREATS</h1>
            <p className="text-gray-400 font-body text-lg max-w-2xl">
              Each retreat is designed for a specific kind of challenge. Browse, choose, and commit. Spots are always limited.
            </p>
          </div>

          <RetreatFilters retreats={retreats} />
        </div>
      </section>
    </main>
  );
}
