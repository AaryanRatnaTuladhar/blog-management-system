'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Reply, Send, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { api, formatDate } from '@/lib/api';
import type { Blog, Comment } from '@/lib/types';

function CommentThread({
  comment,
  onReply,
  onDelete,
}: {
  comment: Comment;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="comment stack">
      <div className="split">
        <div>
          <strong>{comment.author?.email || 'Reader'}</strong>
          <p className="meta">{formatDate(comment.createdAt)}</p>
        </div>
        <div className="button-row">
          <button className="btn secondary" onClick={() => onReply(comment.id)} title="Reply to comment">
            <Reply size={14} />
          </button>
          <button className="btn danger" onClick={() => onDelete(comment.id)} title="Delete your comment">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p>{comment.content}</p>
      {(comment.replies?.length ?? 0) > 0 && (
        <div className="stack reply">
          {comment.replies?.map((reply) => (
            <CommentThread key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [blogData, commentData] = await Promise.all([
      api(`/public/blogs/${params.id}`),
      api(`/public/blogs/${params.id}/comments`),
    ]);
    setBlog(blogData);
    setComments(commentData);
  }, [params.id]);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch {
        setBlog(null);
      }
    })();
  }, [load]);

  if (!blog) {
    return (
      <AppShell>
        <EmptyState title="Blog not available" body="This blog may not be approved yet or the backend is offline." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Public blog detail"
        title={blog.title}
        subtitle={`By ${blog.author?.email || 'Unknown'} · ${formatDate(blog.publishedAt || blog.createdAt)}`}
      />
      <div className="grid two">
        <article className="panel stack">
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{blog.content}</p>
        </article>
        <aside className="panel stack">
          <h2 className="section-title">
            <MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Comments
          </h2>
          <form
            className="form"
            onSubmit={async (event) => {
              event.preventDefault();
              setMessage('');
              try {
                await api(replyTo ? `/comments/${replyTo}/replies` : `/blogs/${params.id}/comments`, {
                  method: 'POST',
                  body: JSON.stringify({ content: comment }),
                });
                setComment('');
                setReplyTo(null);
                await load();
              } catch {
                setMessage('Could not add comment. Login first or slow down if rate limited.');
              }
            }}
          >
            <textarea
              className="textarea"
              placeholder={replyTo ? 'Write a reply' : 'Add a comment'}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {replyTo && <p className="meta">Replying to selected comment</p>}
            {message && <p className="meta">{message}</p>}
            <button className="btn primary" type="submit">
              <Send size={16} />
              {replyTo ? 'Post Reply' : 'Post Comment'}
            </button>
          </form>

          <div className="stack">
            {comments.length === 0 ? (
              <EmptyState title="No comments yet" body="Approved blogs can receive comments and nested replies." />
            ) : (
              comments.map((item) => (
                <CommentThread
                  key={item.id}
                  comment={item}
                  onReply={setReplyTo}
                  onDelete={(id) => api(`/comments/${id}`, { method: 'DELETE' }).then(load)}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
