'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell,
  Compass,
  Files,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/approvals', label: 'Approvals', icon: ShieldCheck, badge: 'pending' as const },
  { href: '/admin/blogs', label: 'All Blogs', icon: Files },
  { href: '/admin/users', label: 'Users', icon: UserCog },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: 'unread' as const },
  { href: '/blogs', label: 'View Public Site', icon: Compass },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(0);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [stats, unreadResult] = await Promise.all([
          api<{ blogs: { pending: number } }>('/admin/stats'),
          api<{ count: number }>('/notifications/unread-count'),
        ]);
        if (!mounted) return;
        setPending(stats.blogs.pending);
        setUnread(unreadResult.count);
      } catch {
        /* ignore */
      }
    };
    void load();
    const interval = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          Aaryan CMS
        </Link>
        <p className="sidebar-section">Admin Console</p>
        <nav className="nav" aria-label="Admin dashboard">
          {links.map((link) => {
            const Icon = link.icon;
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            const count = link.badge === 'pending' ? pending : link.badge === 'unread' ? unread : 0;
            return (
              <Link
                key={link.href}
                className={`nav-link ${active ? 'active' : ''}`}
                href={link.href}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {count > 0 && <span className="nav-count">{count}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              {user?.email?.charAt(0) || 'A'}
            </span>
            <div style={{ display: 'grid', minWidth: 0 }}>
              <span className="text-strong" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>Administrator</span>
            </div>
          </div>
          <button
            className="btn ghost tiny"
            style={{ marginTop: 8, width: '100%', justifyContent: 'flex-start' }}
            onClick={() => {
              logout();
              router.replace('/');
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
