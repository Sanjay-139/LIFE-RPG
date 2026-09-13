import { Router } from 'express';
import * as streakController from '../controllers/streak.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', streakController.getStreaks);
router.get('/monthly', streakController.getMonthlyActivity);

export default router;
