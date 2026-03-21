import { prisma } from '../config/database';
import { AppError } from '../middleware/error-handler';

export class FamilyService {
  static async create(name: string, userId: string) {
    return prisma.family.create({
      data: {
        name,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
      include: { members: { include: { user: true } } },
    });
  }

  static async getMembers(familyId: string) {
    return prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  static async inviteMember(familyId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, 'No user found with that email. They must register first.');
    }

    const existing = await prisma.familyMember.findUnique({
      where: { userId_familyId: { userId: user.id, familyId } },
    });
    if (existing) {
      throw new AppError(409, 'User is already a member of this family');
    }

    return prisma.familyMember.create({
      data: { userId: user.id, familyId, role },
      include: { user: true },
    });
  }

  static async updateMemberRole(memberId: string, familyId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId },
    });
    if (!member) return null;

    return prisma.familyMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: true },
    });
  }

  static async removeMember(memberId: string, familyId: string) {
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId },
    });
    if (!member) return false;

    await prisma.familyMember.delete({ where: { id: memberId } });
    return true;
  }
}
