'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Clock, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { api, formatDate } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    api('/public/blogs')
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  const filtered = useMemo(
    () => blogs.filter((blog) => blog.title?.toLowerCase().includes(query.toLowerCase())),
    [blogs, query],
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Public blog pages"
        title="Approved blogs"
        subtitle="This area is publicly available. Only admin-approved posts appear here."
        action={
          <button className="btn secondary" onClick={load} title="Refresh blog list">
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="split">
          <div>
            <h2 className="section-title">Explore articles</h2>
            <p className="meta">Showing {filtered.length} approved blog(s)</p>
          </div>
          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder="Search by title"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading approved blogs...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No approved blogs yet" body="Approved posts will appear here after admin review." />
      ) : (
        <div className="grid three">
          {filtered.map((blog) => (
            <article className="item-card stack" key={blog.id}>
              <div className="split">
                <BookOpen size={22} color="#2563eb" />
                <span className="badge approved">approved</span>
              </div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                {blog.title}
              </h2>
              <p className="meta">{blog.author?.email || 'Unknown author'}</p>
              <p>{String(blog.content || '').slice(0, 150)}...</p>
              <p className="meta">
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                {formatDate(blog.publishedAt || blog.createdAt)}
              </p>
              <Link className="btn primary" href={`/blogs/${blog.id}`}>
                Read article
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
