import { createAdminClient } from '@/lib/supabase/server';
import type { Booking, CorporateEnquiry } from '@/types/database';

type BookingWithRetreat = Booking & { retreats: { name: string } | null };

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createAdminClient();
  const [retreats, bookings, waitlist, enquiries] = await Promise.all([
    supabase.from('retreats').select('id', { count: 'exact' }),
    supabase.from('bookings').select('id', { count: 'exact' }),
    supabase.from('waitlist').select('id', { count: 'exact' }),
    supabase.from('corporate_enquiries').select('id', { count: 'exact' }).eq('status', 'new'),
  ]);
  return {
    retreats: retreats.count || 0,
    bookings: bookings.count || 0,
    waitlist: waitlist.count || 0,
    pendingEnquiries: enquiries.count || 0,
  };
}

async function getRecentBookings(): Promise<BookingWithRetreat[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, retreats(name)')
    .order('created_at', { ascending: false })
    .limit(10);
  return (data || []) as BookingWithRetreat[];
}

async function getRecentEnquiries(): Promise<CorporateEnquiry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('corporate_enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data || []) as CorporateEnquiry[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  deposit_paid: 'text-blue-400',
  fully_paid: 'text-green-400',
  cancelled: 'text-red-400',
  refunded: 'text-gray-500',
  new: 'text-yellow-400',
  in_progress: 'text-blue-400',
  proposal_sent: 'text-purple-400',
  closed: 'text-gray-500',
};

export default async function AdminDashboard() {
  const [stats, bookings, enquiries] = await Promise.all([
    getStats(),
    getRecentBookings(),
    getRecentEnquiries(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">DASHBOARD</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Retreats', value: stats.retreats },
          { label: 'Total Bookings', value: stats.bookings },
          { label: 'Waitlist Signups', value: stats.waitlist },
          { label: 'Pending Enquiries', value: stats.pendingEnquiries },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-card border border-dark-border rounded-lg p-6">
            <p className="text-gray-500 font-body text-xs uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="font-heading text-4xl text-off-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-dark-card border border-dark-border rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <h2 className="font-heading text-xl text-off-white">RECENT BOOKINGS</h2>
          <a href="/admin/bookings" className="text-burnt-orange font-body text-sm hover:text-orange-400 transition-colors">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Name', 'Retreat', 'Spots', 'Deposit', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No bookings yet</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                  <td className="px-6 py-4 font-body text-sm text-off-white">{b.first_name} {b.last_name}</td>
                  <td className="px-6 py-4 font-body text-sm text-gray-400">{b.retreats?.name || '—'}</td>
                  <td className="px-6 py-4 font-body text-sm text-gray-400">{b.spots}</td>
                  <td className="px-6 py-4 font-body text-sm text-burnt-orange">€{b.deposit_euros?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`font-body text-xs uppercase tracking-wider ${STATUS_COLORS[b.status] || 'text-gray-500'}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-gray-500">
                    {new Date(b.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-dark-card border border-dark-border rounded-lg">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <h2 className="font-heading text-xl text-off-white">RECENT CORPORATE ENQUIRIES</h2>
          <a href="/admin/corporate" className="text-burnt-orange font-body text-sm hover:text-orange-400 transition-colors">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Company', 'Contact', 'Team Size', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No enquiries yet</td></tr>
              ) : enquiries.map((e) => (
                <tr key={e.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                  <td className="px-6 py-4 font-body text-sm text-off-white">{e.company_name}</td>
                  <td className="px-6 py-4 font-body text-sm text-gray-400">{e.contact_name}</td>
                  <td className="px-6 py-4 font-body text-sm text-gray-400">{e.team_size || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`font-body text-xs uppercase tracking-wider ${STATUS_COLORS[e.status] || 'text-gray-500'}`}>
                      {e.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-gray-500">
                    {new Date(e.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
