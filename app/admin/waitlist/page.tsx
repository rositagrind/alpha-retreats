import { createAdminClient } from '@/lib/supabase/server';
import AdminWaitlistTable from '@/components/admin/AdminWaitlistTable';

export const dynamic = 'force-dynamic';

export default async function AdminWaitlistPage({ searchParams }: { searchParams: { retreat?: string } }) {
  const supabase = createAdminClient();
  const [{ data: waitlist }, { data: retreats }] = await Promise.all([
    supabase
      .from('waitlist')
      .select('*, retreats(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('retreats')
      .select('id, name, status')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">WAITLIST</h1>
      <AdminWaitlistTable
        waitlist={waitlist || []}
        retreats={retreats || []}
        initialFilter={searchParams.retreat || 'all'}
      />
    </div>
  );
}
