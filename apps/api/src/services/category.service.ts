import { prisma } from '../config/database';
import { CreateCategoryInput } from '@family-budget/shared';

export class CategoryService {
  static async list(familyId: string) {
    return prisma.category.findMany({
      where: {
        OR: [
          { isSystem: true },
          { familyId },
        ],
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  static async create(data: CreateCategoryInput, familyId: string) {
    return prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        isSystem: false,
        familyId,
      },
    });
  }

  static async update(id: string, familyId: string, data: Partial<CreateCategoryInput>) {
    const category = await prisma.category.findFirst({
      where: { id, familyId, isSystem: false },
    });
    if (!category) return null;

    return prisma.category.update({ where: { id }, data });
  }

  static async delete(id: string, familyId: string) {
    const category = await prisma.category.findFirst({
      where: { id, familyId, isSystem: false },
    });
    if (!category) return false;

    await prisma.category.delete({ where: { id } });
    return true;
  }
}
