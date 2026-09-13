import { Router } from 'express';
import * as characterController from '../controllers/character.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { allocateAttributeSchema } from '../schemas/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', characterController.getCharacter);
router.patch('/', characterController.updateCharacter);
router.get('/attributes', characterController.getAttributes);
router.post('/attributes/allocate', validate(allocateAttributeSchema), characterController.allocateAttributePoint);

export default router;
