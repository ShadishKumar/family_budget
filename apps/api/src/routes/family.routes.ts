import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireFamily, requireRole } from '../middleware/auth';
import { inviteMemberSchema } from '@family-budget/shared';

const router = Router();

router.use(authenticate);

router.post('/', FamilyController.create);
router.get('/members', requireFamily, FamilyController.getMembers);
router.post('/invite', requireFamily, validate(inviteMemberSchema), FamilyController.invite);
router.patch('/members/:id', requireFamily, requireRole(['ADMIN']), FamilyController.updateRole);
router.delete('/members/:id', requireFamily, requireRole(['ADMIN']), FamilyController.remove);

export default router;
