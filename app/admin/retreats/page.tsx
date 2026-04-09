'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminRetreatsTable from '@/components/admin/AdminRetreatsTable';
import NewRetreatButton from '@/components/admin/NewRetreatButton';
import type { Retreat } from '@/types/database';

export default function AdminRetreatsPage() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRetreats = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRetreats(data);
      setLoading(false);
    };
    fetchRetreats();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-off-white">RETREATS</h1>
        <NewRetreatButton />
      </div>
      {loading ? (
        <div className="text-gray-500 font-body text-sm py-12 text-center">Loading retreats...</div>
      ) : (
        <AdminRetreatsTable retreats={retreats} />
      )}
    </div>
  );
}
