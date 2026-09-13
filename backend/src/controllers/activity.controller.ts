import { Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await activityService.getActivity(userId, limit);
    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
}
