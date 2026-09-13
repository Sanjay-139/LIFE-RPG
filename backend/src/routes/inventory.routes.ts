import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', inventoryController.getInventory);
router.post('/:id/equip', inventoryController.equipItem);
router.post('/:id/unequip', inventoryController.unequipItem);

export default router;
