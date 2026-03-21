import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InvestmentService } from '../services/investment.service';

export class InvestmentController {
  static async getConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await InvestmentService.getConfig(req.familyId!);
      res.json(config);
    } catch (err) { next(err); }
  }

  static async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await InvestmentService.updateConfig(req.familyId!, req.body);
      res.json(config);
    } catch (err) { next(err); }
  }

  static async getProjection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projection = await InvestmentService.getProjection(req.familyId!);
      res.json(projection);
    } catch (err) { next(err); }
  }
}
