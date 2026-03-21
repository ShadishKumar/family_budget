import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AssetService } from '../services/asset.service';

export class AssetController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assets = await AssetService.list(req.familyId!);
      res.json(assets);
    } catch (err) { next(err); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await AssetService.create(req.body, req.familyId!);
      res.status(201).json(asset);
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await AssetService.update(req.params.id, req.familyId!, req.body);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      res.json(asset);
    } catch (err) { next(err); }
  }

  static async recordValue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { value, date } = req.body;
      const asset = await AssetService.recordValue(req.params.id, req.familyId!, value, date);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      res.json(asset);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await AssetService.delete(req.params.id, req.familyId!);
      if (!deleted) return res.status(404).json({ error: 'Asset not found' });
      res.json({ message: 'Asset deleted' });
    } catch (err) { next(err); }
  }

  static async netWorth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const netWorth = await AssetService.getNetWorth(req.familyId!);
      res.json(netWorth);
    } catch (err) { next(err); }
  }
}
