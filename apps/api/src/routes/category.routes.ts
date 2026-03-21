import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireFamily } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '@family-budget/shared';

const router = Router();

router.use(authenticate, requireFamily);

router.get('/', CategoryController.list);
router.post('/', validate(createCategorySchema), CategoryController.create);
router.put('/:id', validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
