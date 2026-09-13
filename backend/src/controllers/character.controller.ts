import { Response, NextFunction } from 'express';
import { characterService } from '../services/character.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getCharacter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sheet = await characterService.getCharacter(userId);
    res.json({
      success: true,
      data: sheet
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttributes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const attributes = await characterService.getAttributes(userId);
    res.json({
      success: true,
      data: attributes
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCharacter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const updated = await characterService.updateCharacter(userId, req.body);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function allocateAttributePoint(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { attribute, points } = req.body;
    const updated = await characterService.allocateAttributePoint(userId, attribute, points || 1);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
