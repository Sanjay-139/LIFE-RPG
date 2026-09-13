import { Router } from 'express';
import * as progressionController from '../controllers/progression.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', progressionController.getProgression);
router.get('/history', progressionController.getHistory);

export default router;
