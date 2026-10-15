import { NextResponse } from 'next/server';
import { createAdminClient, createRouteClient } from '@/lib/supabase/server';

// middleware.ts only guards /admin pages, not /api/admin routes, so every
// admin API handler must call this itself. Returns a response to send back
// when the caller is not an admin, or null when the request may proceed.
export async function requireAdmin(): Promise<NextResponse | null> {
  const authClient = createRouteClient();
  // getUser() verifies the token with Supabase; getSession() only reads the cookie.
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  return null;
}
