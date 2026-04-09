import { createAdminClient } from '@/lib/supabase/server';
import AdminContactTable from '@/components/admin/AdminContactTable';

export const dynamic = 'force-dynamic';

export default async function AdminContactPage() {
  const supabase = createAdminClient();
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">CONTACT MESSAGES</h1>
      <AdminContactTable messages={messages || []} />
    </div>
  );
}
