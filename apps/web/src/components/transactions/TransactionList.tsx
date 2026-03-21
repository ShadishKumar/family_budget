import { Transaction, formatDate } from '@family-budget/shared';
import { useCurrency } from '../../hooks/useCurrency';
import { Trash2, Edit, Mic, Camera, Keyboard } from 'lucide-react';
import { useDeleteTransaction } from '../../api/hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
}

const inputMethodIcon = {
  MANUAL: Keyboard,
  VOICE: Mic,
  OCR: Camera,
};

export default function TransactionList({ transactions }: TransactionListProps) {
  const { formatCurrency } = useCurrency();
  const deleteTransaction = useDeleteTransaction();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const InputIcon = inputMethodIcon[tx.inputMethod];
        return (
          <div
            key={tx.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: (tx.category?.color ?? '#9E9E9E') + '20' }}
            >
              {tx.category?.icon ?? '📦'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{tx.description}</p>
                <InputIcon size={14} className="text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-500">
                {tx.category?.name} &middot; {formatDate(tx.date)}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`font-semibold ${
                  tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                <Edit size={16} />
              </button>
              <button
                onClick={() => deleteTransaction.mutate(tx.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
