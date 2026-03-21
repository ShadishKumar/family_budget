import { useMutation } from '@tanstack/react-query';
import api from '../client';
import { useAuthStore } from '../../store/authStore';
import { LoginInput, RegisterInput } from '@family-budget/shared';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens, data.family);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens, data.family);
    },
  });
}

export function useLogout() {
  const { tokens, logout } = useAuthStore.getState();

  return useMutation({
    mutationFn: async () => {
      if (tokens?.refreshToken) {
        await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
      }
    },
    onSettled: () => {
      logout();
    },
  });
}
