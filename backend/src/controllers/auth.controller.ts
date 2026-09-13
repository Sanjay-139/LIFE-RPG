import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  res.json({
    success: true,
    data: null,
    message: 'Adventurer session terminated safely'
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const user = await authService.getCurrentUser(userId);
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.googleAuth(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

