import { rpgStore } from '../database/rpgStore.js';
import { QuestCompletion, CharacterSheet } from '../types/index.js';

export interface WeeklyActivityDay {
  day: string;
  date: string;
  xp: number;
  questsCompleted: number;
  completedQuests: number;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
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
  lastActivityDate: string | null;
  freezesRemaining: number;
  weeklyActivity: WeeklyActivityDay[];
  dailyQuestCounts: number[];
  weeklyCompletedQuestCount: number;
  activeDays: number;
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

export interface ProgressTelemetry {
  characterLevel: number;
  currentXp: number;
  totalXp: number;
  gold: number;
  currentStreak: number;
  bestStreak: number;
  weeklyXP: number;
  monthlyXP: number;
  activeDays: number;
  completionRate: number;
  dailyQuestCounts: number[];
  dailyXP: number[];
  weeklyDays: WeeklyActivityDay[];
  attributeDistribution: Record<string, { value: number; recentGain: number; level: number }>;
  recentCompletions: any[];
}

export class ActivityAnalyticsService {
  /**
   * Resolves the effective IANA timezone for an authenticated user.
   * Priority:
   * 1. User profile stored timezone (if valid and not default 'UTC')
   * 2. Client request header (X-Timezone)
   * 3. User profile stored timezone (even if 'UTC')
   * 4. Server environment fallback
   */
  async resolveTimezone(userId: string, requestTimezone?: string): Promise<string> {
    const profile = await rpgStore.getProfile(userId);
    const storedTz = profile?.timezone;

    // 1. If user has an explicit non-UTC timezone configured
    if (storedTz && storedTz !== 'UTC' && this.isValidTimezone(storedTz)) {
      return storedTz;
    }

    // 2. Client request header (e.g. 'Asia/Kolkata')
    if (requestTimezone && this.isValidTimezone(requestTimezone.trim())) {
      const clientTz = requestTimezone.trim();
      // If stored timezone was never customized, adopt client timezone
      if (!storedTz || storedTz === 'UTC') {
        try {
          await rpgStore.updateProfile(userId, { timezone: clientTz });
        } catch {
          // ignore background update error
        }
      }
      return clientTz;
    }

    // 3. Stored timezone fallback
    if (storedTz && this.isValidTimezone(storedTz)) {
      return storedTz;
    }

    // 4. Default fallback
    return process.env.APP_TIMEZONE || 'UTC';
  }

  isValidTimezone(tz: string): boolean {
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely formats any Date or ISO timestamp into YYYY-MM-DD in the target timezone.
   */
  toUserLocalDate(timezone: string, dateInput: string | Date = new Date()): string {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(d);
    } catch {
      return d.toISOString().split('T')[0];
    }
  }

  getTodayUserLocalDate(timezone: string): string {
    return this.toUserLocalDate(timezone, new Date());
  }

  getYesterdayUserLocalDate(timezone: string): string {
    const todayStr = this.getTodayUserLocalDate(timezone);
    const [y, m, d] = todayStr.split('-').map(Number);
    const yesterdayUtc = new Date(Date.UTC(y, m - 1, d - 1));
    return yesterdayUtc.toISOString().split('T')[0];
  }

