'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/types/database';

type MemberRow = Pick<Profile, 'id' | 'email' | 'full_name' | 'role' | 'created_at'>;

export default function AdminMembersPage() {
  const [profiles, setProfiles] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    const res = await fetch('/api/admin/members');
    if (res.ok) {
      setProfiles(await res.json());
    } else {
      setFetchError('Failed to load members.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const updateRole = async (id: string, role: 'member' | 'pending') => {
    setUpdating(id);
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });
    if (res.ok) await fetchProfiles();
    setUpdating(null);
  };

  const pending = profiles.filter((p) => p.role === 'pending');
  const members = profiles.filter((p) => p.role === 'member');

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-md text-off-white">MEMBERS</h1>
        <p className="text-gray-500 font-body text-sm mt-1">Manage membership applications and active members.</p>
      </div>

      {fetchError && (
        <p className="text-red-400 font-body text-sm mb-6 bg-red-900/20 border border-red-900/40 rounded p-3">
          {fetchError}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 font-body text-sm">Loading...</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="font-heading text-lg text-burnt-orange mb-4 tracking-wider">
              PENDING APPLICATIONS ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-gray-600 font-body text-sm">No pending applications.</p>
            ) : (
              <MemberTable rows={pending} actionLabel="Approve" actionRole="member" updating={updating} onAction={updateRole} />
            )}
          </section>

          <section>
            <h2 className="font-heading text-lg text-off-white mb-4 tracking-wider">
              ACTIVE MEMBERS ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="text-gray-600 font-body text-sm">No active members.</p>
            ) : (
              <MemberTable rows={members} actionLabel="Revoke" actionRole="pending" updating={updating} onAction={updateRole} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MemberTable({
  rows,
  actionLabel,
  actionRole,
  updating,
  onAction,
}: {
  rows: MemberRow[];
  actionLabel: 'Approve' | 'Revoke';
  actionRole: 'member' | 'pending';
  updating: string | null;
  onAction: (id: string, role: 'member' | 'pending') => void;
}) {
  const isRevoke = actionLabel === 'Revoke';

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Date</th>
            <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-dark-border/50 last:border-0">
              <td className="px-4 py-3 font-body text-sm text-off-white">{row.full_name || '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-gray-400">{row.email}</td>
              <td className="px-4 py-3">
                <span className={`font-body text-xs px-2 py-0.5 rounded ${
                  row.role === 'member'
                    ? 'bg-green-900/30 text-green-400 border border-green-900/50'
                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50'
                }`}>
                  {row.role}
                </span>
              </td>
              <td className="px-4 py-3 font-body text-sm text-gray-500">
                {new Date(row.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onAction(row.id, actionRole)}
                  disabled={updating === row.id}
                  className={`px-3 py-1.5 rounded font-body text-xs transition-colors disabled:opacity-50 ${
                    isRevoke
                      ? 'bg-red-900/20 text-red-400 border border-red-900/40 hover:bg-red-900/30'
                      : 'bg-burnt-orange/20 text-burnt-orange border border-burnt-orange/30 hover:bg-burnt-orange/30'
                  }`}
                >
                  {updating === row.id ? 'Updating...' : actionLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
