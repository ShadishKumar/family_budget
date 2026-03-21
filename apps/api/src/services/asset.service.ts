import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateAssetInput } from '@family-budget/shared';

export class AssetService {
  static async list(familyId: string) {
    return prisma.asset.findMany({
      where: { familyId },
      include: {
        valueHistory: { orderBy: { date: 'desc' }, take: 12 },
      },
      orderBy: { currentValue: 'desc' },
    });
  }

  static async create(data: CreateAssetInput, familyId: string) {
    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchaseValue: data.purchaseValue ? new Prisma.Decimal(data.purchaseValue) : null,
        currentValue: new Prisma.Decimal(data.currentValue),
        currency: data.currency,
        description: data.description,
        metadata: (data.metadata as any) ?? undefined,
        familyId,
        valueHistory: {
          create: {
            value: new Prisma.Decimal(data.currentValue),
            date: new Date(),
          },
        },
      },
      include: { valueHistory: true },
    });
    return asset;
  }

  static async update(id: string, familyId: string, data: Partial<CreateAssetInput>) {
    const existing = await prisma.asset.findFirst({ where: { id, familyId } });
    if (!existing) return null;

    const updateData: Prisma.AssetUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.currentValue !== undefined) {
      updateData.currentValue = new Prisma.Decimal(data.currentValue);
      // Also record in history
      await prisma.assetValueHistory.create({
        data: {
          assetId: id,
          value: new Prisma.Decimal(data.currentValue),
          date: new Date(),
        },
      });
    }

    return prisma.asset.update({
      where: { id },
      data: updateData,
      include: { valueHistory: { orderBy: { date: 'desc' }, take: 12 } },
    });
  }

  static async recordValue(id: string, familyId: string, value: number, date: string) {
    const asset = await prisma.asset.findFirst({ where: { id, familyId } });
    if (!asset) return null;

    await prisma.assetValueHistory.create({
      data: {
        assetId: id,
        value: new Prisma.Decimal(value),
        date: new Date(date),
      },
    });

    return prisma.asset.update({
      where: { id },
      data: { currentValue: new Prisma.Decimal(value) },
      include: { valueHistory: { orderBy: { date: 'desc' }, take: 12 } },
    });
  }

  static async delete(id: string, familyId: string) {
    const asset = await prisma.asset.findFirst({ where: { id, familyId } });
    if (!asset) return false;
    await prisma.asset.delete({ where: { id } });
    return true;
  }

  static async getNetWorth(familyId: string) {
    const assets = await prisma.asset.findMany({
      where: { familyId },
      include: { valueHistory: { orderBy: { date: 'desc' }, take: 1 } },
    });

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);
    const byType = new Map<string, { total: number; count: number }>();

    for (const asset of assets) {
      const entry = byType.get(asset.type) ?? { total: 0, count: 0 };
      entry.total += Number(asset.currentValue);
      entry.count += 1;
      byType.set(asset.type, entry);
    }

    return {
      totalAssets,
      assetsByType: Array.from(byType.entries()).map(([type, data]) => ({
        type,
        total: data.total,
        count: data.count,
      })),
    };
  }
}
