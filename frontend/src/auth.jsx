import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    const saved = localStorage.getItem('repota_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('repota_user');
    localStorage.removeItem('repota_token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSavedUser());
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('repota_token')));

  useEffect(() => {
    let active = true;
    async function loadMe() {
      const token = localStorage.getItem('repota_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (active) {
          setUser(res.user);
          localStorage.setItem('repota_user', JSON.stringify(res.user));
        }
      } catch {
        localStorage.removeItem('repota_token');
        localStorage.removeItem('repota_user');
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMe();
    return () => { active = false; };
  }, []);

  async function login(identifier, password) {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('repota_token', res.token);
    localStorage.setItem('repota_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }

  function logout() {
    localStorage.removeItem('repota_token');
    localStorage.removeItem('repota_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
