export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** NestJS often returns `{ message: string | string[] }` for 4xx errors. */
export function formatApiErrorBody(text: string): string {
  if (!text?.trim()) return 'Request failed';
  try {
    const data = JSON.parse(text) as { message?: string | string[] };
    const m = data.message;
    if (Array.isArray(m)) return m.join(' ');
    if (typeof m === 'string') return m;
  } catch {
    /* plain text body */
  }
  return text;
}

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function api(path: string, init?: RequestInit) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(formatApiErrorBody(text));
  }
  return response.json();
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function formatDate(value?: string) {
  if (!value) return 'Not published';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
