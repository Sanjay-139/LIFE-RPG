import { Response, NextFunction } from 'express';
import { rewardService } from '../services/reward.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getRewards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const rewards = await rewardService.getRewards(userId);
    res.json({
      success: true,
      data: rewards
    });
  } catch (err) {
    next(err);
  }
}

export async function purchaseReward(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await rewardService.purchaseReward(userId, req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
