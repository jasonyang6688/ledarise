'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError } from './api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        const result = await api.auth.login(email, password);
        // Store token in both the store and localStorage (for api.ts request helper)
        if (typeof window !== 'undefined') {
          localStorage.setItem('ledarise.token', result.token);
        }
        set({ user: result.user, token: result.token });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ledarise.token');
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: 'ledarise.auth',
      // Only persist user + token, not the functions
      partialize: (state) => ({ user: state.user, token: state.token }),
      // When hydrating from storage, also seed localStorage so api.ts can read it
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== 'undefined') {
          localStorage.setItem('ledarise.token', state.token);
        }
      },
    },
  ),
);

/**
 * Server-safe helper that reads the token from localStorage (client only).
 * Returns null during SSR.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ledarise.token');
}

export function hasAdminSession(): boolean {
  if (typeof window === 'undefined') return false;

  if (localStorage.getItem('ledarise.token')) {
    return true;
  }

  const persistedAuth = localStorage.getItem('ledarise.auth');
  if (!persistedAuth) {
    return false;
  }

  try {
    const parsed = JSON.parse(persistedAuth) as { state?: { token?: unknown } };
    return typeof parsed.state?.token === 'string' && parsed.state.token.length > 0;
  } catch {
    return false;
  }
}

export { ApiError };
