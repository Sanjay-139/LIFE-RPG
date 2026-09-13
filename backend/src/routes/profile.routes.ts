import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { profileUpdateSchema } from '../schemas/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.patch('/', validate(profileUpdateSchema), profileController.updateProfile);

export default router;
