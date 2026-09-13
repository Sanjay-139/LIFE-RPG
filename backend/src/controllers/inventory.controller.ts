import { Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const inventory = await inventoryService.getInventory(userId);
    res.json({
      success: true,
      data: inventory
    });
  } catch (err) {
    next(err);
  }
}

export async function equipItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const item = await inventoryService.equipItem(userId, req.params.id);
    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
}

export async function unequipItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const item = await inventoryService.unequipItem(userId, req.params.id);
    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
}
