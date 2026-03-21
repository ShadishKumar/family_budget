import { formatDate } from '@family-budget/shared';
import { useCurrency } from '../../../hooks/useCurrency';

interface RecentTransactionsProps {
  transactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    category: { name: string; icon?: string; color?: string };
  }[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center gap-3">
              <span className="text-lg">{tx.category?.icon ?? '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
