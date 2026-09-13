import { api } from './api';
import { ApiResponse, LevelMilestone } from '../types';

export interface WeeklyActivityItem {
  day: string;
  date: string;
  xp: number;
  questsCompleted: number;
  active: boolean;
}

export interface ProgressionData {
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  percentage: number;
  attributePoints?: number;
  milestones: LevelMilestone[];
  history: WeeklyActivityItem[];
}

export const progressionService = {
  async getProgression(): Promise<ApiResponse<ProgressionData>> {
    return api.get<ProgressionData>('/progression');
  },

  async getHistory(): Promise<ApiResponse<WeeklyActivityItem[]>> {
    return api.get<WeeklyActivityItem[]>('/progression/history');
  },
};
