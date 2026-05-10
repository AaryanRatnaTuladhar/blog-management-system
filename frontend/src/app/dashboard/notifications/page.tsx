'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { NotificationItem } from '@/components/NotificationItem';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
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
        title="Notifications"
        subtitle="Approval decisions and comment activity arrive here as in-app notifications."
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
        <EmptyState
          title="No notifications yet"
          body="You will see updates here when your blogs are approved or rejected, and when readers comment or reply."
        />
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
