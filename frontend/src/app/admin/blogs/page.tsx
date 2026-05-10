'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatRelative } from '@/lib/api';
import type { Blog, BlogStatus } from '@/lib/types';

const filters: { id: 'all' | BlogStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Drafts' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
];

export default function AdminAllBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filter, setFilter] = useState<'all' | BlogStatus>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Blog[]>('/admin/blogs')
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((blog) => {
      if (filter !== 'all' && blog.status !== filter) return false;
      if (!q) return true;
      return (
        blog.title?.toLowerCase().includes(q) ||
        blog.author?.email?.toLowerCase().includes(q)
      );
    });
  }, [blogs, filter, query]);

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="All blogs"
        subtitle="Every blog in the system, regardless of state. Approved blogs link to their public page."
      />

      <div className="panel" style={{ marginBottom: 16, padding: 14 }}>
        <div className="split">
          <div className="row" style={{ gap: 6 }}>
            {filters.map((option) => (
              <button
                key={option.id}
                className={`btn ${filter === option.id ? 'primary' : 'secondary'} tiny`}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 8, minWidth: 240 }}>
            <Search size={14} color="#64748b" />
            <input
              className="input"
              placeholder="Search by title or author"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ maxWidth: 280 }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No blogs" body="Try a different filter or search keyword." />
      ) : (
        <div className="stack">
          {filtered.map((blog) => (
            <article className="item-card stack-sm" key={blog.id}>
              <div className="split">
                <div>
                  <p className="text-strong" style={{ margin: 0, fontSize: 16 }}>{blog.title}</p>
                  <p className="meta" style={{ margin: 0 }}>
                    {blog.author?.email || 'Unknown author'} · updated {formatRelative(blog.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={blog.status} />
              </div>
              <p className="meta" style={{ margin: 0 }}>
                {(blog.content || '').slice(0, 220)}
                {(blog.content || '').length > 220 ? '…' : ''}
              </p>
              {blog.rejectionReason ? (
                <p className="notice danger" style={{ margin: 0 }}>
                  Rejection reason: {blog.rejectionReason}
                </p>
              ) : null}
              {blog.status === 'approved' ? (
                <Link href={`/blogs/${blog.id}`} target="_blank" className="btn ghost tiny" style={{ width: 'fit-content' }}>
                  <ExternalLink size={14} />
                  Open public page
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
