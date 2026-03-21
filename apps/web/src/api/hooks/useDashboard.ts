import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';

export function useDashboardLayout() {
  return useQuery({
    queryKey: ['dashboard-layout'],
    queryFn: async () => {
      const res = await api.get('/dashboard/layout');
      return res.data;
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    },
  });
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgets: unknown[]) => {
      const res = await api.put('/dashboard/layout', { widgets });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout'] });
    },
  });
}
