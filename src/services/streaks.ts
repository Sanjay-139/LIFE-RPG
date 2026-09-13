import { api } from './api';
import { ApiResponse } from '../types';

export interface WeeklyActivityDay {
  day: string;
  date: string;
  xp: number;
  questsCompleted: number;
  completedQuests?: number;
  active: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

export interface MonthlyActivityDay {
  day: number;
  date: string;
  weekday: string;
  completedQuests: number;
  questsCompleted: number;
  xpEarned: number;
  active: boolean;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface StreakMilestone {
  days: number;
  title: string;
  reward?: string;
  reached: boolean;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate?: string | null;
  freezesRemaining: number;
  weeklyActivity: WeeklyActivityDay[];
  dailyQuestCounts?: number[];
  weeklyCompletedQuestCount?: number;
  activeDays?: number;
  streakMilestones: StreakMilestone[];
}

export interface MonthlyActivityData {
  month: string;
  year: number;
  activeDays: number;
  elapsedDays: number;
  totalDays: number;
  consistencyRate: number;
  days: MonthlyActivityDay[];
}

export const streakService = {
  async getStreaks(): Promise<ApiResponse<StreakData>> {
    return api.get<StreakData>('/streaks');
  },

  async getMonthlyActivity(): Promise<ApiResponse<MonthlyActivityData>> {
    return api.get<MonthlyActivityData>('/streaks/monthly');
  },
};
