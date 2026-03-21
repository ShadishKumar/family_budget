import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { projectInvestment, suggestAllocation } from '@family-budget/shared';
import { TransactionService } from './transaction.service';

export class InvestmentService {
  static async getConfig(familyId: string) {
    let config = await prisma.investmentConfig.findUnique({ where: { familyId } });
    if (!config) {
      // Create default config
      config = await prisma.investmentConfig.create({
        data: {
          familyId,
          savingsPercentage: new Prisma.Decimal(50),
          expectedReturnRate: new Prisma.Decimal(12),
          projectionYears: 10,
        },
      });
    }
    return {
      ...config,
      savingsPercentage: Number(config.savingsPercentage),
      expectedReturnRate: Number(config.expectedReturnRate),
    };
  }

  static async updateConfig(familyId: string, data: {
    savingsPercentage?: number;
    expectedReturnRate?: number;
    projectionYears?: number;
  }) {
    return prisma.investmentConfig.upsert({
      where: { familyId },
      create: {
        familyId,
        savingsPercentage: new Prisma.Decimal(data.savingsPercentage ?? 50),
        expectedReturnRate: new Prisma.Decimal(data.expectedReturnRate ?? 12),
        projectionYears: data.projectionYears ?? 10,
      },
      update: {
        ...(data.savingsPercentage !== undefined && {
          savingsPercentage: new Prisma.Decimal(data.savingsPercentage),
        }),
        ...(data.expectedReturnRate !== undefined && {
          expectedReturnRate: new Prisma.Decimal(data.expectedReturnRate),
        }),
        ...(data.projectionYears !== undefined && { projectionYears: data.projectionYears }),
      },
    });
  }

  static async getProjection(familyId: string) {
    const config = await InvestmentService.getConfig(familyId);

    // Get last 3 months summary to calculate average monthly savings
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const summary = await TransactionService.getSummary(
      familyId,
      threeMonthsAgo.toISOString(),
      new Date().toISOString(),
    );

    const monthlyIncome = summary.totalIncome / 3;
    const monthlyExpenses = summary.totalExpenses / 3;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const monthlyInvestment = monthlySavings * (config.savingsPercentage / 100);

    const projections = projectInvestment({
      principal: 0,
      monthlyContribution: Math.max(0, monthlyInvestment),
      annualRate: config.expectedReturnRate,
      years: config.projectionYears,
    });

    const allocation = suggestAllocation(monthlyIncome, monthlyExpenses);

    return {
      config,
      monthlySavings,
      monthlyInvestment,
      projections,
      allocation,
    };
  }
}
