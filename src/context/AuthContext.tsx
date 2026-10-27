import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/cinema';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('imovies_token');
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // By default, set demo user so the app is immediately alive and functional
          const res = await api.login('alex@cinephile.com', 'user123');
          localStorage.setItem('imovies_token', res.token);
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
        // Fallback demo user
        try {
          const res = await api.login('alex@cinephile.com', 'user123');
          localStorage.setItem('imovies_token', res.token);
          setUser(res.user);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('imovies_token', res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('imovies_token', res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('imovies_token');
    setUser(null);
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    const res = await api.switchRole(role);
    localStorage.setItem('imovies_token', res.token);
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
