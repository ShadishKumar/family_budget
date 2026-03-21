import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { formatCurrency as _formatCurrency } from '@family-budget/shared';

export function useCurrency() {
  const currency = useAuthStore((s) => s.currency);

  const format = useCallback(
    (amount: number) => _formatCurrency(amount, currency),
    [currency]
  );

  return { currency, formatCurrency: format };
}
