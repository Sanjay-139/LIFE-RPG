import { Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const status = await calendarService.getStatus(userId);
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
}

export async function connectCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { email } = req.body || {};
    const status = await calendarService.connect(userId, email);
    res.json({
      success: true,
      data: status,
      message: status.authUrl ? 'Google OAuth authorization URL generated' : 'Google Calendar successfully connected'
    });
  } catch (err) {
    next(err);
  }
}

export async function handleOAuthCallback(req: any, res: Response, next: NextFunction) {
  try {
    const { code, state, error } = req.query;
    if (error || !code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?calendar=error&reason=${encodeURIComponent(String(error || 'missing_code'))}`);
    }

    const result = await calendarService.handleOAuthCallback(String(code), String(state));
    return res.redirect(result.redirectUrl);
  } catch (err) {
    next(err);
  }
}

export async function disconnectCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const status = await calendarService.disconnect(userId);
    res.json({
      success: true,
      data: status,
      message: 'Google Calendar disconnected'
    });
  } catch (err) {
    next(err);
  }
}

export async function getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const events = await calendarService.getEvents(userId);
    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    next(err);
  }
}

export async function reauthorizeCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const status = await calendarService.setReauthorizationRequired(userId);
    res.json({
      success: true,
      data: status,
      message: 'Google Calendar reauthorization required'
    });
  } catch (err) {
    next(err);
  }
}
