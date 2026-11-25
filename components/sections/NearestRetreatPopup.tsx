'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Retreat } from '@/types/database';

const DISMISS_KEY = 'alpha_nearest_retreat_popup_dismissed';
const SHOW_DELAY_MS = 1500;

export default function NearestRetreatPopup({ retreat }: { retreat: Retreat | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!retreat) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // sessionStorage unavailable (privacy mode, etc.) — fail open and still show once.
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [retreat]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore — worst case it can show again this session
    }
  };

  if (!retreat || !visible) return null;

  const dateLabel = retreat.start_date
    ? new Date(retreat.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Dates coming soon';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true">
      <div className="relative max-w-sm w-full bg-dark-card border border-dark-border rounded-lg p-6 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-off-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="font-body text-burnt-orange uppercase tracking-widest text-xs mb-3 font-semibold">
          Next Up
        </p>
        <h3 className="font-heading text-2xl text-off-white mb-2 leading-tight">{retreat.name}</h3>
        <p className="font-body text-gray-400 text-sm mb-1">
          {retreat.location}, {retreat.country}
        </p>
        <p className="font-body text-gray-400 text-sm mb-5">{dateLabel}</p>

        <div className="flex gap-3">
          <Link
            href={`/retreats/${retreat.slug}`}
            onClick={dismiss}
            className="flex-1 bg-burnt-orange text-white font-body font-semibold text-xs uppercase tracking-widest px-4 py-3 rounded hover:bg-orange-700 transition-colors text-center"
          >
            View Retreat
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors px-2"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
