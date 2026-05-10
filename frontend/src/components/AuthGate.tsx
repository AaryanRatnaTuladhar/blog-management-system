'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth, homeFor } from '@/lib/auth';
import type { Role } from '@/lib/types';

export function AuthGate({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const target = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(`/login?next=${encodeURIComponent(target)}`);
      return;
    }
    if (role && user.role !== role) {
      router.replace(homeFor(user.role));
    }
  }, [loading, user, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }
  return <>{children}</>;
}
