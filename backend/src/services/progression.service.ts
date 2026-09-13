import { rpgStore, getUserLocalDate } from '../database/rpgStore.js';
import { AttributeKey, QuestDifficulty, QuestCategory, ActivityLog } from '../types/index.js';
import { activityAnalyticsService } from './activityAnalytics.service.js';

export interface ProgressionOverview {
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  percentage: number;
  attributePoints: number;
  milestones: { level: number; title: string; xpRequired: number; perks: string[] }[];
  history: { day: string; date: string; xp: number; questsCompleted: number; active: boolean }[];
}

export interface ProgressTelemetry {
  weeklyXP: number;
  monthlyXP: number;
  dailyQuestCounts: number[];
  dailyXP: number[];
  activeDays: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  attributeDistribution: Record<string, { value: number; recentGain: number; level: number }>;
  recentActivity: ActivityLog[];
}

export class ProgressionService {
  /**
   * Authoritative non-linear formula: XP required for a given level.
   * Level 1: 100 XP
   * Level 2: 135 XP
   * Level 3: 182 XP
   * Level 4: 246 XP
   * Level 5: 332 XP
   * Level 10: 1,489 XP
   * Level 14: 4,942 XP
   */
  getXpRequiredForLevel(level: number): number {
    if (level <= 1) return 100;
    return Math.round(100 * Math.pow(1.35, level - 1));
  }

  /**
   * Cumulative total XP required to reach a specific level starting from level 1.
   */
  getCumulativeXpForLevel(targetLevel: number): number {
    let sum = 0;
    for (let l = 1; l < targetLevel; l++) {
      sum += this.getXpRequiredForLevel(l);
    }
    return sum;
  }

  /**
   * Computes authoritative level, progress within level, and next level threshold from total XP.
   * For brand new users with totalXp === 0, returns Level 0 baseline.
   */
  calculateLevelFromTotalXp(totalXp: number): { level: number; currentXp: number; xpToNextLevel: number } {
    if (totalXp === 0) {
      return {
        level: 0,
        currentXp: 0,
        xpToNextLevel: 100
      };
    }
    let level = 1;
    let accumulated = 0;

    while (true) {
      const required = this.getXpRequiredForLevel(level);
      if (accumulated + required > totalXp) {
        const currentXp = totalXp - accumulated;
        return {
          level,
          currentXp,
          xpToNextLevel: required
        };
      }
      accumulated += required;
      level++;
    }
  }

  /**
   * Server-assigned base XP rewards by difficulty.
   */
  calculateQuestXP(difficulty: QuestDifficulty): number {
    switch (difficulty) {
      case 'trivial': return 20;
      case 'easy': return 40;
      case 'medium': return 70;
      case 'hard': return 120;
      case 'epic': return 250;
      default: return 70;
    }
  }

  /**
   * Server-assigned Gold rewards by difficulty.
   */
  calculateGoldReward(difficulty: QuestDifficulty): number {
    switch (difficulty) {
      case 'trivial': return 10;
      case 'easy': return 20;
      case 'medium': return 35;
      case 'hard': return 60;
      case 'epic': return 120;
      default: return 35;
    }
  }

  /**
   * Attribute points gain by difficulty.
   */
  calculateAttributeGain(difficulty: QuestDifficulty): number {
    switch (difficulty) {
      case 'trivial': return 5;
      case 'easy': return 10;
      case 'medium': return 18;
      case 'hard': return 30;
      case 'epic': return 60;
      default: return 18;
    }
  }

  /**
   * Deterministic category to primary attribute mapping.
   */
  mapCategoryToAttribute(category: QuestCategory): AttributeKey {
    switch (category) {
      case 'coding':
      case 'study':
      case 'work':
        return 'intellect';
      case 'fitness':
        return 'strength';
      case 'health':
        return 'vitality';
      case 'reading':
      case 'personal':
        return 'discipline';
      case 'career':
      case 'other':
      default:
        return 'charisma';
    }
  }

  /**
   * Generate progression overview for frontend consumption.
   */
  async getProgressionOverview(userId: string): Promise<ProgressionOverview> {
    const sheet = await rpgStore.getCharacterSheet(userId);
    const xpForNext = sheet.xpToNextLevel > 0 ? sheet.xpToNextLevel : 100;
    const percentage = Math.min(100, parseFloat(((sheet.currentXp / xpForNext) * 100).toFixed(1)));

    const milestones = [
      { level: 1, title: 'Novice Wanderer', xpRequired: 100, perks: ['Basic Quest Deck', 'Daily Streak Tracking'] },
      { level: 2, title: 'Apprentice Seeker', xpRequired: this.getCumulativeXpForLevel(2), perks: ['Attribute Breakdown', 'Subtask Decomposition'] },
      { level: 3, title: 'Disciplined Initiate', xpRequired: this.getCumulativeXpForLevel(3), perks: ['Economy Bazaar Unlocked', 'Custom Reminders'] },
      { level: 4, title: 'Questing Scholar', xpRequired: this.getCumulativeXpForLevel(4), perks: ['Equipment Slots', 'Daily Mission Multipliers'] },
      { level: 5, title: 'Tactical Adventurer', xpRequired: this.getCumulativeXpForLevel(5), perks: ['Quest Chains', 'Synergy Radar Graphs'] },
      { level: 10, title: 'Veteran Pioneer', xpRequired: this.getCumulativeXpForLevel(10), perks: ['Custom Badges', 'Title Grants', 'Streak Aegis'] },
      { level: 15, title: 'Ascended Grandmaster', xpRequired: this.getCumulativeXpForLevel(15), perks: ['Mastery Aura', 'Infinite Compounding Multiplier'] }
    ];

    const history = await this.getWeeklyActivity(userId);

    return {
      currentLevel: sheet.level,
      currentXp: sheet.currentXp,
      xpToNextLevel: sheet.xpToNextLevel,
      totalXp: sheet.totalXp,
      percentage,
      attributePoints: sheet.attributePoints,
      milestones,
      history
    };
  }

  /**
   * Derives 7-day rolling or week cadence activity based on local timezone.
   */
  async getWeeklyActivity(userId: string, timezone?: string): Promise<{ day: string; date: string; xp: number; questsCompleted: number; active: boolean }[]> {
    const weeklyData = await activityAnalyticsService.getWeeklyCadence(userId, timezone);
    return weeklyData.weeklyActivity;
  }

  /**
   * Real progress intelligence telemetry meeting Requirement 31.
   * Brand new user returns all zeros.
   */
  async getProgress(userId: string, timezone?: string): Promise<ProgressTelemetry> {
    const telemetry = await activityAnalyticsService.getProgressTelemetry(userId, timezone);
    return {
      weeklyXP: telemetry.weeklyXP,
      monthlyXP: telemetry.monthlyXP,
      dailyQuestCounts: telemetry.dailyQuestCounts,
      dailyXP: telemetry.dailyXP,
      activeDays: telemetry.activeDays,
      completionRate: telemetry.completionRate,
      currentStreak: telemetry.currentStreak,
      bestStreak: telemetry.bestStreak,
      attributeDistribution: telemetry.attributeDistribution,
      recentActivity: telemetry.recentCompletions
    };
  }
}

export const progressionService = new ProgressionService();
