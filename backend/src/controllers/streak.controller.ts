import { Response, NextFunction } from 'express';
import { streakService } from '../services/streak.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getStreaks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const timezone = req.headers['x-timezone'] as string | undefined;
    const streaks = await streakService.getStreaks(userId, timezone);
    res.json({
      success: true,
      data: streaks
    });
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const timezone = req.headers['x-timezone'] as string | undefined;
    const monthly = await streakService.getMonthlyActivity(userId, timezone);
    res.json({
      success: true,
      data: monthly
    });
  } catch (err) {
    next(err);
  }
}