  /**
   * Checks whether dateStrB is exactly 1 calendar day after dateStrA.
   */
  isNextCalendarDay(dateStrA: string, dateStrB: string): boolean {
    const [yA, mA, dA] = dateStrA.split('-').map(Number);
    const [yB, mB, dB] = dateStrB.split('-').map(Number);
    const utcA = Date.UTC(yA, mA - 1, dA);
    const utcB = Date.UTC(yB, mB - 1, dB);
    const diffDays = Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Core Authoritative Streak Calculator
   * Determines consecutive active calendar dates from actual qualifying quest completions.
   * Multiple quests on the same date count as 1 active day.
   */
  calculateStreaksFromCompletions(
    completions: QuestCompletion[],
    timezone: string
  ): { currentStreak: number; bestStreak: number; lastActivityDate: string | null; activeDates: string[] } {
    if (!completions || completions.length === 0) {
      return { currentStreak: 0, bestStreak: 0, lastActivityDate: null, activeDates: [] };
    }

    // Map each completion to user's local calendar date YYYY-MM-DD
    const dateSet = new Set<string>();
    for (const c of completions) {
      const localDate = this.toUserLocalDate(timezone, c.completedAt);
      dateSet.add(localDate);
    }

    // Sorted list of unique active calendar dates
    const activeDates = Array.from(dateSet).sort();
    if (activeDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, lastActivityDate: null, activeDates: [] };
    }

    // Calculate maximum historical consecutive active days (bestStreak)
    let maxStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < activeDates.length; i++) {
      if (this.isNextCalendarDay(activeDates[i - 1], activeDates[i])) {
        currentRun++;
      } else {
        maxStreak = Math.max(maxStreak, currentRun);
        currentRun = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentRun);

    // Calculate current unbroken streak
    const todayStr = this.getTodayUserLocalDate(timezone);
    const yesterdayStr = this.getYesterdayUserLocalDate(timezone);
    const lastActiveDate = activeDates[activeDates.length - 1];

    let currentStreak = 0;

    if (lastActiveDate === todayStr || lastActiveDate === yesterdayStr) {
      // Walk backwards from lastActiveDate to count unbroken consecutive chain
      currentStreak = 1;
      for (let i = activeDates.length - 1; i > 0; i--) {
        if (this.isNextCalendarDay(activeDates[i - 1], activeDates[i])) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // Missed yesterday and today -> streak reset to 0
      currentStreak = 0;
    }

    return {
      currentStreak,
      bestStreak: maxStreak,
      lastActivityDate: lastActiveDate,
      activeDates
    };
  }

  /**
   * Authoritative Weekly Cadence (Monday to Sunday)
   */
  async getWeeklyCadence(userId: string, requestTimezone?: string): Promise<StreakData> {
    const timezone = await this.resolveTimezone(userId, requestTimezone);
    const completions = await rpgStore.getQuestCompletions(userId);
    const sheet = await rpgStore.getCharacterSheet(userId);

    const todayStr = this.getTodayUserLocalDate(timezone);
    const [year, month, day] = todayStr.split('-').map(Number);

    // Monday-Sunday anchoring in UTC calendar space
    const localTodayUtc = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = localTodayUtc.getUTCDay(); // 0 = Sun, 1 = Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayUtc = new Date(Date.UTC(year, month - 1, day + mondayOffset));

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyActivity: WeeklyActivityDay[] = [];

    // Group user completions by local date
    const completionsByDate = new Map<string, QuestCompletion[]>();
    for (const c of completions) {
      const d = this.toUserLocalDate(timezone, c.completedAt);
      const list = completionsByDate.get(d) || [];
      list.push(c);
      completionsByDate.set(d, list);
    }

    for (let i = 0; i < 7; i++) {
      const dUtc = new Date(Date.UTC(mondayUtc.getUTCFullYear(), mondayUtc.getUTCMonth(), mondayUtc.getUTCDate() + i));
      const dateStr = dUtc.toISOString().split('T')[0];
      const dayName = dayLabels[i];

      const dayCompletions = completionsByDate.get(dateStr) || [];
      const questsCompleted = dayCompletions.length;
      const xp = dayCompletions.reduce((sum, c) => sum + (c.xpEarned || 0), 0);
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const active = questsCompleted > 0;

      weeklyActivity.push({
        day: dayName,
        date: dateStr,
        xp,
        questsCompleted,
        completedQuests: questsCompleted,
        active,
        isToday,
        isFuture
      });
    }

    const { currentStreak, bestStreak, lastActivityDate } = this.calculateStreaksFromCompletions(completions, timezone);
    const preservedBestStreak = Math.max(sheet.bestStreak || 0, bestStreak);

    const dailyQuestCounts = weeklyActivity.map(w => w.questsCompleted);
    const weeklyCompletedQuestCount = weeklyActivity.reduce((sum, w) => sum + w.questsCompleted, 0);
    const activeDays = weeklyActivity.filter(w => w.active).length;

    const streakMilestones: StreakMilestone[] = [
      { days: 3, title: 'Flame Spark', reward: '+50 XP', reached: preservedBestStreak >= 3 },
      { days: 7, title: 'Weekly Champion', reward: '+150 XP • +50 Gold', reached: preservedBestStreak >= 7 },
      { days: 14, title: 'Fortnight Fortitude', reward: '+250 XP • Badge Unlocked', reached: preservedBestStreak >= 14 },
      { days: 21, title: 'Habit Formation', reward: '+350 XP • +100 Gold', reached: preservedBestStreak >= 21 },
      { days: 30, title: 'Iron Will Legend', reward: '+600 XP • Exclusive Title', reached: preservedBestStreak >= 30 },
      { days: 60, title: 'Master of Flow', reward: '+1,500 XP • Vault Theme', reached: preservedBestStreak >= 60 }
    ];

    return {
      currentStreak,
      bestStreak: preservedBestStreak,
      lastActivityDate,
      freezesRemaining: 2,
      weeklyActivity,
      dailyQuestCounts,
      weeklyCompletedQuestCount,
      activeDays,
      streakMilestones
    };
  }

  /**
   * Authoritative Monthly Activity Matrix
   * Generates calendar days 1 to totalDays for current month.
   * Checkmark (active/completed) ONLY if completedQuests > 0.
   */
  async getMonthlyActivity(userId: string, requestTimezone?: string): Promise<MonthlyActivityData> {
    const timezone = await this.resolveTimezone(userId, requestTimezone);
    const completions = await rpgStore.getQuestCompletions(userId);

    const todayStr = this.getTodayUserLocalDate(timezone);
    const [year, month, todayDate] = todayStr.split('-').map(Number);

    // Total days in current month
    const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group completions by local date
    const completionsByDate = new Map<string, QuestCompletion[]>();
    for (const c of completions) {
      const d = this.toUserLocalDate(timezone, c.completedAt);
      const list = completionsByDate.get(d) || [];
      list.push(c);
      completionsByDate.set(d, list);
    }

    const days: MonthlyActivityDay[] = [];
    let activeDays = 0;

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateUtc = new Date(Date.UTC(year, month - 1, d));
      const weekday = dayNames[dateUtc.getUTCDay()];

      const dayCompletions = completionsByDate.get(dateStr) || [];
      const completedQuests = dayCompletions.length;
      const xpEarned = dayCompletions.reduce((sum, c) => sum + (c.xpEarned || 0), 0);
      const active = completedQuests > 0;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      if (active) {
        activeDays++;
      }

      days.push({
        day: d,
        date: dateStr,
        weekday,
        completedQuests,
        questsCompleted: completedQuests,
        xpEarned,
        active,
        completed: active,
        isToday,
        isFuture
      });
    }

    const elapsedDays = Math.max(1, todayDate);
    const consistencyRate = Math.round((activeDays / elapsedDays) * 100);
    const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

    return {
      month: monthName,
      year,
      activeDays,
      elapsedDays,
      totalDays,
      consistencyRate,
      days
    };
  }

