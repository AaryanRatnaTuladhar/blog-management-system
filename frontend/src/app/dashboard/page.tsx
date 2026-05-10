'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, FilePlus, Send, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatDate } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api('/blogs/mine').then(setBlogs);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch {
        setBlogs([]);
      }
    })();
  }, []);

  const counts = useMemo(
    () => ({
      draft: blogs.filter((blog) => blog.status === 'draft').length,
      pending: blogs.filter((blog) => blog.status === 'pending').length,
      approved: blogs.filter((blog) => blog.status === 'approved').length,
    }),
    [blogs],
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="User dashboard"
        title="My writing workspace"
        subtitle="A separate dashboard for normal users to create drafts, edit their own posts, submit for approval, and track publishing state."
      />

      <div className="grid three" style={{ marginBottom: 16 }}>
        <div className="panel">
          <p className="meta">Drafts</p>
          <h2 className="title">{counts.draft}</h2>
        </div>
        <div className="panel">
          <p className="meta">Pending review</p>
          <h2 className="title">{counts.pending}</h2>
        </div>
        <div className="panel">
          <p className="meta">Published</p>
          <h2 className="title">{counts.approved}</h2>
        </div>
      </div>

      <div className="grid two">
        <section className="panel">
          <div className="split">
            <h2 className="section-title">{editingId ? 'Edit blog' : 'Create draft'}</h2>
            {editingId && (
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                  setMessage('');
                }}
                title="Cancel editing"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
          <form
            className="form"
            onSubmit={async (event) => {
              event.preventDefault();
              setSaving(true);
              setMessage('');
              const t = title.trim();
              const c = content.trim();
              if (t.length < 3 || c.length < 10) {
                setMessage(
                  'Title needs at least 3 characters and body at least 10 characters (spaces around text are ignored).',
                );
                setSaving(false);
                return;
              }
              try {
                if (editingId) {
                  await api(`/blogs/${editingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ title: t, content: c }),
                  });
                } else {
                  await api('/blogs', {
                    method: 'POST',
                    body: JSON.stringify({ title: t, content: c }),
                  });
                }
                const wasEditing = !!editingId;
                setEditingId(null);
                setTitle('');
                setContent('');
                setMessage(wasEditing ? 'Blog updated.' : 'Draft created.');
                await load();
              } catch (err) {
                setMessage(
                  err instanceof Error ? err.message : 'Could not save (check you are logged in; approved blogs cannot be edited).',
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="field">
              <label>Title (min. 3 characters)</label>
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="field">
              <label>Content (min. 10 characters)</label>
              <textarea className="textarea" value={content} onChange={(event) => setContent(event.target.value)} />
            </div>
            {message && <p className="meta">{message}</p>}
            <button className="btn primary" disabled={saving} type="submit">
              <FilePlus size={16} />
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Draft'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2 className="section-title">My blogs</h2>
          <div className="stack">
            {blogs.length === 0 ? (
              <EmptyState title="No blogs yet" body="Create your first draft to begin the approval workflow." />
            ) : (
              blogs.map((blog) => (
                <article className="item-card stack" key={blog.id}>
                  <div className="split">
                    <div>
                      <h3 style={{ fontWeight: 800 }}>{blog.title}</h3>
                      <p className="meta">Updated {formatDate(blog.updatedAt)}</p>
                    </div>
                    <StatusBadge status={blog.status} />
                  </div>
                  {blog.rejectionReason && <p className="meta">Reason: {blog.rejectionReason}</p>}
                  <div className="button-row">
                    <button
                      className="btn secondary"
                      disabled={blog.status === 'approved'}
                      onClick={() => {
                        setEditingId(blog.id);
                        setTitle(blog.title);
                        setContent(blog.content);
                        setMessage('');
                      }}
                      title="Edit draft or rejected blog"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      className="btn success"
                      disabled={blog.status === 'pending' || blog.status === 'approved'}
                      onClick={() => api(`/blogs/${blog.id}/submit`, { method: 'POST' }).then(load)}
                      title="Submit draft for admin approval"
                    >
                      <Send size={16} />
                      Submit
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => api(`/blogs/${blog.id}`, { method: 'DELETE' }).then(load)}
                      title="Delete blog"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
