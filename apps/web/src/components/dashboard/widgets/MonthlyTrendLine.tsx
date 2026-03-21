import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '../../../hooks/useCurrency';

interface MonthlyTrendLineProps {
  data: { month: string; income: number; expenses: number }[];
}

export default function MonthlyTrendLine({ data }: MonthlyTrendLineProps) {
  const { formatCurrency } = useCurrency();
  const trendData = data.map((d) => ({
    ...d,
    savings: d.income - d.expenses,
  }));

  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="savings" name="Savings" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
