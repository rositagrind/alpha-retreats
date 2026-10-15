import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import type { Waitlist } from '@/types/database';

type WaitlistRow = Waitlist & { retreats: { name: string; slug: string } | null };

// ?retreat=<id> exports one retreat's waitlist, ?retreat=general the general
// list (no retreat), and no parameter exports everything.
export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const supabase = createAdminClient();
    const retreatFilter = req.nextUrl.searchParams.get('retreat');

    let query = supabase
      .from('waitlist')
      .select('*, retreats(name, slug)')
      .order('created_at', { ascending: false });
    if (retreatFilter === 'general') query = query.is('retreat_id', null);
    else if (retreatFilter) query = query.eq('retreat_id', retreatFilter);

    const { data: waitlist } = await query;

    if (!waitlist) return NextResponse.json({ error: 'Failed to fetch waitlist.' }, { status: 500 });

    const rows = waitlist as unknown as WaitlistRow[];
    const headers = ['ID', 'Email', 'First Name', 'Retreat', 'Source', 'Joined At'];
    const csvRows = rows.map((w) => [
      w.id,
      w.email,
      w.first_name || '',
      w.retreats?.name || '',
      w.source || '',
      new Date(w.created_at).toISOString(),
    ]);

    const csv = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const suffix = retreatFilter === 'general' ? '-general' : retreatFilter ? `-${rows[0]?.retreats?.slug || 'retreat'}` : '';

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="alpha-retreats-waitlist${suffix}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export waitlist.' }, { status: 500 });
  }
}
