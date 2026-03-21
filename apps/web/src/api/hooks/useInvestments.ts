import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { InvestmentConfigInput } from '@family-budget/shared';

export function useInvestmentConfig() {
  return useQuery({
    queryKey: ['investment-config'],
    queryFn: async () => {
      const res = await api.get('/investments/config');
      return res.data;
    },
  });
}

export function useInvestmentProjection() {
  return useQuery({
    queryKey: ['investment-projection'],
    queryFn: async () => {
      const res = await api.get('/investments/projection');
      return res.data;
    },
  });
}

export function useUpdateInvestmentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvestmentConfigInput) => {
      const res = await api.put('/investments/config', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-config'] });
      queryClient.invalidateQueries({ queryKey: ['investment-projection'] });
    },
  });
}
