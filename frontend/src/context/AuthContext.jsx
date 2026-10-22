import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { HQ } from '../data/hireData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => HQ.s?.user || null);
  const [loading, setLoading] = useState(() => Boolean(api.token.get() && !HQ.s?.user));

  const setUser = useCallback((u) => {
    setUserState(u);
    HQ.set((z) => {
      z.user = u;
      if (u) {
        z.module = z.module || 'hire';
      }
    });
  }, []);

  useEffect(() => {
    const token = api.token.get();
    if (!token) {
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
        } else {
          api.token.set(null);
          setUser(null);
        }
      })
      .catch(() => {
        api.token.set(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, setUser]);

  useEffect(() => {
    const handleLogout = () => {
      setUserState(null);
      HQ.set((z) => {
        z.user = null;
      });
    };
    window.addEventListener('hireiq:logout', handleLogout);
    return () => window.removeEventListener('hireiq:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.token) {
      api.token.set(res.token);
    }
    const u = res?.user || { email, name: email.split('@')[0] };
    setUser(u);
    return u;
  }, [setUser]);

  const logout = useCallback(() => {
    api.token.set(null);
    setUser(null);
    try {
      window.dispatchEvent(new CustomEvent('hireiq:logout'));
    } catch {
      // ignore in environments without CustomEvent
    }
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
