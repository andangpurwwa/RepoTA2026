import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from './api';

const TOKEN_KEY = 'repota_token';
const USER_KEY = 'repota_user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

function storeUser(user) {
  if (!user) {
    sessionStorage.removeItem(USER_KEY);
    return;
  }

  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function storeToken(token) {
  if (!token) {
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [authReady, setAuthReady] = useState(false);

  const clearSession = useCallback(() => {
    storeToken(null);
    storeUser(null);
    setUser(null);
  }, []);

  const saveUser = useCallback((nextUser) => {
    setUser((currentUser) => {
      const mergedUser = currentUser
        ? { ...currentUser, ...nextUser }
        : nextUser;

      storeUser(mergedUser);
      return mergedUser;
    });
  }, []);

  const saveSession = useCallback((session) => {
    if (!session?.token || !session?.user) {
      throw new Error('Data sesi login dari server tidak lengkap.');
    }

    storeToken(session.token);
    storeUser(session.user);
    setUser(session.user);

    return session.user;
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const response = await api.post(
        '/auth/login',
        {
          identifier,
          password,
        },
        {
          skipAuth: true,
        }
      );

      return saveSession(response);
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload) => {
      const response = await api.post(
        '/auth/register',
        payload,
        {
          skipAuth: true,
        }
      );

      return saveSession(response);
    },
    [saveSession]
  );

  const refreshUser = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      clearSession();
      return null;
    }

    const response = await api.get('/auth/me');
    saveUser(response.user);

    return response.user;
  }, [clearSession, saveUser]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) setAuthReady(true);
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearSession();
      } finally {
        if (active) setAuthReady(true);
      }
    }

    initializeAuth();

    return () => {
      active = false;
    };
  }, [clearSession, refreshUser]);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
    }

    window.addEventListener(
      'repota:unauthorized',
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        'repota:unauthorized',
        handleUnauthorized
      );
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      saveUser,
      saveSession,
      refreshUser,
    }),
    [
      user,
      authReady,
      login,
      register,
      logout,
      saveUser,
      saveSession,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam komponen AuthProvider.'
    );
  }

  return context;
}
