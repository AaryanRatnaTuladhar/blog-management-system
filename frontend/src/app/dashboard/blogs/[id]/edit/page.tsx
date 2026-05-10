'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Blog[]>('/blogs/mine')
      .then((blogs) => {
        const found = blogs.find((b) => b.id === params.id);
        if (found) {
          setBlog(found);
          setTitle(found.title);
          setContent(found.content);
        } else {
          setBlog(null);
        }
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const save = async (afterSubmit: boolean) => {
    const t = title.trim();
    const c = content.trim();
    if (t.length < 3 || c.length < 10) {
      setError('Title needs ≥3 characters and content needs ≥10 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api(`/blogs/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: t, content: c }),
      });
      if (afterSubmit) {
        await api(`/blogs/${params.id}/submit`, { method: 'POST' });
      }
      router.replace('/dashboard/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p className="muted">Loading blog…</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <>
        <PageHeader eyebrow="Edit blog" title="Blog not found" />
        <EmptyState
          title="This blog isn’t in your library"
          body="It may have been deleted or it belongs to another author."
          action={
            <Link className="btn primary" href="/dashboard/blogs">
              <ArrowLeft size={14} /> Back to my blogs
            </Link>
          }
        />
      </>
    );
  }

  if (blog.status === 'approved') {
    return (
      <>
        <PageHeader
          eyebrow="Edit blog"
          title={blog.title}
          subtitle="Approved blogs are locked. Delete and recreate if you need a major rewrite."
        />
        <EmptyState
          title="This blog is published"
          body="Once admins approve a blog it becomes locked. You can still delete it from the list."
          action={
            <Link className="btn primary" href="/dashboard/blogs">
              <ArrowLeft size={14} /> Back to my blogs
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Edit blog"
        title={blog.title}
        subtitle="Make changes, save as draft, or save and submit for review in one click."
        action={
          <>
            <StatusBadge status={blog.status} />
            <Link href="/dashboard/blogs" className="btn ghost tiny">
              <ArrowLeft size={14} /> Back to my blogs
            </Link>
          </>
        }
      />

      <section className="panel">
        {blog.rejectionReason ? (
          <p className="notice danger" style={{ marginBottom: 14 }}>
            Admin feedback: {blog.rejectionReason}
          </p>
        ) : null}
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void save(false);
          }}
        >
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
            />
          </div>
          <div className="field">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={14}
            />
          </div>
          {error ? <p className="notice danger">{error}</p> : null}
          <div className="row">
            <button className="btn primary" type="submit" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn success"
              onClick={() => void save(true)}
              disabled={saving}
            >
              <Send size={16} />
              {saving ? 'Saving…' : 'Save and submit for approval'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
