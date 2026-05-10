'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Reply,
  Send,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PublicHeader } from '@/components/PublicHeader';
import { api, formatDate, formatRelative } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Blog, Comment } from '@/lib/types';

function CommentThread({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  onReply: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}) {
  const isMine = currentUserId && comment.author?.id === currentUserId;
  const isDeleted = !!comment.deletedAt;
  return (
    <div className="comment stack-sm">
      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
        <span className="avatar">
          {(comment.author?.email?.charAt(0) || 'R').toUpperCase()}
        </span>
        <div className="stack-sm" style={{ flex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="text-strong" style={{ fontSize: 14 }}>
              {comment.author?.email?.split('@')[0] || 'Reader'}
            </span>
            <span className="meta">{formatRelative(comment.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="comment-bubble">
        {isDeleted ? <em className="muted">{comment.content}</em> : comment.content}
      </div>
      <div className="row" style={{ gap: 6 }}>
        {!isDeleted && currentUserId && (
          <button
            className="btn ghost tiny"
            onClick={() => onReply(comment.id, comment.author?.email || 'comment')}
          >
            <Reply size={12} />
            Reply
          </button>
        )}
        {!isDeleted && isMine && (
          <button className="btn ghost tiny" onClick={() => onDelete(comment.id)} title="Delete your comment">
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>
      {(comment.replies?.length ?? 0) > 0 && (
        <div className="stack-sm" style={{ marginTop: 8 }}>
          {comment.replies?.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [reply, setReply] = useState<{ id: string; label: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [blogData, commentData] = await Promise.all([
      api<Blog>(`/public/blogs/${params.id}`),
      api<Comment[]>(`/public/blogs/${params.id}/comments`),
    ]);
    setBlog(blogData);
    setComments(commentData);
  }, [params.id]);

  useEffect(() => {
    Promise.resolve()
      .then(() => load())
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [load]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setError('Please log in to comment.');
      return;
    }
    if (content.trim().length === 0) {
      setError('Comment cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api(reply ? `/comments/${reply.id}/replies` : `/blogs/${params.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent('');
      setReply(null);
      await load();
    } catch (err) {
      const base = err instanceof Error ? err.message : 'Could not submit comment.';
      setError(/throttle/i.test(base) ? 'You are commenting too quickly. Please wait a moment.' : base);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/comments/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      /* ignore */
    }
  };

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')),
    [comments],
  );

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p className="muted">Loading article…</p>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <PublicHeader />
        <div className="container" style={{ padding: '40px 24px' }}>
          <EmptyState
            title="Blog not available"
            body="This blog may not have been approved yet, was removed, or the backend is offline."
            action={
              <Link className="btn primary" href="/blogs">
                <ArrowLeft size={16} /> Back to blogs
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <section className="container" style={{ padding: '32px 24px 64px' }}>
        <Link href="/blogs" className="btn ghost tiny" style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> All blogs
        </Link>

        <article className="article">
          <h1>{blog.title}</h1>
          <div className="article-meta">
            <span className="row" style={{ gap: 6 }}>
              <UserIcon size={14} />
              {blog.author?.email || 'Unknown author'}
            </span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span className="row" style={{ gap: 6 }}>
              <Clock size={14} />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
          <div className="article-content">{blog.content}</div>
        </article>

        <section className="panel" style={{ marginTop: 22 }}>
          <h2 className="section-title">
            <span className="row" style={{ gap: 8 }}>
              <MessageSquare size={18} />
              {sortedComments.length} {sortedComments.length === 1 ? 'comment' : 'comments'}
            </span>
          </h2>

          {user ? (
            <form className="form" onSubmit={handleSubmit}>
              {reply ? (
                <div className="notice">
                  Replying to <strong>{reply.label}</strong>.{' '}
                  <button
                    type="button"
                    className="btn ghost tiny"
                    onClick={() => setReply(null)}
                    style={{ padding: '2px 6px' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
              <textarea
                className="textarea"
                placeholder={reply ? 'Write your reply…' : 'Add a comment…'}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              {error ? <p className="notice danger">{error}</p> : null}
              <div className="row">
                <button className="btn primary" type="submit" disabled={submitting}>
                  <Send size={14} />
                  {submitting ? 'Posting…' : reply ? 'Post reply' : 'Post comment'}
                </button>
                <span className="meta">Comments are limited to 5 per minute.</span>
              </div>
            </form>
          ) : (
            <div className="notice">
              <Link href="/login" className="text-strong" style={{ textDecoration: 'underline' }}>
                Log in
              </Link>{' '}
              to leave a comment or reply on this blog.
            </div>
          )}

          <div className="divider" />

          {sortedComments.length === 0 ? (
            <EmptyState
              title="No comments yet"
              body="Be the first to share your thoughts on this article."
            />
          ) : (
            <div className="stack-lg">
              {sortedComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onReply={(id, label) => setReply({ id, label })}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}
