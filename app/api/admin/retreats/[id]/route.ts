import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { FROM_EMAIL, ADMIN_EMAIL, SITE_URL, escapeHtml, sendBatch, sendEmail } from '@/lib/email';
import type { Retreat } from '@/types/database';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Statuses where the public can join a retreat's waitlist. Moving from one of
// these to 'available' means spots just opened, so the waitlist gets told.
const WAITLIST_STATUSES = ['coming_soon', 'sold_out'];

function formatDates(r: Pick<Retreat, 'start_date' | 'end_date'>) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (r.start_date && r.end_date) return `${fmt(r.start_date)} to ${fmt(r.end_date)}`;
  if (r.start_date) return fmt(r.start_date);
  return null;
}

async function notifyWaitlistSpotsOpen(retreat: Retreat) {
  const supabase = createAdminClient();
  const { data: signups, error } = await supabase
    .from('waitlist')
    .select('email, first_name')
    .eq('retreat_id', retreat.id);

  if (error) {
    console.error('Spots-open notification: failed to load waitlist', error);
    return { sent: 0, failed: 0 };
  }
  if (!signups || signups.length === 0) return { sent: 0, failed: 0 };

  const url = `${SITE_URL}/retreats/${retreat.slug}`;
  const dates = formatDates(retreat);
  const name = escapeHtml(retreat.name);

  const payloads = signups.map((s) => ({
    from: FROM_EMAIL,
    to: s.email,
    replyTo: ADMIN_EMAIL,
    subject: `Spots are open: ${retreat.name} | Alpha Retreats`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 0.5px; color: #b5502e; margin-bottom: 16px;">SPOTS ARE OPEN.</p>
        <p>${s.first_name ? `${escapeHtml(s.first_name)}, y` : 'Y'}ou asked to hear first. ${name} is now open for booking.</p>
        <p>
          ${escapeHtml(retreat.location)}${retreat.country ? `, ${escapeHtml(retreat.country)}` : ''}<br>
          ${dates ? `${dates}<br>` : ''}
          €${retreat.price_euros} · ${retreat.spots_remaining} spot${retreat.spots_remaining === 1 ? '' : 's'}
        </p>
        <p><a href="${url}" style="display: inline-block; background: #b5502e; color: #fff; padding: 12px 22px; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">SECURE YOUR SPOT</a></p>
        <p>Spots are limited and go in order of booking.</p>
        <p style="margin-top: 32px;">Salvador<br>Alpha Retreats</p>
      </div>
    `,
  }));

  const result = await sendBatch(payloads, `spots-open notification (${retreat.slug})`);

  await sendEmail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Waitlist notified: ${retreat.name} is open (${result.sent} sent${result.failed ? `, ${result.failed} failed` : ''})`,
    html: `<p><strong>${name}</strong> was set to available. ${result.sent} waitlist ${result.sent === 1 ? 'person was' : 'people were'} emailed that spots are open.${result.failed ? ` <strong>${result.failed} failed</strong>, check the Vercel logs.` : ''}</p><p><a href="${url}">View listing</a></p>`,
  }, 'spots-open admin summary');

  return result;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const payload = await req.json();

  if (typeof payload.slug === 'string' && payload.slug.trim()) {
    payload.slug = slugify(payload.slug);
  }

  const supabase = createAdminClient();

  const { data: before } = await supabase.from('retreats').select('status').eq('id', params.id).maybeSingle();

  const { data: updated, error } = await supabase
    .from('retreats')
    .update(payload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let notified: { sent: number; failed: number } | null = null;
  if (before && WAITLIST_STATUSES.includes(before.status) && updated.status === 'available') {
    notified = await notifyWaitlistSpotsOpen(updated);
  }

  return NextResponse.json({ success: true, notified });
}
