import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: Request) {
  const payload = await req.json();

  if (typeof payload.slug === 'string' && payload.slug.trim()) {
    payload.slug = slugify(payload.slug);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('retreats').insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
