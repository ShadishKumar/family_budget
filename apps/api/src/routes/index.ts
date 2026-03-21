import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import assetRoutes from './asset.routes';
import investmentRoutes from './investment.routes';
import dashboardRoutes from './dashboard.routes';
import ocrRoutes from './ocr.routes';
import familyRoutes from './family.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/assets', assetRoutes);
router.use('/investments', investmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ocr', ocrRoutes);
router.use('/family', familyRoutes);

export default router;
