import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@family-budget/shared';

interface CategoryPieChartProps {
  data: { categoryName: string; total: number; color?: string }[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const COLORS = ['#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#795548', '#607D8B'];

  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Expenses by Category</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No expense data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ categoryName, percent }) =>
                `${categoryName} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.categoryName} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
