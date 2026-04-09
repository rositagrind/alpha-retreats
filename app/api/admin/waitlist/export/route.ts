import { NextResponse } from 'next/server';
import { createAdminClient, createRouteClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const authClient = createRouteClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { data: waitlist } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (!waitlist) return NextResponse.json({ error: 'Failed to fetch waitlist.' }, { status: 500 });

    const headers = ['ID', 'Email', 'First Name', 'Source', 'Joined At'];
    const rows = waitlist.map((w) => [
      w.id,
      w.email,
      w.first_name || '',
      w.source || '',
      new Date(w.created_at).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="alpha-retreats-waitlist-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export waitlist.' }, { status: 500 });
  }
}
