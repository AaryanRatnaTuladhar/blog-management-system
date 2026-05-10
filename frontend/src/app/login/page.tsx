'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { homeFor, useAuth } from '@/lib/auth';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const next = params?.get('next') || '';

  useEffect(() => {
    if (!loading && user) {
      router.replace(next || homeFor(user.role));
    }
  }, [loading, user, router, next]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const response = await api<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const me = await login(response.accessToken);
      router.replace(next || homeFor(me.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your email and password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-banner">
          <div className="row" style={{ gap: 8 }}>
            <Sparkles size={16} />
            <span style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 12 }}>
              Welcome back
            </span>
          </div>
          <h2>Sign in to Aaryan CMS</h2>
          <p>Pick up where you left off — drafts, approvals, comments, and notifications.</p>
        </div>
        <div className="panel stack">
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="notice danger">{error}</p> : null}
            <button className="btn primary" type="submit" disabled={saving}>
              <LogIn size={16} />
              {saving ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="meta">
            New here? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>.
          </p>
        </div>
        <p className="meta" style={{ marginTop: 16, textAlign: 'center' }}>
          Demo accounts after seeding: <code>admin@example.com</code> / <code>password123</code>,{' '}
          <code>maya@example.com</code> / <code>password123</code>.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
