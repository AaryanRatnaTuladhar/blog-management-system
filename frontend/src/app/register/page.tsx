'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  return (
    <main className="auth-wrap">
      <section className="panel auth-card stack">
        <div>
          <div className="eyebrow">Create workspace access</div>
          <h1 className="title">Register</h1>
          <p className="subtitle">Start with drafts, then submit blogs for admin approval.</p>
        </div>
        <form
          className="form"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setSaving(true);
            try {
              const trimmedEmail = email.trim();
              const pwd = password.trim();
              if (pwd.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
              }
              const res = await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email: trimmedEmail, password: pwd }),
              });
              localStorage.setItem('token', res.accessToken);
              router.push('/dashboard');
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Registration failed. Use a unique email and a 6+ character password.',
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="meta" style={{ color: '#b91c1c' }}>{error}</p>}
          <button className="btn primary" type="submit" disabled={saving}>
            <UserPlus size={16} />
            {saving ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="meta">
          Already registered? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
