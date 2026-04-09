import { createAdminClient } from '@/lib/supabase/server';
import AdminWaitlistTable from '@/components/admin/AdminWaitlistTable';

export const dynamic = 'force-dynamic';

export default async function AdminWaitlistPage() {
  const supabase = createAdminClient();
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">WAITLIST</h1>
      <AdminWaitlistTable waitlist={waitlist || []} />
    </div>
  );
}
