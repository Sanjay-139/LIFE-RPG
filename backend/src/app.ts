import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env.js';
import { isPostgresConnected } from './config/database.js';
import { generalLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// LIFE RPG Domain Routers
import authRoutes from './routes/auth.routes.js';
import questRoutes from './routes/quest.routes.js';
import characterRoutes from './routes/character.routes.js';
import progressionRoutes from './routes/progression.routes.js';
import streakRoutes from './routes/streak.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import activityRoutes from './routes/activity.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import profileRoutes from './routes/profile.routes.js';
import missionRoutes from './routes/mission.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import progressRoutes from './routes/progress.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers & CORS
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  app.use(cors({
    origin: (origin, callback) => {
      // Allow development frontend, localhost, or non-browser server-to-server requests
      if (!origin || origin === env.FRONTEND_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Timezone']
  }));

  // 2. Performance & Logging
  app.use(compression());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 3. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 4. Rate Limiting
  app.use('/api/', generalLimiter);

  // 5. Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'LIFE RPG backend is running',
      database: isPostgresConnected ? 'connected' : 'local_storage_mode',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // 6. Mount LIFE RPG Routers under /api
  app.use('/api/auth', authRoutes);
  app.use('/api/quests', questRoutes);
  app.use('/api/character', characterRoutes);
  app.use('/api/progression', progressionRoutes);
  app.use('/api/streaks', streakRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/missions', missionRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/progress', progressRoutes);

  // 7. 404 Not Found Handler
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `LIFE RPG route "${req.originalUrl}" does not exist`
      }
    });
  });

  // 8. Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
