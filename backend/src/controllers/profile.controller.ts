import { Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const profile = await profileService.getProfile(userId);
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const updated = await profileService.updateProfile(userId, req.body);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
