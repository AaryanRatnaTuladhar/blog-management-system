'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BlogCard } from '@/components/BlogCard';
import { PublicHeader } from '@/components/PublicHeader';
import { api } from '@/lib/api';
import { homeFor, useAuth } from '@/lib/auth';
import type { Blog } from '@/lib/types';

const features = [
  {
    icon: BookOpen,
    title: 'Approval based publishing',
    body: 'Authors create drafts and submit them for review. Admins approve or reject before content reaches readers.',
    color: '#4f46e5',
  },
  {
    icon: MessageSquare,
    title: 'Threaded comments',
    body: 'Readers comment and reply on approved blogs. Soft deletion keeps the conversation readable.',
    color: '#0ea5e9',
  },
  {
    icon: Layers,
    title: 'Async + cached',
    body: 'RabbitMQ handles approval and notification side effects. Redis caches the public blog list.',
    color: '#f59e0b',
  },
  {
    icon: ShieldCheck,
    title: 'Role based dashboards',
    body: 'Authors and admins have separate dashboards built for the work each one is responsible for.',
    color: '#dc2626',
  },
];

export default function LandingPage() {
  const [featured, setFeatured] = useState<Blog[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    api<Blog[]>('/public/blogs')
      .then((blogs) => setFeatured(blogs.slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <PublicHeader />
      <section className="landing-hero">
        <div className="container stack-lg">
          <span className="landing-pill">
            <Sparkles size={12} />
            Blog management system
          </span>
          <h1 className="title-xl">A clean editorial workflow for writers and admins.</h1>
          <p className="landing-copy">
            Aaryan CMS lets authors draft, edit, and submit posts while admins keep the public site curated.
            Built with Next.js, NestJS, PostgreSQL, Redis and RabbitMQ.
          </p>
          <div className="row">
            <Link className="btn primary" href={user ? homeFor(user.role) : '/register'}>
              {user ? 'Go to Dashboard' : 'Start writing'}
              <ArrowRight size={16} />
            </Link>
            <Link className="btn secondary" href="/blogs">
              <BookOpen size={16} />
              Browse public blogs
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 64 }}>
        <div className="topbar">
          <div>
            <p className="eyebrow">What you get</p>
            <h2 className="title">Designed for editorial teams</h2>
          </div>
        </div>
        <div className="grid four">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card stack-sm" key={feature.title}>
                <span
                  className="feature-icon"
                  style={{ background: `${feature.color}1A`, color: feature.color }}
                >
                  <Icon size={20} />
                </span>
                <h3 className="section-title" style={{ margin: 0 }}>{feature.title}</h3>
                <p className="meta" style={{ margin: 0 }}>{feature.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 88 }}>
        <div className="topbar">
          <div>
            <p className="eyebrow">Recent</p>
            <h2 className="title">Latest published blogs</h2>
            <p className="subtitle">Live from your backend. Only admin-approved posts appear here.</p>
          </div>
          <Link className="btn secondary" href="/blogs">
            See all
            <ArrowRight size={16} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="empty">
            <strong>No published blogs yet</strong>
            <p style={{ margin: 0 }}>Run the seeder or create one and have an admin approve it.</p>
          </div>
        ) : (
          <div className="grid cards">
            {featured.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      <footer className="container" style={{ borderTop: '1px solid var(--line)', padding: '24px 24px 48px' }}>
        <div className="split">
          <p className="meta" style={{ margin: 0 }}>
            Aaryan CMS — Next.js, NestJS, PostgreSQL, Redis, RabbitMQ.
          </p>
          <div className="row" style={{ gap: 18 }}>
            <Link className="meta" href="/blogs">Blogs</Link>
            <Link className="meta" href="/login">Login</Link>
            <Link className="meta" href="/register">Sign up</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
