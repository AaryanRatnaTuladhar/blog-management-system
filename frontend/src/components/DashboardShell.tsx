'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  Compass,
  FilePlus,
  Files,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: Files },
  { href: '/dashboard/blogs/new', label: 'New Post', icon: FilePlus },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 'unread' as const },
  { href: '/blogs', label: 'Browse Public Blogs', icon: Compass },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      api<{ count: number }>('/notifications/unread-count')
        .then((data) => {
          if (mounted) setUnread(data.count);
        })
        .catch(() => undefined);
    };
    load();
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
        <p className="sidebar-section">Workspace</p>
        <nav className="nav" aria-label="User dashboard">
          {links.map((link) => {
            const Icon = link.icon;
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                className={`nav-link ${active ? 'active' : ''}`}
                href={link.href}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {link.badge === 'unread' && unread > 0 && (
                  <span className="nav-count">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user?.email?.charAt(0) || 'U'}</span>
            <div style={{ display: 'grid', minWidth: 0 }}>
              <span className="text-strong" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>Author</span>
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

export function DashboardLink({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: typeof BookOpen;
}) {
  return (
    <Link href={href} className="btn secondary tiny">
      {Icon ? <Icon size={14} /> : null}
      {children}
    </Link>
  );
}
