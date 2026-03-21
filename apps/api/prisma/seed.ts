import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '@family-budget/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create system categories (skip if already exist)
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, familyId: null, isSystem: true },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          isSystem: true,
          familyId: null,
        },
      });
    }
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
