import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
export const ADMIN_EMAIL = 'alpharetreatsorg@gmail.com';
export const FROM_EMAIL = 'Alpha Retreats <notifications@alpha-retreats.com>';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://alpha-retreats.com').replace(/\/+$/, '');

type EmailPayload = Parameters<typeof resend.emails.send>[0];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// The Resend SDK does not throw on API errors (rate limits, rejected
// addresses, bad domain); it resolves with { error }. A .catch() alone never
// sees those, which is how failed admin notifications went unnoticed.
// This checks the result, retries once on transient failures, and logs.
export async function sendEmail(payload: EmailPayload, label: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data, error } = await resend.emails.send(payload);
      if (!error) return true;
      const retryable = error.name === 'rate_limit_exceeded' || error.name === 'application_error' || error.name === 'internal_server_error';
      console.error(`Resend: ${label} failed (attempt ${attempt})`, error, data);
      if (!retryable || attempt === 2) return false;
    } catch (err) {
      console.error(`Resend: ${label} threw (attempt ${attempt})`, err);
      if (attempt === 2) return false;
    }
    await sleep(1000);
  }
  return false;
}

// Sends one email per recipient via Resend's batch endpoint (max 100 per call).
export async function sendBatch(payloads: EmailPayload[], label: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100);
    try {
      const { error } = await resend.batch.send(chunk as Parameters<typeof resend.batch.send>[0]);
      if (error) {
        console.error(`Resend: ${label} batch ${i / 100 + 1} failed`, error);
        failed += chunk.length;
      } else {
        sent += chunk.length;
      }
    } catch (err) {
      console.error(`Resend: ${label} batch ${i / 100 + 1} threw`, err);
      failed += chunk.length;
    }
    if (i + 100 < payloads.length) await sleep(600);
  }
  return { sent, failed };
}
