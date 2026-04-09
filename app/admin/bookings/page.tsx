import { createAdminClient } from '@/lib/supabase/server';
import AdminBookingsTable from '@/components/admin/AdminBookingsTable';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const supabase = createAdminClient();
  const [{ data: bookings }, { data: retreats }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, retreats(name, slug)')
      .order('created_at', { ascending: false }),
    supabase.from('retreats').select('id, name').order('name'),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">BOOKINGS</h1>
      <AdminBookingsTable bookings={bookings || []} retreats={retreats || []} />
    </div>
  );
}
