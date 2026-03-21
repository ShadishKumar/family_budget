import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireFamily } from '../middleware/auth';
import { createAssetSchema, updateAssetSchema, recordAssetValueSchema } from '@family-budget/shared';

const router = Router();

router.use(authenticate, requireFamily);

router.get('/', AssetController.list);
router.get('/net-worth', AssetController.netWorth);
router.post('/', validate(createAssetSchema), AssetController.create);
router.put('/:id', validate(updateAssetSchema), AssetController.update);
router.post('/:id/value', validate(recordAssetValueSchema), AssetController.recordValue);
router.delete('/:id', AssetController.delete);

export default router;
