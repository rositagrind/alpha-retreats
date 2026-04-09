'use client';

import { useState } from 'react';
import type { Waitlist } from '@/types/database';
import Button from '@/components/ui/Button';
import { Download, Send } from 'lucide-react';

export default function AdminWaitlistTable({ waitlist }: { waitlist: Waitlist[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const toggleAll = () => {
    setSelected(selected.length === waitlist.length ? [] : waitlist.map((w) => w.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleExport = () => {
    window.open('/api/admin/waitlist/export', '_blank');
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setBroadcastMessage('Subject is required.'); setBroadcastStatus('error'); return; }
    if (!body.trim()) { setBroadcastMessage('Email body is required.'); setBroadcastStatus('error'); return; }
    if (selected.length === 0) { setBroadcastMessage('Select at least one recipient.'); setBroadcastStatus('error'); return; }
    setBroadcastStatus('loading');
    try {
      const res = await fetch('/api/admin/waitlist/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, recipientIds: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastStatus('success');
        setBroadcastMessage(data.message || 'Broadcast sent successfully.');
      } else {
        setBroadcastStatus('error');
        setBroadcastMessage(data.error || 'Failed to send broadcast.');
      }
    } catch {
      setBroadcastStatus('error');
      setBroadcastMessage('Network error. Please try again.');
    }
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="font-body text-sm text-gray-500">{waitlist.length} signups · {selected.length} selected</span>
        <button
          onClick={() => setShowBroadcast(!showBroadcast)}
          disabled={selected.length === 0}
          className="flex items-center gap-2 font-body text-sm px-4 py-2 bg-dark-card border border-dark-border rounded text-gray-300 hover:border-burnt-orange hover:text-burnt-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Broadcast Email
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 font-body text-sm px-4 py-2 bg-dark-card border border-dark-border rounded text-gray-300 hover:border-gray-500 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Broadcast Composer */}
      {showBroadcast && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6">
          <h2 className="font-heading text-xl text-off-white mb-4">EMAIL BROADCAST</h2>
          {broadcastStatus === 'success' ? (
            <div className="text-center py-4">
              <p className="font-heading text-xl text-burnt-orange mb-2">SENT!</p>
              <p className="text-gray-400 font-body text-sm">{broadcastMessage}</p>
              <button onClick={() => { setBroadcastStatus('idle'); setSubject(''); setBody(''); setShowBroadcast(false); }} className="mt-4 font-body text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="label-dark">Subject *</label>
                <input className="input-dark" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Early access — new retreat announced" />
              </div>
              <div>
                <label className="label-dark">Body *</label>
                <textarea className="input-dark min-h-[140px] resize-none" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your email content here..." />
              </div>
              <p className="text-gray-500 font-body text-xs">Sending to {selected.length} recipient{selected.length !== 1 ? 's' : ''}</p>
              {broadcastStatus === 'error' && <p className="text-red-400 font-body text-sm">{broadcastMessage}</p>}
              <div className="flex gap-3">
                <Button type="submit" loading={broadcastStatus === 'loading'}>Send Broadcast</Button>
                <button type="button" onClick={() => setShowBroadcast(false)} className="font-body text-sm text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === waitlist.length && waitlist.length > 0} onChange={toggleAll} className="accent-burnt-orange" />
                </th>
                {['Email', 'First Name', 'Source', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waitlist.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No signups yet</td></tr>
              ) : waitlist.map((w) => (
                <tr key={w.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(w.id)} onChange={() => toggleOne(w.id)} className="accent-burnt-orange" />
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-off-white">{w.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-400">{w.first_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">{w.source || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
