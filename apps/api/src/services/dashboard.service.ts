import { prisma } from '../config/database';
import { TransactionService } from './transaction.service';
import { AssetService } from './asset.service';

export class DashboardService {
  static async getLayout(userId: string, familyId: string) {
    const layout = await prisma.dashboardLayout.findUnique({
      where: { userId_familyId: { userId, familyId } },
    });

    if (!layout) {
      // Return default layout
      return {
        userId,
        familyId,
        widgets: [
          { widgetId: 'w1', type: 'income-expense-chart', x: 0, y: 0, w: 6, h: 4, config: {} },
          { widgetId: 'w2', type: 'category-pie', x: 6, y: 0, w: 6, h: 4, config: {} },
          { widgetId: 'w3', type: 'monthly-trend', x: 0, y: 4, w: 8, h: 4, config: {} },
          { widgetId: 'w4', type: 'net-savings', x: 8, y: 4, w: 4, h: 2, config: {} },
          { widgetId: 'w5', type: 'recent-transactions', x: 8, y: 6, w: 4, h: 2, config: {} },
          { widgetId: 'w6', type: 'budget-progress', x: 0, y: 8, w: 6, h: 3, config: {} },
          { widgetId: 'w7', type: 'net-worth', x: 6, y: 8, w: 6, h: 3, config: {} },
        ],
      };
    }

    return { userId, familyId, widgets: layout.layout };
  }

  static async saveLayout(userId: string, familyId: string, layout: unknown) {
    return prisma.dashboardLayout.upsert({
      where: { userId_familyId: { userId, familyId } },
      create: { userId, familyId, layout: layout as object },
      update: { layout: layout as object },
    });
  }

  static async getSummary(familyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const [monthSummary, netWorth, recentTransactions] = await Promise.all([
      TransactionService.getSummary(familyId, startOfMonth, endOfMonth),
      AssetService.getNetWorth(familyId),
      prisma.transaction.findMany({
        where: { familyId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    return {
      currentMonth: monthSummary,
      netWorth,
      recentTransactions,
    };
  }
}
