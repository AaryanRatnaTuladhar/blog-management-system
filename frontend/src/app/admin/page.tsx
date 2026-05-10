'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Files, ShieldCheck, UserCog, Users } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatRelative } from '@/lib/api';
import type { AdminStats, Blog } from '@/lib/types';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Blog[]>([]);

  useEffect(() => {
    api<AdminStats>('/admin/stats').then(setStats).catch(() => setStats(null));
    api<Blog[]>('/admin/blogs/pending').then(setPending).catch(() => setPending([]));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Admin overview"
        title="Editorial control center"
        subtitle="Approve incoming submissions, moderate the public site, and manage user access."
        action={
          <Link className="btn primary" href="/admin/approvals">
            <ShieldCheck size={16} />
            Review approvals
          </Link>
        }
      />

      <div className="grid four" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <p className="stat-label">Pending review</p>
          <p className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.blogs.pending ?? 0}</p>
          <p className="meta" style={{ marginTop: 4 }}>Awaiting approval</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Published</p>
          <p className="stat-value" style={{ color: 'var(--success)' }}>{stats?.blogs.approved ?? 0}</p>
          <p className="meta" style={{ marginTop: 4 }}>Live on the public site</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rejected</p>
          <p className="stat-value" style={{ color: 'var(--danger)' }}>{stats?.blogs.rejected ?? 0}</p>
          <p className="meta" style={{ marginTop: 4 }}>Awaiting author edits</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Users</p>
          <p className="stat-value">{stats?.users.total ?? 0}</p>
          <p className="meta" style={{ marginTop: 4 }}>
            {stats?.users.users ?? 0} authors · {stats?.users.admins ?? 0} admins
          </p>
        </div>
      </div>

      <div className="grid two">
        <section className="panel">
          <div className="split">
            <h2 className="section-title" style={{ margin: 0 }}>Pending approvals</h2>
            <Link href="/admin/approvals" className="btn ghost tiny">
              Open queue <ArrowRight size={14} />
            </Link>
          </div>
          <div className="stack" style={{ marginTop: 12 }}>
            {pending.length === 0 ? (
              <EmptyState
                title="Approval queue is empty"
                body="Submitted drafts will appear here for review."
              />
            ) : (
              pending.slice(0, 5).map((blog) => (
                <article className="item-card stack-sm" key={blog.id}>
                  <div className="split">
                    <div>
                      <p className="text-strong" style={{ margin: 0 }}>{blog.title}</p>
                      <p className="meta" style={{ margin: 0 }}>
                        {blog.author?.email || 'Unknown'} · submitted {formatRelative(blog.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={blog.status} />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel stack">
          <h2 className="section-title" style={{ margin: 0 }}>Quick links</h2>
          <Link href="/admin/blogs" className="item-card row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="row" style={{ gap: 10 }}>
              <span className="feature-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', marginBottom: 0 }}>
                <Files size={18} />
              </span>
              <span>
                <span className="text-strong" style={{ display: 'block' }}>All blogs</span>
                <span className="meta">Browse every draft, pending, approved, and rejected blog.</span>
              </span>
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/admin/users" className="item-card row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="row" style={{ gap: 10 }}>
              <span className="feature-icon" style={{ background: '#dcfce7', color: '#15803d', marginBottom: 0 }}>
                <Users size={18} />
              </span>
              <span>
                <span className="text-strong" style={{ display: 'block' }}>Users</span>
                <span className="meta">Activate or deactivate user accounts.</span>
              </span>
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/admin/comments" className="item-card row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="row" style={{ gap: 10 }}>
              <span className="feature-icon" style={{ background: '#fef3c7', color: '#b45309', marginBottom: 0 }}>
                <UserCog size={18} />
              </span>
              <span>
                <span className="text-strong" style={{ display: 'block' }}>Comments moderation</span>
                <span className="meta">Soft-delete inappropriate comments and replies.</span>
              </span>
            </span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
