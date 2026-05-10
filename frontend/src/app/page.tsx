import Link from 'next/link';
import { ArrowRight, BookOpen, Gauge, ShieldCheck, UserPlus } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <BookOpen size={18} />
          </span>
          Aaryan CMS
        </Link>
        <div className="button-row">
          <Link className="btn secondary" href="/blogs">
            Public Blogs
          </Link>
          <Link className="btn primary" href="/login">
            Login
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="eyebrow">Blog management system</div>
        <h1 className="landing-title">Aaryan CMS</h1>
        <p className="landing-copy">
          A fullstack editorial workflow for writing drafts, approving submissions, publishing public
          blogs, managing comments, and receiving in-app notifications.
        </p>
        <div className="button-row">
          <Link className="btn primary" href="/register">
            <UserPlus size={16} />
            Create Account
          </Link>
          <Link className="btn secondary" href="/blogs">
            Browse Blogs
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid three landing-grid">
        <Link className="item-card stack" href="/blogs">
          <BookOpen size={24} color="#2563eb" />
          <h2 className="section-title">Public blog pages</h2>
          <p className="meta">Approved content listing and detail pages with comments and replies.</p>
        </Link>
        <Link className="item-card stack" href="/dashboard">
          <Gauge size={24} color="#15803d" />
          <h2 className="section-title">User dashboard</h2>
          <p className="meta">Create, edit, delete, and submit your own blog drafts.</p>
        </Link>
        <Link className="item-card stack" href="/admin/dashboard">
          <ShieldCheck size={24} color="#b45309" />
          <h2 className="section-title">Admin dashboard</h2>
          <p className="meta">Approve posts, manage users, and moderate comments.</p>
        </Link>
      </section>
    </main>
  );
}
