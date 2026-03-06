'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, businessName?: string) => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthState | null>(null);

// Parse JWT expiry without a library
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('12clicks_auth');
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback((accessToken: string, currentRefreshToken: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expiry = getTokenExpiry(accessToken);
    if (!expiry) return;

    // Refresh 60 seconds before expiry
    const refreshIn = Math.max(expiry - Date.now() - 60_000, 5_000);

    refreshTimerRef.current = setTimeout(async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        if (!res.ok) {
          clearAuth();
          return;
        }

        const data = await res.json();
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        // Persist to localStorage — preserve the user object
        const saved = localStorage.getItem('12clicks_auth');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            localStorage.setItem('12clicks_auth', JSON.stringify({
              user: parsed.user,
              token: data.accessToken,
              refreshToken: data.refreshToken,
            }));
          } catch { /* ignore */ }
        }

        // Schedule next refresh
        scheduleRefresh(data.accessToken, data.refreshToken);
      } catch {
        clearAuth();
      } finally {
        isRefreshingRef.current = false;
      }
    }, refreshIn);
  }, [clearAuth]);

  const saveAuth = useCallback((u: User, accessToken: string, rt: string) => {
    setUser(u);
    setToken(accessToken);
    setRefreshToken(rt);
    localStorage.setItem('12clicks_auth', JSON.stringify({ user: u, token: accessToken, refreshToken: rt }));
    scheduleRefresh(accessToken, rt);
  }, [scheduleRefresh]);

  useEffect(() => {
    const saved = localStorage.getItem('12clicks_auth');
    if (saved) {
      try {
        const { user: u, token: t, refreshToken: rt } = JSON.parse(saved);
        setUser(u);
        setToken(t);
        setRefreshToken(rt);
        if (t && rt) {
          scheduleRefresh(t, rt);
        }
      } catch { /* ignore */ }
    }
    setLoading(false);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleRefresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    saveAuth(data.user, data.accessToken, data.refreshToken);
  };

  const register = async (email: string, password: string, name: string, businessName?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, businessName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    const data = await res.json();
    saveAuth(data.user, data.accessToken, data.refreshToken);
  };

  const logout = () => {
    clearAuth();
  };

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If we get a 401, try refreshing the token once
    if (res.status === 401 && refreshToken && !isRefreshingRef.current) {
      isRefreshingRef.current = true;
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setToken(data.accessToken);
          setRefreshToken(data.refreshToken);

          // Update localStorage
          const saved = localStorage.getItem('12clicks_auth');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              localStorage.setItem('12clicks_auth', JSON.stringify({
                user: parsed.user,
                token: data.accessToken,
                refreshToken: data.refreshToken,
              }));
            } catch { /* ignore */ }
          }

          scheduleRefresh(data.accessToken, data.refreshToken);

          // Retry the original request with the new token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        isRefreshingRef.current = false;
      }
    }

    return res;
  }, [token, refreshToken, clearAuth, scheduleRefresh]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
