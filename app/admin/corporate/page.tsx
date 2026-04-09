import { createAdminClient } from '@/lib/supabase/server';
import AdminCorporateTable from '@/components/admin/AdminCorporateTable';

export const dynamic = 'force-dynamic';

export default async function AdminCorporatePage() {
  const supabase = createAdminClient();
  const { data: enquiries } = await supabase
    .from('corporate_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">CORPORATE ENQUIRIES</h1>
      <AdminCorporateTable enquiries={enquiries || []} />
    </div>
  );
}
