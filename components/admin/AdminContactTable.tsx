'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ContactMessage } from '@/types/database';

export default function AdminContactTable({ messages: initial }: { messages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const selected = selectedId ? messages.find((m) => m.id === selectedId) : null;

  const toggleRead = async (id: string, read: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').update({ read }).eq('id', id);
    if (!error) setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read } : m));
  };

  const saveNotes = async (id: string) => {
    setSaving(id);
    const supabase = createClient();
    await supabase.from('contact_messages').update({ notes: notes[id] || '' }).eq('id', id);
    setSaving(null);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <p className="font-body text-sm text-gray-500 mb-4">{unreadCount} unread of {messages.length} messages</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['', 'Name', 'Email', 'Subject', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-600 font-body text-sm">No messages yet</td></tr>
                ) : messages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => { setSelectedId(m.id); setNotes((n) => ({ ...n, [m.id]: m.notes || '' })); if (!m.read) toggleRead(m.id, true); }}
                    className={`border-b border-dark-border cursor-pointer transition-colors ${selectedId === m.id ? 'bg-burnt-orange/10' : 'hover:bg-dark-bg'}`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-2 h-2 rounded-full ${m.read ? 'bg-gray-700' : 'bg-burnt-orange'}`} />
                    </td>
                    <td className={`px-4 py-3 font-body text-sm ${m.read ? 'text-gray-400' : 'text-off-white font-medium'}`}>{m.name}</td>
                    <td className="px-4 py-3 font-body text-xs text-gray-500">{m.email}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-400">{m.subject || '—'}</td>
                    <td className="px-4 py-3 font-body text-xs text-gray-500">{new Date(m.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          {!selected ? (
            <p className="text-gray-600 font-body text-sm text-center py-8">Select a message to read it</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-heading text-xl text-off-white">MESSAGE</h3>
                <button
                  onClick={() => toggleRead(selected.id, !selected.read)}
                  className="font-body text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Mark as {selected.read ? 'unread' : 'read'}
                </button>
              </div>
              <div className="space-y-2 text-sm font-body">
                {[
                  ['From', selected.name],
                  ['Email', selected.email],
                  ['Subject', selected.subject || '—'],
                  ['Date', new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-gray-500">{label}:</span>{' '}
                    <span className="text-off-white">{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-gray-500 font-body text-sm mb-2">Message:</p>
                <p className="text-gray-300 font-body text-sm leading-relaxed bg-dark-bg rounded p-3 whitespace-pre-wrap">{selected.message}</p>
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
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message to Alpha Retreats'}`}
                className="inline-flex font-body text-sm text-burnt-orange hover:text-orange-400 transition-colors"
              >
                Reply via email →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
