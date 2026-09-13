import { api } from './api';
import { ApiResponse, Achievement } from '../types';

export const achievementService = {
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    return api.get<Achievement[]>('/achievements');
  },

  async claimAchievementReward(id: string): Promise<ApiResponse<Achievement>> {
    return api.post<Achievement>(`/achievements/${id}/claim`);
  },
};
