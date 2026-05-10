import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';

export default function AdminGatewayPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin area"
        title="Admin workspace"
        subtitle="Admin tools are separated from the normal user dashboard."
      />
      <section className="panel stack">
        <ShieldCheck size={32} color="#b45309" />
        <h2 className="section-title">Go to admin dashboard</h2>
        <p className="meta">
          Review pending blogs, manage users, and moderate comments from the dedicated admin dashboard.
        </p>
        <Link className="btn primary" href="/admin/dashboard">
          Open Admin Dashboard
        </Link>
      </section>
    </AppShell>
  );
}
