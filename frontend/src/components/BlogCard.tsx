import Link from 'next/link';
import { Clock, User } from 'lucide-react';
import type { Blog } from '@/lib/types';
import { formatRelative } from '@/lib/api';

const palettes = [
  ['#6366f1', '#8b5cf6'],
  ['#0ea5e9', '#22d3ee'],
  ['#f97316', '#ef4444'],
  ['#10b981', '#0d9488'],
  ['#ec4899', '#8b5cf6'],
  ['#3b82f6', '#06b6d4'],
  ['#14b8a6', '#84cc16'],
];

function pickPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

function excerpt(text: string, length = 160) {
  const trimmed = (text || '').replace(/\s+/g, ' ').trim();
  if (trimmed.length <= length) return trimmed;
  return `${trimmed.slice(0, length).trimEnd()}…`;
}

export function BlogCard({ blog }: { blog: Blog }) {
  const [from, to] = pickPalette(blog.id || blog.title || 'aaryan');
  const initials = (blog.title || '?').slice(0, 1).toUpperCase();
  return (
    <Link href={`/blogs/${blog.id}`} className="blog-card">
      <div
        className="blog-cover"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        aria-hidden
      >
        {initials}
      </div>
      <div className="blog-card-body">
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-excerpt">{excerpt(blog.content || '')}</p>
        <div className="blog-card-foot">
          <span className="row" style={{ gap: 6 }}>
            <User size={12} />
            {blog.author?.email?.split('@')[0] || 'Anonymous'}
          </span>
          <span className="row" style={{ gap: 6 }}>
            <Clock size={12} />
            {formatRelative(blog.publishedAt || blog.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
