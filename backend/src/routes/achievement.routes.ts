import { Router } from 'express';
import * as achievementController from '../controllers/achievement.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', achievementController.getAchievements);
router.post('/:id/claim', achievementController.claimAchievement);

export default router;
