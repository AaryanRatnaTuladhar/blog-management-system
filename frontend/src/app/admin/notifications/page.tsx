'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { NotificationItem } from '@/components/NotificationItem';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import type { Notification } from '@/lib/types';

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api<Notification[]>('/notifications').then(setItems).catch(() => setItems([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const unread = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const markRead = async (id: string) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      await load();
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      await api('/notifications/read-all', { method: 'PATCH' });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="My notifications"
        subtitle="In-app activity from the queue worker — approvals, comments, and replies."
        action={
          <>
            <span className="badge pending">{unread} unread</span>
            {unread > 0 && (
              <button className="btn secondary tiny" onClick={markAllRead} disabled={busy}>
                <CheckCheck size={14} />
                Mark all as read
              </button>
            )}
          </>
        }
      />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="Nothing here" body="Notifications appear when async tasks finish or when comments arrive." />
      ) : (
        <div className="stack">
          {items.map((item) => (
            <NotificationItem key={item.id} notification={item} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </>
  );
}
