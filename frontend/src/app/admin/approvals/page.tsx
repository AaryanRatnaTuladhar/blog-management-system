'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatRelative } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const load = () =>
    api<Blog[]>('/admin/blogs/pending')
      .then(setPending)
      .catch(() => setPending([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const approve = async (blog: Blog) => {
    setBusy(blog.id);
    try {
      await api(`/admin/blogs/${blog.id}/approve`, { method: 'POST' });
      setNotice({ tone: 'success', text: `Approved "${blog.title}". The author has been notified.` });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Approval failed.' });
    } finally {
      setBusy(null);
    }
  };

  const reject = async (blog: Blog) => {
    const reason = (reasonDraft[blog.id] || '').trim() || 'Needs revisions before publishing.';
    setBusy(blog.id);
    try {
      await api(`/admin/blogs/${blog.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setNotice({ tone: 'success', text: `Rejected "${blog.title}" with feedback.` });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Rejection failed.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Approvals"
        title="Pending blog submissions"
        subtitle="Authors submit drafts for approval. Approved blogs publish to the public site asynchronously."
        action={<span className="badge pending">{pending.length} pending</span>}
      />

      {notice ? (
        <p className={`notice ${notice.tone}`} style={{ marginBottom: 14 }}>{notice.text}</p>
      ) : null}

      {loading ? (
        <p className="muted">Loading pending submissions…</p>
      ) : pending.length === 0 ? (
        <EmptyState
          title="Nothing waiting for review"
          body="When authors submit a draft for approval it will appear here."
        />
      ) : (
        <div className="stack">
          {pending.map((blog) => {
            const isOpen = expanded.has(blog.id);
            return (
              <article className="item-card stack-sm" key={blog.id}>
                <div className="split">
                  <div>
                    <h3 className="text-strong" style={{ margin: 0, fontSize: 16 }}>{blog.title}</h3>
                    <p className="meta" style={{ margin: 0 }}>
                      {blog.author?.email || 'Unknown author'} · submitted {formatRelative(blog.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={blog.status} />
                </div>
                <p className="meta" style={{ margin: 0 }}>
                  {(blog.content || '').slice(0, isOpen ? blog.content?.length : 220)}
                  {(blog.content || '').length > 220 && !isOpen ? '…' : ''}
                </p>
                <div className="row">
                  <button className="btn ghost tiny" onClick={() => toggle(blog.id)}>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isOpen ? 'Show less' : 'Read full submission'}
                  </button>
                </div>
                <div className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 220 }}
                    placeholder="Optional rejection reason (sent to the author)"
                    value={reasonDraft[blog.id] || ''}
                    onChange={(event) =>
                      setReasonDraft((current) => ({ ...current, [blog.id]: event.target.value }))
                    }
                  />
                  <button
                    className="btn success"
                    onClick={() => approve(blog)}
                    disabled={busy === blog.id}
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => reject(blog)}
                    disabled={busy === blog.id}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
