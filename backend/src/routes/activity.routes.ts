import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', activityController.getActivity);

export default router;
