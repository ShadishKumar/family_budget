import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireFamily } from '../middleware/auth';
import { investmentConfigSchema } from '@family-budget/shared';

const router = Router();

router.use(authenticate, requireFamily);

router.get('/config', InvestmentController.getConfig);
router.put('/config', validate(investmentConfigSchema), InvestmentController.updateConfig);
router.get('/projection', InvestmentController.getProjection);

export default router;
