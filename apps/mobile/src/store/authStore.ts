import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Family, AuthTokens } from '@family-budget/shared';

interface AuthState {
  user: User | null;
  family: Family | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens, family?: Family | null) => void;
  updateTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  family: null,
  tokens: null,
  isLoading: true,

  setAuth: async (user, tokens, family = null) => {
    set({ user, tokens, family });
    await AsyncStorage.setItem('auth', JSON.stringify({ user, tokens, family }));
  },

  updateTokens: async (tokens) => {
    const { user, family } = get();
    set({ tokens });
    await AsyncStorage.setItem('auth', JSON.stringify({ user, tokens, family }));
  },

  logout: async () => {
    set({ user: null, tokens: null, family: null });
    await AsyncStorage.removeItem('auth');
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('auth');
      if (data) {
        const parsed = JSON.parse(data);
        set({ user: parsed.user, tokens: parsed.tokens, family: parsed.family, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
