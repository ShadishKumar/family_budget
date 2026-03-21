import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OcrService } from '../services/ocr.service';

export class OcrController {
  static async scan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      const result = await OcrService.scanReceipt(req.file.buffer);
      res.json(result);
    } catch (err) { next(err); }
  }
}
