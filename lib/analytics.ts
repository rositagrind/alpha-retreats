/**
 * Fires a GA4 event if gtag is loaded (see components/analytics/GoogleAnalytics.tsx).
 * Safe no-op if GA isn't configured yet — never throws, never blocks the UI.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', name, params);
}
