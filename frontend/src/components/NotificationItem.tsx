import Link from 'next/link';
import { Bell, CheckCheck, MessageSquare, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Notification } from '@/lib/types';
import { formatRelative } from '@/lib/api';

function describe(notification: Notification) {
  const payload = notification.payload || {};
  const title = (payload.title as string) || 'a blog';
  switch (notification.type) {
    case 'blog_approved':
      return {
        icon: ThumbsUp,
        color: '#15803d',
        message: `Your blog "${title}" was approved and is now public.`,
      };
    case 'blog_rejected':
      return {
        icon: ThumbsDown,
        color: '#b91c1c',
        message: `Your blog "${title}" was rejected${payload.reason ? `: ${payload.reason}` : '.'}`,
      };
    case 'blog_comment':
      return {
        icon: MessageSquare,
        color: '#4f46e5',
        message: 'Someone commented on your blog.',
      };
    case 'blog_reply':
      return {
        icon: MessageSquare,
        color: '#4f46e5',
        message: 'Someone replied on your blog.',
      };
    default:
      return {
        icon: Bell,
        color: '#475569',
        message: notification.type,
      };
  }
}

export function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}) {
  const info = describe(notification);
  const Icon = info.icon;
  const blogId = notification.payload?.blogId as string | undefined;
  return (
    <article className="item-card" style={notification.isRead ? {} : { borderColor: '#c7d2fe' }}>
      <div className="split">
        <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
          <span
            className="feature-icon"
            style={{ background: `${info.color}1A`, color: info.color, marginBottom: 0 }}
          >
            <Icon size={18} />
          </span>
          <div className="stack-sm">
            <p className="text-strong" style={{ margin: 0 }}>{info.message}</p>
            <p className="meta" style={{ margin: 0 }}>
              {formatRelative(notification.createdAt)}
              {notification.isRead ? '' : ' · unread'}
            </p>
            {blogId ? (
              <Link href={`/blogs/${blogId}`} className="btn ghost tiny" style={{ width: 'fit-content', padding: '4px 8px' }}>
                Open blog
              </Link>
            ) : null}
          </div>
        </div>
        {!notification.isRead && onMarkRead ? (
          <button className="btn secondary tiny" onClick={() => onMarkRead(notification.id)}>
            <CheckCheck size={14} />
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function notificationIcon(type: string) {
  switch (type) {
    case 'blog_approved':
      return ShieldCheck;
    case 'blog_rejected':
      return ThumbsDown;
    case 'blog_comment':
    case 'blog_reply':
      return MessageSquare;
    default:
      return Bell;
  }
}
