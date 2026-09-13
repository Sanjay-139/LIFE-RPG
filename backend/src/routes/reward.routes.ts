import { Router } from 'express';
import * as rewardController from '../controllers/reward.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', rewardController.getRewards);
router.post('/:id/purchase', rewardController.purchaseReward);

export default router;
