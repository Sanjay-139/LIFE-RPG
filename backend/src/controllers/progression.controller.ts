import { Response, NextFunction } from 'express';
import { progressionService } from '../services/progression.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getProgression(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const overview = await progressionService.getProgressionOverview(userId);
    res.json({
      success: true,
      data: overview
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const history = await progressionService.getWeeklyActivity(userId);
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
}
