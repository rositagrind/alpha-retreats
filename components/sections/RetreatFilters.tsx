'use client';

import { useState, useMemo } from 'react';
import type { Retreat } from '@/types/database';
import RetreatCard from './RetreatCard';

const ALL_ACTIVITIES = [
  'Ice Baths', 'Wilderness Hiking', 'Fire Cooking', 'Axe Throwing',
  'Motorcycling', 'Cabin Building', 'Fishing', 'Animal Butchery', 'Gym Training', 'Chopping Wood',
];

export default function RetreatFilters({ retreats }: { retreats: Retreat[] }) {
  const [duration, setDuration] = useState<string>('all');
  const [activity, setActivity] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return retreats.filter((r) => {
      if (duration !== 'all') {
        if (duration === '3' && r.duration_days !== 3) return false;
        if (duration === '5' && r.duration_days !== 5) return false;
        if (duration === '7' && r.duration_days !== 7) return false;
      }
      if (activity !== 'all' && !r.activity_tags?.includes(activity)) return false;
      if (status !== 'all' && r.status !== status) return false;
      return true;
    });
  }, [retreats, duration, activity, status]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-10 pb-6 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-body">Duration:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input-dark py-1.5 text-sm w-auto pr-8"
          >
            <option value="all">All</option>
            <option value="3">3 Days</option>
            <option value="5">5 Days</option>
            <option value="7">7 Days</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-body">Activity:</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="input-dark py-1.5 text-sm w-auto pr-8"
          >
            <option value="all">All</option>
            {ALL_ACTIVITIES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-body">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-dark py-1.5 text-sm w-auto pr-8"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>
        {(duration !== 'all' || activity !== 'all' || status !== 'all') && (
          <button
            onClick={() => { setDuration('all'); setActivity('all'); setStatus('all'); }}
            className="text-xs text-gray-500 uppercase tracking-widest font-body hover:text-burnt-orange transition-colors"
          >
            Clear Filters ✕
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <p className="text-gray-600 font-body text-sm mb-6">{filtered.length} retreat{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((retreat) => (
              <RetreatCard key={retreat.id} retreat={retreat} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-24 border border-dark-border rounded-lg">
          <p className="font-heading text-4xl text-gray-700 mb-4">NO RETREATS FOUND</p>
          <p className="text-gray-500 font-body">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
