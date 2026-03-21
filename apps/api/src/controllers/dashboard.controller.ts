import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getLayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const layout = await DashboardService.getLayout(req.user!.userId, req.familyId!);
      res.json(layout);
    } catch (err) { next(err); }
  }

  static async saveLayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const layout = await DashboardService.saveLayout(req.user!.userId, req.familyId!, req.body.widgets);
      res.json(layout);
    } catch (err) { next(err); }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary(req.familyId!);
      res.json(summary);
    } catch (err) { next(err); }
  }
}
