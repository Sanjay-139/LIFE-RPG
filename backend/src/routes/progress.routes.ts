import { Router } from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', progressController.getProgress);

export default router;
