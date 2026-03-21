import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TransactionService } from '../services/transaction.service';
import { transactionFilterSchema } from '@family-budget/shared';

export class TransactionController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.create(req.body, req.user!.userId, req.familyId!);
      res.status(201).json(transaction);
    } catch (err) { next(err); }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const result = await TransactionService.list(req.familyId!, filters);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.getById(req.params.id, req.familyId!);
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
      res.json(transaction);
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.update(req.params.id, req.familyId!, req.body);
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
      res.json(transaction);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await TransactionService.delete(req.params.id, req.familyId!);
      if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
      res.json({ message: 'Transaction deleted' });
    } catch (err) { next(err); }
  }

  static async summary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const summary = await TransactionService.getSummary(req.familyId!, startDate, endDate);
      res.json(summary);
    } catch (err) { next(err); }
  }
}
