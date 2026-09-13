import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getNotifications(userId);
    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const updated = await notificationService.markAsRead(userId, req.params.id);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function clearAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await notificationService.clearAll(userId);
    res.json({
      success: true,
      data: true,
      message: 'All transmissions cleared'
    });
  } catch (err) {
    next(err);
  }
}
