import { rpgStore } from '../database/rpgStore.js';
import { UserProfile } from '../types/index.js';

export class ProfileService {
  async getProfile(userId: string): Promise<UserProfile> {
    return rpgStore.getProfile(userId);
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return rpgStore.updateProfile(userId, updates);
  }
}

export const profileService = new ProfileService();
