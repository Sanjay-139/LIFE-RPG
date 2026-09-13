import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public OAuth callback from Google OAuth redirect
router.get('/callback', calendarController.handleOAuthCallback);

// Protected endpoints
router.use(requireAuth);

router.get('/status', calendarController.getStatus);
router.post('/connect', calendarController.connectCalendar);
router.post('/disconnect', calendarController.disconnectCalendar);
router.post('/reauthorize', calendarController.reauthorizeCalendar);
router.get('/events', calendarController.getEvents);

export default router;
