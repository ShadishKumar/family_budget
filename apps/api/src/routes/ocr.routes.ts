import { Router } from 'express';
import multer from 'multer';
import { OcrController } from '../controllers/ocr.controller';
import { authenticate, requireFamily } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.use(authenticate, requireFamily);

router.post('/scan', upload.single('receipt'), OcrController.scan);

export default router;
