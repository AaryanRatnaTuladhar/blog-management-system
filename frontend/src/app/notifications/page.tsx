'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { api, formatDate } from '@/lib/api';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');
  const load = () => api('/notifications').then(setItems);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch {
        setMessage('Login to view notifications.');
      }
    })();
  }, []);

  const unread = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Async events"
        title="Notifications"
        subtitle="Blog approval decisions and comment activity are delivered here as in-app notifications."
        action={<span className="badge pending">{unread} unread</span>}
      />
      {message && <div className="empty" style={{ marginBottom: 16 }}>{message}</div>}
      <section className="panel">
        <div className="stack">
          {items.length === 0 ? (
            <EmptyState title="No notifications" body="Approval, rejection, comment, and reply events will show up here." />
          ) : (
            items.map((item) => (
              <article className="item-card split" key={item.id}>
                <div>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>
                    <Bell size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.type}
                  </h2>
                  <p>{JSON.stringify(item.payload)}</p>
                  <p className="meta">
                    {formatDate(item.createdAt)} · read: {String(item.isRead)}
                  </p>
                </div>
                {!item.isRead && (
                  <button
                    className="btn primary"
                    onClick={() => api(`/notifications/${item.id}/read`, { method: 'PATCH' }).then(load)}
                    title="Mark notification as read"
                  >
                    <CheckCheck size={16} />
                    Mark read
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