  /**
   * Real Progress Telemetry
   * Shares the identical weekly activity and streak logic.
   */
  async getProgressTelemetry(userId: string, requestTimezone?: string): Promise<ProgressTelemetry> {
    const timezone = await this.resolveTimezone(userId, requestTimezone);
    const sheet = await rpgStore.getCharacterSheet(userId);
    const completions = await rpgStore.getQuestCompletions(userId);
    const weeklyData = await this.getWeeklyCadence(userId, timezone);

    const todayStr = this.getTodayUserLocalDate(timezone);
    const [year, month] = todayStr.split('-').map(Number);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    const monthlyCompletions = completions.filter(c => {
      const cDate = this.toUserLocalDate(timezone, c.completedAt);
      return cDate.startsWith(monthPrefix);
    });
    const monthlyXP = monthlyCompletions.reduce((sum, c) => sum + (c.xpEarned || 0), 0);

    const elapsedDaysInWeek = Math.max(1, weeklyData.weeklyActivity.findIndex(w => w.isToday) + 1);
    const completionRate = Math.round((weeklyData.activeDays / elapsedDaysInWeek) * 100);

    const attributeDistribution: Record<string, { value: number; recentGain: number; level: number }> = {};
    for (const [key, stat] of Object.entries(sheet.attributes)) {
      attributeDistribution[key] = {
        value: stat.value,
        recentGain: stat.recentGain,
        level: stat.level
      };
    }

    const recentLogs = await rpgStore.getActivityLogs(userId, 5);

    return {
      characterLevel: sheet.level,
      currentXp: sheet.currentXp,
      totalXp: sheet.totalXp,
      gold: sheet.gold,
      currentStreak: weeklyData.currentStreak,
      bestStreak: weeklyData.bestStreak,
      weeklyXP: weeklyData.weeklyActivity.reduce((sum, w) => sum + w.xp, 0),
      monthlyXP,
      activeDays: weeklyData.activeDays,
      completionRate,
      dailyQuestCounts: weeklyData.dailyQuestCounts,
      dailyXP: weeklyData.weeklyActivity.map(w => w.xp),
      weeklyDays: weeklyData.weeklyActivity,
      attributeDistribution,
      recentCompletions: recentLogs
    };
  }

