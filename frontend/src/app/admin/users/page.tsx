'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { api, formatRelative } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const load = () =>
    api<User[]>('/admin/users')
      .then(setUsers)
      .catch(() => setUsers([]));

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (target: User) => {
    setBusy(target.id);
    try {
      await api(`/admin/users/${target.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !target.isActive }),
      });
      setNotice({
        tone: 'success',
        text: `${target.email} is now ${!target.isActive ? 'active' : 'inactive'}.`,
      });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Could not update user.' });
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) => user.email?.toLowerCase().includes(q) || user.role?.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <>
      <PageHeader
        eyebrow="Users"
        title="Manage user accounts"
        subtitle="Toggle accounts active or inactive. Inactive users cannot log in."
      />

      <div className="panel" style={{ marginBottom: 16, padding: 14 }}>
        <div className="split">
          <p className="text-strong" style={{ margin: 0 }}>{filtered.length} users</p>
          <div className="row" style={{ gap: 8, minWidth: 240 }}>
            <Search size={14} color="#64748b" />
            <input
              className="input"
              placeholder="Search by email or role"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ maxWidth: 280 }}
            />
          </div>
        </div>
      </div>

      {notice ? (
        <p className={`notice ${notice.tone}`} style={{ marginBottom: 14 }}>{notice.text}</p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title="No users" body="Try a different search or seed demo users." />
      ) : (
        <div className="stack">
          {filtered.map((target) => {
            const isSelf = currentUser?.id === target.id;
            return (
              <article className="item-card split" key={target.id}>
                <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                  <span className="avatar">{target.email.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="text-strong" style={{ margin: 0 }}>{target.email}</p>
                    <p className="meta" style={{ margin: 0 }}>
                      Joined {formatRelative(target.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className={`badge ${target.role}`}>{target.role}</span>
                  <span className={`badge ${target.isActive ? 'approved' : 'rejected'}`}>
                    {target.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    className="btn secondary tiny"
                    onClick={() => toggle(target)}
                    disabled={busy === target.id || isSelf}
                    title={isSelf ? 'You cannot deactivate your own account' : 'Toggle active status'}
                  >
                    {target.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {target.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
