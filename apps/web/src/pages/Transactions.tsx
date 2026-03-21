import { useState } from 'react';
import Header from '../components/layout/Header';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import { useTransactions, useTransactionSummary } from '../api/hooks/useTransactions';
import { formatCurrency, getCurrentMonthRange } from '@family-budget/shared';
import { Plus, Filter } from 'lucide-react';

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{ type?: 'INCOME' | 'EXPENSE'; page: number }>({ page: 1 });

  const { start, end } = getCurrentMonthRange();
  const { data } = useTransactions({ ...filters, limit: 20 });
  const { data: summary } = useTransactionSummary(start, end);

  return (
    <div>
      <Header
        title="Transactions"
        subtitle="Manage your income and expenses"
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Transaction
          </button>
        }
      />

      <div className="p-6">
        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Net Savings</p>
              <p
                className={`text-2xl font-bold ${
                  summary.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(summary.netSavings)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-sm">
            <Filter size={16} className="text-gray-400" />
            <span className="text-gray-500">Filter:</span>
          </div>
          {['ALL', 'EXPENSE', 'INCOME'].map((type) => (
            <button
              key={type}
              onClick={() =>
                setFilters({
                  ...filters,
                  type: type === 'ALL' ? undefined : (type as 'INCOME' | 'EXPENSE'),
                  page: 1,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                (type === 'ALL' && !filters.type) || filters.type === type
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'ALL' ? 'All' : type === 'INCOME' ? 'Income' : 'Expenses'}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <TransactionList transactions={data?.transactions ?? []} />

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setFilters({ ...filters, page: i + 1 })}
                className={`px-3 py-1 rounded ${
                  filters.page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
