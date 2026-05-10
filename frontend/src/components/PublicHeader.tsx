'use client';

import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogIn, LogOut, Sparkles, UserPlus } from 'lucide-react';
import { homeFor, useAuth } from '@/lib/auth';

export function PublicHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          Aaryan CMS
        </Link>
        <nav className="public-nav-links" aria-label="Public navigation">
          <Link href="/blogs">
            <span className="row" style={{ gap: 6 }}>
              <BookOpen size={16} />
              Blogs
            </span>
          </Link>
          {user ? (
            <>
              <Link href={homeFor(user.role)}>
                <span className="row" style={{ gap: 6 }}>
                  <LayoutDashboard size={16} />
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </span>
              </Link>
              <button
                className="btn ghost tiny"
                onClick={logout}
                title={`Sign out ${user.email}`}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn secondary tiny">
                <LogIn size={14} />
                Login
              </Link>
              <Link href="/register" className="btn primary tiny">
                <UserPlus size={14} />
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
