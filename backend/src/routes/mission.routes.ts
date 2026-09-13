import { Router } from 'express';
import * as missionController from '../controllers/mission.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/today', missionController.getTodayMissions);

export default router;
