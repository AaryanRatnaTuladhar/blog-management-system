'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Trash2, UserCheck, XCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatDate } from '@/lib/api';
import type { Blog, Comment, User } from '@/lib/types';

export default function AdminDashboardPage() {
  const [pending, setPending] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [pendingBlogs, allUsers, allComments] = await Promise.all([
      api('/admin/blogs/pending'),
      api('/admin/users'),
      api('/admin/comments'),
    ]);
    setPending(pendingBlogs as Blog[]);
    setUsers(allUsers as User[]);
    setComments(allComments as Comment[]);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (err) {
        const base = err instanceof Error ? err.message : 'Request failed';
        const isForbidden = /forbidden|403/i.test(base);
        setMessage(
          isForbidden
            ? `${base} Use an account with role admin (e.g. ADMIN_EMAIL in backend/.env, or after \`npm run seed\`: admin@example.com / password123).`
            : `${base} Make sure you are logged in on the main site first.`,
        );
      }
    })();
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Approvals and moderation"
        subtitle="A separate dashboard for admins to approve or reject blogs, manage users, and moderate comments."
        action={
          <div className="badge approved">
            <ShieldCheck size={14} />
            Admin
          </div>
        }
      />
      {message && <div className="empty" style={{ marginBottom: 16 }}>{message}</div>}

      <div className="grid two">
        <section className="panel">
          <h2 className="section-title">Blog approvals</h2>
          <div className="stack">
            {pending.length === 0 ? (
              <EmptyState title="No pending blogs" body="Submitted drafts will wait here until reviewed." />
            ) : (
              pending.map((blog) => (
                <article className="item-card stack" key={blog.id}>
                  <div className="split">
                    <div>
                      <h3 style={{ fontWeight: 800 }}>{blog.title}</h3>
                      <p className="meta">
                        {blog.author?.email || 'Unknown author'} · {formatDate(blog.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={blog.status} />
                  </div>
                  <p>{String(blog.content || '').slice(0, 220)}...</p>
                  <div className="button-row">
                    <button
                      className="btn success"
                      onClick={() => api(`/admin/blogs/${blog.id}/approve`, { method: 'POST' }).then(load)}
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                    <button
                      className="btn danger"
                      onClick={() =>
                        api(`/admin/blogs/${blog.id}/reject`, {
                          method: 'POST',
                          body: JSON.stringify({ reason: 'Needs revision before publishing.' }),
                        }).then(load)
                      }
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">Users</h2>
          <div className="stack">
            {users.length === 0 ? (
              <EmptyState title="No users loaded" body="Users appear here for activation and deactivation." />
            ) : (
              users.map((user) => (
                <article className="item-card split" key={user.id}>
                  <div>
                    <h3 style={{ fontWeight: 800 }}>{user.email}</h3>
                    <p className="meta">
                      {user.role} · active: {String(user.isActive)}
                    </p>
                  </div>
                  <button
                    className="btn secondary"
                    onClick={() =>
                      api(`/admin/users/${user.id}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ isActive: !user.isActive }),
                      }).then(load)
                    }
                    title="Toggle user active status"
                  >
                    <UserCheck size={16} />
                    Toggle
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2 className="section-title">Comment moderation</h2>
        <div className="stack">
          {comments.length === 0 ? (
            <EmptyState title="No comments yet" body="All comments and replies will appear here for moderation." />
          ) : (
            comments.map((comment) => (
              <article className="item-card split" key={comment.id}>
                <div>
                  <h3 style={{ fontWeight: 800 }}>{comment.author?.email || 'Unknown user'}</h3>
                  <p>{comment.content}</p>
                  <p className="meta">
                    Blog: {comment.blog?.title || comment.blog?.id} · {formatDate(comment.createdAt)}
                  </p>
                </div>
                <button
                  className="btn danger"
                  onClick={() => api(`/admin/comments/${comment.id}/remove`, { method: 'POST' }).then(load)}
                  title="Remove comment"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
