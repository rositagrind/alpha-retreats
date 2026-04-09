'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CorporateEnquiry } from '@/types/database';

const STATUSES = ['new', 'in_progress', 'proposal_sent', 'closed'] as const;
const STATUS_COLORS: Record<string, string> = {
  new: 'text-yellow-400',
  in_progress: 'text-blue-400',
  proposal_sent: 'text-purple-400',
  closed: 'text-gray-500',
};

export default function AdminCorporateTable({ enquiries: initial }: { enquiries: CorporateEnquiry[] }) {
  const [enquiries, setEnquiries] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const selected = selectedId ? enquiries.find((e) => e.id === selectedId) : null;

  const updateStatus = async (id: string, status: string) => {
    setSaving(id);
    const supabase = createClient();
    const { error } = await supabase.from('corporate_enquiries').update({ status: status as CorporateEnquiry['status'] }).eq('id', id);
    if (!error) setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status: status as CorporateEnquiry['status'] } : e));
    setSaving(null);
  };

  const saveNotes = async (id: string) => {
    setSaving(id);
    const supabase = createClient();
    await supabase.from('corporate_enquiries').update({ notes: notes[id] || '' }).eq('id', id);
    setSaving(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Company', 'Contact', 'Email', 'Team', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No enquiries yet</td></tr>
              ) : enquiries.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => { setSelectedId(e.id); setNotes((n) => ({ ...n, [e.id]: e.notes || '' })); }}
                  className={`border-b border-dark-border cursor-pointer transition-colors ${selectedId === e.id ? 'bg-burnt-orange/10' : 'hover:bg-dark-bg'}`}
                >
                  <td className="px-4 py-3 font-body text-sm text-off-white">{e.company_name}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-400">{e.contact_name}</td>
                  <td className="px-4 py-3 font-body text-xs text-gray-500">{e.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-400">{e.team_size || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-body text-xs uppercase ${STATUS_COLORS[e.status] || 'text-gray-500'}`}>
                      {e.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-gray-500">{new Date(e.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        {!selected ? (
          <p className="text-gray-600 font-body text-sm text-center py-8">Select an enquiry to view details</p>
        ) : (
          <div className="space-y-4">
            <h3 className="font-heading text-xl text-off-white">ENQUIRY DETAIL</h3>
            <div className="space-y-2 text-sm font-body">
              {[
                ['Company', selected.company_name],
                ['Contact', selected.contact_name],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Team Size', selected.team_size ? String(selected.team_size) : '—'],
                ['Preferred Dates', selected.preferred_dates || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-gray-500">{label}:</span>{' '}
                  <span className="text-off-white">{value}</span>
                </div>
              ))}
              {selected.goals && (
                <div>
                  <p className="text-gray-500 mb-1">Goals:</p>
                  <p className="text-gray-300 bg-dark-bg rounded p-3 text-sm leading-relaxed">{selected.goals}</p>
                </div>
              )}
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
  );
}
