'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ItineraryDay } from '@/types/database';

export default function ItineraryAccordion({ itinerary }: { itinerary: ItineraryDay[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {itinerary.map((day, i) => (
        <div key={i} className="border border-dark-border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-dark-card transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="font-heading text-burnt-orange text-xl">DAY {day.day}</span>
              <span className="font-heading text-xl text-off-white">{day.title}</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5 pt-1 border-t border-dark-border">
              <p className="text-gray-400 font-body leading-relaxed">{day.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
