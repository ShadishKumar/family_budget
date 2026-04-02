import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateTransactionInput, TransactionFilterInput } from '@family-budget/shared';

export class TransactionService {
  static async create(data: CreateTransactionInput, userId: string, familyId: string) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        originalAmount: data.originalAmount ? new Prisma.Decimal(data.originalAmount) : null,
        originalCurrency: data.originalCurrency ?? null,
        exchangeRate: data.exchangeRate ? new Prisma.Decimal(data.exchangeRate) : null,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        inputMethod: data.inputMethod ?? 'MANUAL',
        categoryId: data.categoryId,
        receiptUrl: data.receiptUrl,
        ocrRawText: data.ocrRawText,
        notes: data.notes,
        userId,
        familyId,
        tags: data.tags
          ? { create: data.tags.map((tag: string) => ({ tag })) }
          : undefined,
      },
      include: { category: true, tags: true, user: true },
    });
    return transaction;
  }

  static async list(familyId: string, filters: TransactionFilterInput) {
    const where: Prisma.TransactionWhereInput = { familyId };

    if (filters.startDate) where.date = { ...where.date as object, gte: new Date(filters.startDate) };
    if (filters.endDate) where.date = { ...where.date as object, lte: new Date(filters.endDate) };
    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.inputMethod) where.inputMethod = filters.inputMethod;
    if (filters.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, tags: true, user: true },
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  static async getById(id: string, familyId: string) {
    return prisma.transaction.findFirst({
      where: { id, familyId },
      include: { category: true, tags: true, user: true },
    });
  }

  static async update(id: string, familyId: string, data: Partial<CreateTransactionInput>) {
    const existing = await prisma.transaction.findFirst({ where: { id, familyId } });
    if (!existing) return null;

    return prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.description && { description: data.description }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.type && { type: data.type }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { category: true, tags: true, user: true },
    });
  }

  static async delete(id: string, familyId: string) {
    const existing = await prisma.transaction.findFirst({ where: { id, familyId } });
    if (!existing) return false;
    await prisma.transaction.delete({ where: { id } });
    return true;
  }

  static async getSummary(familyId: string, startDate?: string, endDate?: string) {
    const where: Prisma.TransactionWhereInput = { familyId };
    if (startDate) where.date = { ...where.date as object, gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date as object, lte: new Date(endDate) };

    const [incomeAgg, expenseAgg, byCategory, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where,
        select: { date: true, type: true, amount: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

    // Get category details for the grouped results
    const categoryIds = byCategory.map(c => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Group by month
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) ?? { income: 0, expenses: 0 };
      if (t.type === 'INCOME') entry.income += Number(t.amount);
      else entry.expenses += Number(t.amount);
      monthlyMap.set(key, entry);
    }

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: incomeAgg._count + expenseAgg._count,
      byCategory: byCategory.map(c => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId)?.name ?? 'Unknown',
        color: categoryMap.get(c.categoryId)?.color ?? '#9E9E9E',
        total: Number(c._sum.amount ?? 0),
      })),
      byMonth: Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
      })),
    };
  }
}
