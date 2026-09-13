import {
  activityAnalyticsService,
  type WeeklyActivityDay,
  type MonthlyActivityDay,
  type StreakMilestone,
  type StreakData,
  type MonthlyActivityData
} from './activityAnalytics.service.js';

export type {
  WeeklyActivityDay,
  MonthlyActivityDay,
  StreakMilestone,
  StreakData,
  MonthlyActivityData
};

export class StreakService {
  /**
   * Retrieves comprehensive streak and weekly cadence telemetry.
   */
  async getStreaks(userId: string, timezone?: string): Promise<StreakData> {
    return activityAnalyticsService.getWeeklyCadence(userId, timezone);
  }

  /**
   * Generates monthly activity matrix for the current calendar month.
   */
  async getMonthlyActivity(userId: string, timezone?: string): Promise<MonthlyActivityData> {
    return activityAnalyticsService.getMonthlyActivity(userId, timezone);
  }

  /**
   * Evaluates consecutive ACTIVE DAYS when a qualifying quest is completed.
   * Multiple quests on the same calendar day count as 1 active day.
   */
  async recordActivity(userId: string, timezone?: string): Promise<{
    currentStreak: number;
    bestStreak: number;
    streakIncreased: boolean;
    todayQuestCount: number;
  }> {
    return activityAnalyticsService.recordActivity(userId, timezone);
  }
}

export const streakService = new StreakService();

