import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireFamily } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireFamily);

router.get('/layout', DashboardController.getLayout);
router.put('/layout', DashboardController.saveLayout);
router.get('/summary', DashboardController.getSummary);

export default router;
