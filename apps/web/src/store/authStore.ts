import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Family, AuthTokens } from '@family-budget/shared';

interface AuthState {
  user: User | null;
  family: Family | null;
  tokens: AuthTokens | null;
  currency: string;
  setAuth: (user: User, tokens: AuthTokens, family?: Family | null) => void;
  setFamily: (family: Family) => void;
  updateTokens: (tokens: AuthTokens) => void;
  setCurrency: (currency: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      family: null,
      tokens: null,
      currency: 'INR',
      setAuth: (user, tokens, family = null) => set({ user, tokens, family }),
      setFamily: (family) => set({ family }),
      updateTokens: (tokens) => set({ tokens }),
      setCurrency: (currency) => set({ currency }),
      logout: () => set({ user: null, family: null, tokens: null, currency: 'INR' }),
      isAuthenticated: () => !!get().tokens?.accessToken,
    }),
    { name: 'family-budget-auth' }
  )
);
