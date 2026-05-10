'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { homeFor, useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(homeFor(user.role));
    }
  }, [loading, user, router]);

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
      const response = await api<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const me = await login(response.accessToken);
      router.replace(homeFor(me.role));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Use a unique email and a password that is 6+ characters.',
      );
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
              Join the workspace
            </span>
          </div>
          <h2>Create your Aaryan CMS account</h2>
          <p>Start drafting blogs and submit them for admin approval to publish.</p>
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            {error ? <p className="notice danger">{error}</p> : null}
            <button className="btn primary" type="submit" disabled={saving}>
              <UserPlus size={16} />
              {saving ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="meta">
            Already registered? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
