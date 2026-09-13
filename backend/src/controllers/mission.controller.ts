import { Response, NextFunction } from 'express';
import { missionService } from '../services/mission.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getTodayMissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const missions = await missionService.getTodayMissions(userId);
    res.json({
      success: true,
      data: missions
    });
  } catch (err) {
    next(err);
  }
}
