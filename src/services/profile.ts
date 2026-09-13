import { api } from './api';
import { ApiResponse, UserProfile } from '../types';

export const profileService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return api.get<UserProfile>('/profile');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return api.patch<UserProfile>('/profile', updates);
  },
};
