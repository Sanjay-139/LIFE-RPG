import { Response, NextFunction } from 'express';
import { achievementService } from '../services/achievement.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const achievements = await achievementService.getAchievements(userId);
    res.json({
      success: true,
      data: achievements
    });
  } catch (err) {
    next(err);
  }
}

export async function claimAchievement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const achievement = await achievementService.claimAchievement(userId, req.params.id);
    res.json({
      success: true,
      data: achievement
    });
  } catch (err) {
    next(err);
  }
}
