import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireFamily } from '../middleware/auth';
import { createTransactionSchema, updateTransactionSchema } from '@family-budget/shared';

const router = Router();

router.use(authenticate, requireFamily);

router.get('/', TransactionController.list);
router.get('/summary', TransactionController.summary);
router.get('/:id', TransactionController.getById);
router.post('/', validate(createTransactionSchema), TransactionController.create);
router.put('/:id', validate(updateTransactionSchema), TransactionController.update);
router.delete('/:id', TransactionController.delete);

export default router;
