import { Response, NextFunction } from 'express';
import { progressionService } from '../services/progression.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const timezone = req.headers['x-timezone'] as string | undefined;
    const progress = await progressionService.getProgress(userId, timezone);
    res.json({
      success: true,
      data: progress
    });
  } catch (err) {
    next(err);
  }
}
