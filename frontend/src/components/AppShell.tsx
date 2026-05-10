'use client';

import Link from 'next/link';
import { Bell, BookOpen, FileText, Gauge, Home, LogIn, ShieldCheck, UserPlus } from 'lucide-react';

const links = [
  { href: '/', label: 'Landing', icon: Home },
  { href: '/blogs', label: 'Public Blogs', icon: BookOpen },
  { href: '/dashboard', label: 'User Dashboard', icon: Gauge },
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/register', label: 'Register', icon: UserPlus },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <FileText size={18} />
          </span>
          Aaryan CMS
        </Link>
        <nav className="nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link className="nav-link" href={link.href} key={link.href}>
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
