'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { api, formatRelative } from '@/lib/api';
import type { Comment } from '@/lib/types';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const load = () =>
    api<Comment[]>('/admin/comments')
      .then(setComments)
      .catch(() => setComments([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const remove = async (comment: Comment) => {
    if (!confirm('Soft-delete this comment? The author and replies stay; the body is replaced.')) return;
    setBusy(comment.id);
    try {
      await api(`/admin/comments/${comment.id}/remove`, { method: 'POST' });
      setNotice({ tone: 'success', text: 'Comment removed.' });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err instanceof Error ? err.message : 'Failed to remove comment.' });
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return comments;
    return comments.filter(
      (comment) =>
        comment.content?.toLowerCase().includes(q) ||
        comment.author?.email?.toLowerCase().includes(q) ||
        comment.blog?.title?.toLowerCase().includes(q),
    );
  }, [comments, query]);

  return (
    <>
      <PageHeader
        eyebrow="Moderation"
        title="Comment moderation"
        subtitle="Soft-delete replaces the comment body but keeps thread structure intact."
      />

      <div className="panel" style={{ marginBottom: 16, padding: 14 }}>
        <div className="split">
          <p className="text-strong" style={{ margin: 0 }}>{filtered.length} comments</p>
          <div className="row" style={{ gap: 8, minWidth: 240 }}>
            <Search size={14} color="#64748b" />
            <input
              className="input"
              placeholder="Search by content, author, or blog"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ maxWidth: 280 }}
            />
          </div>
        </div>
      </div>

      {notice ? (
        <p className={`notice ${notice.tone}`} style={{ marginBottom: 14 }}>{notice.text}</p>
      ) : null}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No comments" body="Comments and replies will appear here for moderation." />
      ) : (
        <div className="stack">
          {filtered.map((comment) => {
            const isDeleted = !!comment.deletedAt;
            return (
              <article className="item-card stack-sm" key={comment.id}>
                <div className="split">
                  <div>
                    <p className="text-strong" style={{ margin: 0 }}>
                      {comment.author?.email || 'Unknown author'}
                    </p>
                    <p className="meta" style={{ margin: 0 }}>
                      on{' '}
                      {comment.blog ? (
                        <Link href={`/blogs/${comment.blog.id}`} target="_blank">
                          {comment.blog.title || comment.blog.id}
                        </Link>
                      ) : (
                        'unknown blog'
                      )}{' '}
                      · {formatRelative(comment.createdAt)}
                    </p>
                  </div>
                  {isDeleted ? <span className="badge rejected">Removed</span> : null}
                </div>
                <div className="comment-bubble" style={isDeleted ? { fontStyle: 'italic', color: 'var(--muted)' } : {}}>
                  {comment.content}
                </div>
                <div className="row">
                  {comment.blog ? (
                    <Link href={`/blogs/${comment.blog.id}`} target="_blank" className="btn ghost tiny">
                      <ExternalLink size={14} />
                      Open blog
                    </Link>
                  ) : null}
                  {!isDeleted ? (
                    <button
                      className="btn danger tiny"
                      onClick={() => remove(comment)}
                      disabled={busy === comment.id}
                    >
                      <Trash2 size={14} />
                      Soft-delete
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

