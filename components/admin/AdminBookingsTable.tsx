'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Booking } from '@/types/database';

const STATUSES = ['pending', 'deposit_paid', 'fully_paid', 'cancelled', 'refunded'] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  deposit_paid: 'text-blue-400',
  fully_paid: 'text-green-400',
  cancelled: 'text-red-400',
  refunded: 'text-gray-500',
};

interface BookingWithRetreat extends Booking {
  retreats?: { name: string; slug: string };
}

export default function AdminBookingsTable({
  bookings: initial,
  retreats,
}: {
  bookings: BookingWithRetreat[];
  retreats: { id: string; name: string }[];
}) {
  const [bookings, setBookings] = useState(initial);
  const [filterRetreat, setFilterRetreat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterRetreat !== 'all' && b.retreat_id !== filterRetreat) return false;
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      return true;
    });
  }, [bookings, filterRetreat, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    setSaving(id);
    const supabase = createClient();
    const { error } = await supabase.from('bookings').update({ status: status as Booking['status'] }).eq('id', id);
    if (!error) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: status as Booking['status'] } : b));
    }
    setSaving(null);
  };

  const saveNotes = async (id: string) => {
    setSaving(id);
    const supabase = createClient();
    await supabase.from('bookings').update({ notes: notes[id] || '' }).eq('id', id);
    setSaving(null);
  };

  const selected = selectedId ? bookings.find((b) => b.id === selectedId) : null;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterRetreat} onChange={(e) => setFilterRetreat(e.target.value)} className="input-dark py-1.5 text-sm w-auto">
          <option value="all">All Retreats</option>
          {retreats.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-dark py-1.5 text-sm w-auto">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="font-body text-sm text-gray-500 self-center">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Guest', 'Retreat', 'Spots', 'Deposit', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No bookings found</td></tr>
                ) : filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedId(b.id);
                      setNotes((n) => ({ ...n, [b.id]: b.notes || '' }));
                    }}
                    className={`border-b border-dark-border cursor-pointer transition-colors ${selectedId === b.id ? 'bg-burnt-orange/10' : 'hover:bg-dark-bg'}`}
                  >
                    <td className="px-4 py-3 font-body text-sm text-off-white">{b.first_name} {b.last_name}</td>
                    <td className="px-4 py-3 font-body text-xs text-gray-400">{b.retreats?.name || '—'}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-400">{b.spots}</td>
                    <td className="px-4 py-3 font-body text-sm text-burnt-orange">€{b.deposit_euros?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-body text-xs uppercase ${STATUS_COLORS[b.status] || 'text-gray-500'}`}>
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          {!selected ? (
            <p className="text-gray-600 font-body text-sm text-center py-8">Select a booking to view details</p>
          ) : (
            <div className="space-y-4">
              <h3 className="font-heading text-xl text-off-white">BOOKING DETAIL</h3>
              <div className="space-y-2 text-sm font-body">
                {[
                  ['Name', `${selected.first_name} ${selected.last_name}`],
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['Spots', String(selected.spots)],
                  ['Deposit Paid', `€${selected.deposit_euros?.toLocaleString()}`],
                  ['Total', `€${selected.total_euros?.toLocaleString()}`],
                  ['Balance', `€${((selected.total_euros || 0) - (selected.deposit_euros || 0)).toLocaleString()}`],
                  ['Booking Ref', selected.id.slice(0, 8).toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className="text-off-white text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="label-dark">Status</label>
                <select
                  className="input-dark"
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={saving === selected.id}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label-dark">Notes</label>
                <textarea
                  className="input-dark min-h-[80px] resize-none text-sm"
                  value={notes[selected.id] ?? selected.notes ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [selected.id]: e.target.value }))}
                  placeholder="Internal notes..."
                />
                <button
                  onClick={() => saveNotes(selected.id)}
                  disabled={saving === selected.id}
                  className="mt-2 font-body text-xs text-burnt-orange hover:text-orange-400 transition-colors disabled:opacity-50"
                >
                  {saving === selected.id ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
