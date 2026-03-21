export type WidgetType =
  | 'income-expense-chart'
  | 'category-pie'
  | 'monthly-trend'
  | 'net-savings'
  | 'recent-transactions'
  | 'budget-progress'
  | 'net-worth'
  | 'investment-projection';

export interface WidgetConfig {
  widgetId: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  familyId: string;
  widgets: WidgetConfig[];
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}
