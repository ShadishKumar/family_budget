import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.list(req.familyId!);
      res.json(categories);
    } catch (err) { next(err); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.create(req.body, req.familyId!);
      res.status(201).json(category);
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.update(req.params.id, req.familyId!, req.body);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      res.json(category);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await CategoryService.delete(req.params.id, req.familyId!);
      if (!deleted) return res.status(404).json({ error: 'Category not found' });
      res.json({ message: 'Category deleted' });
    } catch (err) { next(err); }
  }
}
