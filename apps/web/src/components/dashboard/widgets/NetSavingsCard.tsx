import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

interface NetSavingsCardProps {
  totalIncome: number;
  totalExpenses: number;
}

export default function NetSavingsCard({ totalIncome, totalExpenses }: NetSavingsCardProps) {
  const { formatCurrency } = useCurrency();
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const isPositive = netSavings >= 0;

  return (
    <div className="card h-full flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Net Savings (This Month)</h3>
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="text-green-600" size={24} />
          ) : (
            <TrendingDown className="text-red-600" size={24} />
          )}
        </div>
        <div>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netSavings)}
          </p>
          <p className="text-sm text-gray-500">
            {savingsRate.toFixed(1)}% savings rate
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600">Income</p>
          <p className="font-semibold text-green-700">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600">Expenses</p>
          <p className="font-semibold text-red-700">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>
    </div>
  );
}
