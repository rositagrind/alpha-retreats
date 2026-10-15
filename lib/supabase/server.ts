import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Next.js caches fetch() calls by default, even inside routes marked
// `dynamic = 'force-dynamic'`. Supabase's client makes its requests via
// fetch() under the hood, so without this override, data reads could be
// served from a stale cached snapshot instead of the current database
// state. Forcing `cache: 'no-store'` here guarantees every Supabase call
// always hits the database fresh, regardless of route-level settings.
const noStoreFetch: typeof fetch = (url, options) =>
  fetch(url, { ...options, cache: 'no-store' });

export const createServerClient = () => {
  const cookieStore = cookies();
  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: noStoreFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};

export const createRouteClient = createServerClient;

export const createAdminClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: noStoreFetch },
    }
  );
