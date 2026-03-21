import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { CreateTransactionInput } from '@family-budget/shared';

export function useTransactions(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const res = await api.get('/transactions', { params: filters });
      return res.data;
    },
  });
}

export function useTransactionSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['transaction-summary', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/transactions/summary', { params: { startDate, endDate } });
      return res.data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const res = await api.post('/transactions', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
    },
  });
}
