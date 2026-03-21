import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FamilyService } from '../services/family.service';

export class FamilyController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const family = await FamilyService.create(req.body.name, req.user!.userId);
      res.status(201).json(family);
    } catch (err) { next(err); }
  }

  static async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const members = await FamilyService.getMembers(req.familyId!);
      res.json(members);
    } catch (err) { next(err); }
  }

  static async invite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const member = await FamilyService.inviteMember(req.familyId!, email, role);
      res.status(201).json(member);
    } catch (err) { next(err); }
  }

  static async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await FamilyService.updateMemberRole(req.params.id, req.familyId!, req.body.role);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json(member);
    } catch (err) { next(err); }
  }

  static async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const removed = await FamilyService.removeMember(req.params.id, req.familyId!);
      if (!removed) return res.status(404).json({ error: 'Member not found' });
      res.json({ message: 'Member removed' });
    } catch (err) { next(err); }
  }
}
