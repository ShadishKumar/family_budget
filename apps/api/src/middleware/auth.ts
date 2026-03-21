import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  familyId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;

    // Get user's active family
    const membership = await prisma.familyMember.findFirst({
      where: { userId: payload.userId },
      select: { familyId: true },
    });

    if (membership) {
      req.familyId = membership.familyId;
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireFamily(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.familyId) {
    return res.status(403).json({ error: 'You must belong to a family to access this resource' });
  }
  next();
}

export async function requireRole(roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.familyId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: req.user.userId,
          familyId: req.familyId,
        },
      },
    });

    if (!membership || !roles.includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
