'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Retreat } from '@/types/database';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-400',
  coming_soon: 'bg-yellow-900/40 text-yellow-300',
  available: 'bg-green-900/40 text-green-300',
  sold_out: 'bg-red-900/40 text-red-300',
  completed: 'bg-gray-800 text-gray-500',
};

export default function AdminRetreatsTable({ retreats }: { retreats: Retreat[] }) {
  const [list, setList] = useState(retreats);
  const [deleting, setDeleting] = useState<string | null>(null);

  const toggleFeatured = async (retreat: Retreat) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('retreats')
      .update({ featured: !retreat.featured })
      .eq('id', retreat.id);
    if (!error) {
      setList((prev) => prev.map((r) => r.id === retreat.id ? { ...r, featured: !r.featured } : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this retreat? This cannot be undone.')) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from('retreats').delete().eq('id', id);
    setList((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              {['Name', 'Location', 'Duration', 'Price', 'Status', 'Featured', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-body uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-600 font-body text-sm">No retreats yet. Create your first one.</td></tr>
            ) : list.map((r) => (
              <tr key={r.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                <td className="px-6 py-4">
                  <p className="font-body text-sm text-off-white font-medium">{r.name}</p>
                  <p className="font-body text-xs text-gray-600">{r.slug}</p>
                </td>
                <td className="px-6 py-4 font-body text-sm text-gray-400">{r.location}, {r.country}</td>
                <td className="px-6 py-4 font-body text-sm text-gray-400">{r.duration_days}d</td>
                <td className="px-6 py-4 font-body text-sm text-burnt-orange">€{r.price_euros?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`status-badge text-xs px-2.5 py-1 ${STATUS_COLORS[r.status] || 'bg-gray-800 text-gray-400'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleFeatured(r)}
                    className={`font-body text-sm ${r.featured ? 'text-burnt-orange' : 'text-gray-600 hover:text-gray-400'} transition-colors`}
                    title={r.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {r.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/retreats/${r.id}/edit`}
                      className="font-body text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="font-body text-sm text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deleting === r.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
