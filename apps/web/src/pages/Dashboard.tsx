import Header from '../components/layout/Header';
import { useDashboardSummary } from '../api/hooks/useDashboard';
import { useTransactionSummary } from '../api/hooks/useTransactions';
import { useNetWorth } from '../api/hooks/useAssets';
import IncomeExpenseChart from '../components/dashboard/widgets/IncomeExpenseChart';
import CategoryPieChart from '../components/dashboard/widgets/CategoryPieChart';
import MonthlyTrendLine from '../components/dashboard/widgets/MonthlyTrendLine';
import NetSavingsCard from '../components/dashboard/widgets/NetSavingsCard';
import RecentTransactions from '../components/dashboard/widgets/RecentTransactions';
import BudgetProgress from '../components/dashboard/widgets/BudgetProgress';
import NetWorthWidget from '../components/dashboard/widgets/NetWorthWidget';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboardSummary();
  const { data: yearSummary } = useTransactionSummary(
    new Date(new Date().getFullYear(), 0, 1).toISOString(),
    new Date().toISOString()
  );
  const { data: netWorthData } = useNetWorth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  const monthData = dashboardData?.currentMonth;

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your family finances" />

      <div className="p-6">
        {/* Row 1: Key metrics */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-4">
            <NetSavingsCard
              totalIncome={monthData?.totalIncome ?? 0}
              totalExpenses={monthData?.totalExpenses ?? 0}
            />
          </div>
          <div className="col-span-4">
            <NetWorthWidget
              totalAssets={netWorthData?.totalAssets ?? 0}
              assetsByType={netWorthData?.assetsByType ?? []}
            />
          </div>
          <div className="col-span-4">
            <RecentTransactions transactions={dashboardData?.recentTransactions ?? []} />
          </div>
        </div>

        {/* Row 2: Charts */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-6">
            <IncomeExpenseChart data={yearSummary?.byMonth ?? []} />
          </div>
          <div className="col-span-6">
            <CategoryPieChart data={monthData?.byCategory ?? []} />
          </div>
        </div>

        {/* Row 3: Trend + Budget */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <MonthlyTrendLine data={yearSummary?.byMonth ?? []} />
          </div>
          <div className="col-span-4">
            <BudgetProgress
              data={(monthData?.byCategory ?? []).map((c: { categoryName: string; total: number; color?: string }) => ({
                categoryName: c.categoryName,
                spent: c.total,
                budgeted: 0,
                color: c.color,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
