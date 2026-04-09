import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MembersDashboard from '@/components/members/MembersDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Members Dashboard — Alpha Retreats',
  description: 'Your Alpha Retreats member dashboard.',
};

export default async function MembersPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/members/login');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, retreats(name, location, country, start_date, end_date, duration_days, hero_image, slug)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return <MembersDashboard bookings={bookings || []} profile={profile} userEmail={session.user.email || ''} />;
}
