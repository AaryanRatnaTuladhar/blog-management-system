'use client';

import { AuthGate } from '@/components/AuthGate';
import { DashboardShell } from '@/components/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="user">
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}
