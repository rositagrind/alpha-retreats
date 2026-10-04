import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const payload = await req.json();

  const supabase = createAdminClient();
  const { error } = await supabase.from('retreats').update(payload).eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
