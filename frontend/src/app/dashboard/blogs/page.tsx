'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Edit3, FilePlus, Send, Trash2 } from 'lucide-react';
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

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filter, setFilter] = useState<'all' | BlogStatus>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const load = () => api<Blog[]>('/blogs/mine').then(setBlogs).catch(() => setBlogs([]));

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? blogs : blogs.filter((blog) => blog.status === filter)),
    [blogs, filter],
  );

  const submit = async (blog: Blog) => {
    setBusy(blog.id);
    try {
      await api(`/blogs/${blog.id}/submit`, { method: 'POST' });
      setNotice({ tone: 'success', text: `"${blog.title}" was submitted for admin approval.` });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Could not submit.' });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (blog: Blog) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setBusy(blog.id);
    try {
      await api(`/blogs/${blog.id}`, { method: 'DELETE' });
      setNotice({ tone: 'success', text: `Deleted "${blog.title}".` });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Could not delete.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="My writing"
        title="My blogs"
        subtitle="Edit drafts, submit for admin approval, or remove posts you no longer need."
        action={
          <Link className="btn primary" href="/dashboard/blogs/new">
            <FilePlus size={16} />
            New blog
          </Link>
        }
      />

      <div className="row" style={{ marginBottom: 16, gap: 6 }}>
        {filters.map((option) => (
          <button
            key={option.id}
            className={`btn ${filter === option.id ? 'primary' : 'secondary'} tiny`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
            {option.id !== 'all' && (
              <span className="meta" style={{ color: 'inherit', opacity: 0.8 }}>
                ({blogs.filter((blog) => blog.status === option.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {notice ? (
        <p className={`notice ${notice.tone}`} style={{ marginBottom: 14 }}>
          {notice.text}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No blogs in this view"
          body={
            blogs.length === 0
              ? 'Create your first draft to start the approval workflow.'
              : 'Try switching to a different status filter above.'
          }
          action={
            <Link className="btn primary" href="/dashboard/blogs/new">
              <FilePlus size={14} /> Create blog
            </Link>
          }
        />
      ) : (
        <div className="stack">
          {filtered.map((blog) => (
            <article className="item-card stack-sm" key={blog.id}>
              <div className="split">
                <div>
                  <h3 className="text-strong" style={{ margin: 0, fontSize: 16 }}>{blog.title}</h3>
                  <p className="meta" style={{ margin: 0 }}>
                    Updated {formatRelative(blog.updatedAt)}
                    {blog.publishedAt ? ` · Published ${formatRelative(blog.publishedAt)}` : ''}
                  </p>
                </div>
                <StatusBadge status={blog.status} />
              </div>
              <p className="meta" style={{ margin: 0 }}>
                {(blog.content || '').slice(0, 200)}
                {(blog.content || '').length > 200 ? '…' : ''}
              </p>
              {blog.rejectionReason ? (
                <p className="notice danger" style={{ marginTop: 0 }}>
                  Admin feedback: {blog.rejectionReason}
                </p>
              ) : null}
              <div className="row">
                {blog.status === 'approved' ? (
                  <Link className="btn secondary tiny" href={`/blogs/${blog.id}`}>
                    View public
                  </Link>
                ) : null}
                <Link
                  className="btn secondary tiny"
                  href={`/dashboard/blogs/${blog.id}/edit`}
                  aria-disabled={blog.status === 'approved'}
                  onClick={(event) => blog.status === 'approved' && event.preventDefault()}
                  style={blog.status === 'approved' ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                >
                  <Edit3 size={14} />
                  Edit
                </Link>
                <button
                  className="btn success tiny"
                  disabled={busy === blog.id || blog.status === 'pending' || blog.status === 'approved'}
                  onClick={() => submit(blog)}
                  title="Submit for admin approval"
                >
                  <Send size={14} />
                  Submit for approval
                </button>
                <button
                  className="btn danger tiny"
                  disabled={busy === blog.id}
                  onClick={() => remove(blog)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
