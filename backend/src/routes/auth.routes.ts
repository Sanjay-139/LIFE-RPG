import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '../schemas/index.js';
import { authLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
