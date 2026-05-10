'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, clearToken, getToken, setToken } from './api';
import type { AuthUser, Role } from './types';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<unknown>;
  login: (token: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return Promise.resolve()
      .then(() => {
        if (!getToken()) {
          throw new Error('no-token');
        }
        return api<AuthUser>('/auth/me');
      })
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback((token: string) => {
    setToken(token);
    return api<AuthUser>('/auth/me').then((me) => {
      setUser(me);
      setLoading(false);
      return me;
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, refresh, login, logout }),
    [user, loading, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function homeFor(role: Role | undefined) {
  return role === 'admin' ? '/admin' : '/dashboard';
}
