'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { BlogCard } from '@/components/BlogCard';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { PublicHeader } from '@/components/PublicHeader';
import { api } from '@/lib/api';
import type { Blog } from '@/lib/types';

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api<Blog[]>('/public/blogs')
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(q) ||
        blog.content?.toLowerCase().includes(q) ||
        blog.author?.email?.toLowerCase().includes(q),
    );
  }, [blogs, query]);

  return (
    <>
      <PublicHeader />
      <section className="container" style={{ padding: '36px 24px 24px' }}>
        <PageHeader
          eyebrow="Public blog feed"
          title="Stories from the team"
          subtitle="Only admin-approved posts appear here. Comments and replies are open to signed-in readers."
        />
        <div className="panel" style={{ padding: 14, marginBottom: 18 }}>
          <div className="split">
            <div>
              <p className="text-strong" style={{ margin: 0 }}>
                {filtered.length} {filtered.length === 1 ? 'blog' : 'blogs'} available
              </p>
              <p className="meta" style={{ margin: 0 }}>
                Search by title, content, or author email.
              </p>
            </div>
            <div className="row" style={{ gap: 8, minWidth: 260 }}>
              <Search size={16} color="#64748b" />
              <input
                className="input"
                placeholder="Search published blogs"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ maxWidth: 320 }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading approved blogs…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={blogs.length === 0 ? 'No published blogs yet' : 'No blogs match that search'}
            body={
              blogs.length === 0
                ? 'Approved posts will appear here after an admin reviews them.'
                : 'Try a different keyword or clear the search.'
            }
          />
        ) : (
          <div className="grid cards">
            {filtered.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
