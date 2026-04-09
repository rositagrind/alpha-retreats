import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import RetreatForm from '@/components/admin/RetreatForm';

export const dynamic = 'force-dynamic';

export default async function EditRetreatPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: retreat } = await supabase.from('retreats').select('*').eq('id', params.id).single();
  if (!retreat) notFound();

  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white mb-8">EDIT RETREAT</h1>
      <RetreatForm retreat={retreat} />
    </div>
  );
}