  /**
   * Invoked upon quest completion to recalculate and persist streak telemetry.
   */
  async recordActivity(userId: string, requestTimezone?: string): Promise<{
    currentStreak: number;
    bestStreak: number;
    streakIncreased: boolean;
    todayQuestCount: number;
  }> {
    const timezone = await this.resolveTimezone(userId, requestTimezone);
    const completions = await rpgStore.getQuestCompletions(userId);
    const sheet = await rpgStore.getCharacterSheet(userId);

    const oldStreak = sheet.streak || 0;
    const { currentStreak, bestStreak, lastActivityDate } = this.calculateStreaksFromCompletions(completions, timezone);
    const newBestStreak = Math.max(sheet.bestStreak || 0, bestStreak);
    const streakIncreased = currentStreak > oldStreak;

    // Count completions for today
    const todayStr = this.getTodayUserLocalDate(timezone);
    const todayQuestCount = completions.filter(c => this.toUserLocalDate(timezone, c.completedAt) === todayStr).length;

    // Persist to user_profiles and character sheet
    await rpgStore.updateCharacterSheet(userId, {
      streak: currentStreak,
      bestStreak: newBestStreak
    });

    if (lastActivityDate) {
      await rpgStore.addStreakHistory({
        id: `strk-${Date.now()}`,
        userId,
        activityDate: lastActivityDate,
        streakCount: currentStreak,
        freezeUsed: false,
        createdAt: new Date().toISOString()
      });
    }

    if (streakIncreased && [3, 7, 14, 21, 30, 60].includes(currentStreak)) {
      await rpgStore.logActivity({
        id: `act-${Date.now()}`,
        userId,
        actionType: 'STREAK_INCREASED',
        title: `🔥 Streak Milestone: ${currentStreak} Days!`,
        description: `Maintained unbroken daily quest completion discipline for ${currentStreak} consecutive active days.`,
        createdAt: new Date().toISOString()
      });

      await rpgStore.addNotification({
        id: `notif-${Date.now()}`,
        userId,
        title: '🔥 Streak Milestone Unlocked!',
        message: `Incredible momentum! You have reached a ${currentStreak}-day discipline streak.`,
        type: 'streak_increased',
        read: false,
        timestamp: new Date().toISOString()
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ActivityAnalytics] User: ${userId} | Timezone: ${timezone} | Local Date: ${todayStr} | Today Quests: ${todayQuestCount} | Streak: ${currentStreak} (Best: ${newBestStreak})`);
    }

    return {
      currentStreak,
      bestStreak: newBestStreak,
      streakIncreased,
      todayQuestCount
    };
  }
}

export const activityAnalyticsService = new ActivityAnalyticsService();
