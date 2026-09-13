import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { rpgStore } from '../database/rpgStore.js';
import { UserProfile } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export interface AuthResult {
  user: UserProfile;
  token: string;
}

export class AuthService {
  private generateToken(user: { id: string; email: string; role?: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'adventurer' },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(params: {
    name?: string;
    fullName?: string;
    email: string;
    password?: string;
    phone?: string;
  }): Promise<AuthResult> {
    const rawName = (params.fullName || params.name || '').trim();
    const name = rawName.length > 0 ? rawName : 'New Adventurer';
    const email = (params.email || '').trim().toLowerCase();
    const password = params.password || 'password123';

    if (!email || !email.includes('@')) {
      throw new AppError('Valid email address is required', 400, 'INVALID_EMAIL');
    }

    const existing = await rpgStore.findUserByEmail(email);
    if (existing) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await rpgStore.createUser({
      name,
      email,
      passwordHash,
      phone: params.phone
    });

    const profile = await rpgStore.getProfile(user.id);
    const token = this.generateToken(user);
    return {
      user: profile,
      token
    };
  }

  async login(params: { email: string; password?: string }): Promise<AuthResult> {
    const email = (params.email || '').trim().toLowerCase();
    const userRecord = await rpgStore.findUserByEmail(email);

    if (!userRecord) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (params.password) {
      const isValid = await bcrypt.compare(params.password, userRecord.passwordHash);
      if (!isValid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }
    } else {
      throw new AppError('Password is required', 400, 'PASSWORD_REQUIRED');
    }

    // Record last login timestamp
    await rpgStore.updateUserLastLogin(userRecord.id);

    const profile = await rpgStore.getProfile(userRecord.id);
    const token = this.generateToken(userRecord);

    return {
      user: profile,
      token
    };
  }

  async googleAuth(params: {
    email: string;
    fullName?: string;
    googleId?: string;
    avatar?: string;
  }): Promise<AuthResult> {
    const email = (params.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new AppError('Valid email address required from Google account', 400, 'INVALID_EMAIL');
    }

    // 1. Check if user exists by email or googleId
    let userRecord = await rpgStore.findUserByEmail(email);
    if (!userRecord && params.googleId) {
      userRecord = await rpgStore.findUserByGoogleId(params.googleId);
    }

    if (userRecord) {
      // Existing Google/Email account -> Open existing account (do NOT duplicate)
      if (params.googleId && !userRecord.googleId) {
        await rpgStore.updateUserGoogleId(userRecord.id, params.googleId);
        userRecord.googleId = params.googleId;
      }
      await rpgStore.updateUserLastLogin(userRecord.id);
      const profile = await rpgStore.getProfile(userRecord.id);
      const token = this.generateToken(userRecord);
      return { user: profile, token };
    }

    // 2. New Google user -> Provision account with Level 0, 100 coins baseline
    const name = (params.fullName || 'Google Adventurer').trim();
    const randomPw = `goog_${Date.now()}_${Math.random().toString(36)}`;
    const passwordHash = await bcrypt.hash(randomPw, 10);

    const newUser = await rpgStore.createUser({
      name,
      email,
      passwordHash,
      avatar: params.avatar && /^avatar-\d{2,}$/.test(params.avatar) ? params.avatar : 'avatar-01',
      googleId: params.googleId
    });

    await rpgStore.updateUserLastLogin(newUser.id);
    const profile = await rpgStore.getProfile(newUser.id);
    const token = this.generateToken(newUser);

    return {
      user: profile,
      token
    };
  }

  async getCurrentUser(userId: string): Promise<UserProfile> {
    const user = await rpgStore.findUserById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
    }
    return rpgStore.getProfile(userId);
  }
}

export const authService = new AuthService();
