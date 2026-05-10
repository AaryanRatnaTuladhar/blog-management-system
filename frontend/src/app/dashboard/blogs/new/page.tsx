'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, FilePlus, Send } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const t = title.trim();
    const c = content.trim();
    if (t.length < 3) return 'Title needs at least 3 characters.';
    if (c.length < 10) return 'Content needs at least 10 characters.';
    return null;
  };

  const create = async (autoSubmit: boolean) => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const blog = await api<Blog>('/blogs', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (autoSubmit) {
        await api(`/blogs/${blog.id}/submit`, { method: 'POST' });
      }
      router.replace('/dashboard/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the blog.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Compose"
        title="Write a new blog"
        subtitle="Save it as a draft to keep editing, or submit it directly to admin review."
        action={
          <Link href="/dashboard/blogs" className="btn ghost tiny">
            <ArrowLeft size={14} /> Back to my blogs
          </Link>
        }
      />

      <section className="panel">
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void create(false);
          }}
        >
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A clear, descriptive title"
              maxLength={140}
            />
            <p className="meta">{title.trim().length} characters · minimum 3</p>
          </div>
          <div className="field">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your post here. Markdown isn't required — line breaks are preserved."
              rows={14}
            />
            <p className="meta">{content.trim().length} characters · minimum 10</p>
          </div>
          {error ? <p className="notice danger">{error}</p> : null}
          <div className="row">
            <button className="btn primary" type="submit" disabled={saving}>
              <FilePlus size={16} />
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              className="btn success"
              onClick={() => void create(true)}
              disabled={saving}
            >
              <Send size={16} />
              {saving ? 'Saving…' : 'Save and submit for approval'}
            </button>
          </div>
          <p className="meta">
            Approved blogs become publicly visible. You can edit drafts and rejected blogs, but not approved ones.
          </p>
        </form>
      </section>
    </>
  );
}
