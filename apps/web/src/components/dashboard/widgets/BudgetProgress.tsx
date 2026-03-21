import { formatCurrency } from '@family-budget/shared';

interface BudgetItem {
  categoryName: string;
  spent: number;
  budgeted: number;
  color?: string;
}

interface BudgetProgressProps {
  data: BudgetItem[];
}

export default function BudgetProgress({ data }: BudgetProgressProps) {
  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No spending data</p>
        ) : (
          data.slice(0, 6).map((item) => {
            const percentage = item.budgeted > 0
              ? Math.min((item.spent / item.budgeted) * 100, 100)
              : 0;
            const isOver = item.budgeted > 0 && item.spent > item.budgeted;

            return (
              <div key={item.categoryName}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.categoryName}</span>
                  <span className={isOver ? 'text-red-600' : 'text-gray-500'}>
                    {formatCurrency(item.spent)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOver ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                    style={{
                      width: `${item.budgeted > 0 ? percentage : Math.min(item.spent / 10000 * 100, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
