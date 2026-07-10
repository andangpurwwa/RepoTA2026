import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    const saved = sessionStorage.getItem('repota_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    sessionStorage.removeItem('repota_user');
    sessionStorage.removeItem('repota_token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSavedUser());
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem('repota_token')));

  function saveUser(nextUser) {
    setUser(nextUser);
    if (nextUser) sessionStorage.setItem('repota_user', JSON.stringify(nextUser));
    else sessionStorage.removeItem('repota_user');
  }

  async function refreshMe() {
    const res = await api.get('/auth/me');
    saveUser(res.user);
    return res.user;
  }

  useEffect(() => {
    let active = true;
    async function loadMe() {
      const token = sessionStorage.getItem('repota_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (active) saveUser(res.user);
      } catch {
        sessionStorage.removeItem('repota_token');
        sessionStorage.removeItem('repota_user');
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMe();
    return () => { active = false; };
  }, []);

  async function login(identifier, password, expectedRole) {
    const res = await api.post('/auth/login', { identifier, password });

    if (expectedRole && res.user?.role !== expectedRole) {
      const portalLabel = expectedRole === 'admin' ? 'Admin' : 'Mahasiswa';
      throw new Error(`Akun ini tidak memiliki akses ke portal ${portalLabel}.`);
    }

    sessionStorage.setItem('repota_token', res.token);
    saveUser(res.user);
    return res.user;
  }

  function logout() {
    sessionStorage.removeItem('repota_token');
    sessionStorage.removeItem('repota_user');
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshMe, saveUser, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
