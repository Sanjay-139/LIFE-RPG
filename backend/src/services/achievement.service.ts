import { rpgStore } from '../database/rpgStore.js';
import { Achievement } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class AchievementService {
  async getAchievements(userId: string): Promise<Achievement[]> {
    return rpgStore.getAchievements(userId);
  }

  async claimAchievement(userId: string, achievementId: string): Promise<Achievement> {
    const achs = await rpgStore.getAchievements(userId);
    const target = achs.find(a => a.id === achievementId);

    if (!target) {
      throw new AppError('Achievement not found', 404, 'NOT_FOUND');
    }
    if (!target.unlocked) {
      throw new AppError('Achievement conditions have not been satisfied yet', 400, 'NOT_UNLOCKED');
    }
    if (target.claimed) {
      throw new AppError('Achievement reward already claimed', 409, 'ALREADY_CLAIMED');
    }

    const claimedAch = await rpgStore.claimAchievement(userId, achievementId);
    const sheet = await rpgStore.getCharacterSheet(userId);

    // Credit XP and Gold rewards
    const newTotalXp = sheet.totalXp + target.xpReward;
    const newCurrentXp = sheet.currentXp + target.xpReward;
    const newGold = sheet.gold + target.goldReward;

    await rpgStore.updateCharacterSheet(userId, {
      totalXp: newTotalXp,
      currentXp: newCurrentXp,
      gold: newGold
    });

    await rpgStore.addGoldTransaction({
      id: `gt-${Date.now()}`,
      userId,
      amount: target.goldReward,
      transactionType: 'ACHIEVEMENT_REWARD',
      sourceId: achievementId,
      balanceAfter: newGold,
      description: `Achievement Reward: ${target.title}`,
      createdAt: new Date().toISOString()
    });

    await rpgStore.addXpHistory({
      id: `xp-${Date.now()}`,
      userId,
      sourceType: 'ACHIEVEMENT',
      sourceId: achievementId,
      xpAmount: target.xpReward,
      balanceAfter: newTotalXp,
      description: `Achievement Reward: ${target.title}`,
      createdAt: new Date().toISOString()
    });

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'ACHIEVEMENT_UNLOCKED',
      title: `🏆 Claimed Achievement: ${target.title}`,
      description: `Awarded +${target.xpReward} XP and +${target.goldReward} Gold.`,
      xpEarned: target.xpReward,
      goldEarned: target.goldReward,
      createdAt: new Date().toISOString()
    });

    return claimedAch;
  }

  /**
   * Evaluates progression-triggered achievements on quest completion.
   */
  async evaluateAchievementsOnQuestComplete(
    userId: string,
    params: { completedCount: number; category: string; xpEarned: number; streak: number; level: number }
  ): Promise<string[]> {
    const unlockedTitles: string[] = [];

    // 1. FIRST QUEST
    if (params.completedCount >= 1) {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-1', 1);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 2. 7 DAY STREAK
    if (params.streak >= 7) {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-2', 7);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 3. 30 DAY STREAK
    if (params.streak >= 30) {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-3', 30);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 4. CODE WARRIOR
    if (params.category === 'coding') {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-4', params.xpEarned);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 5. KNOWLEDGE SEEKER
    if (params.category === 'reading' || params.category === 'study') {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-5', 1);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 6. FITNESS WARRIOR
    if (params.category === 'fitness' || params.category === 'health') {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-6', 1);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    // 7. LEVEL 10 REACHED
    if (params.level >= 10) {
      const res = await rpgStore.updateAchievementProgress(userId, 'ach-7', 10);
      if (res.unlocked) {
        unlockedTitles.push(res.achievement.title);
        await this.notifyUnlock(userId, res.achievement);
      }
    }

    return unlockedTitles;
  }

  private async notifyUnlock(userId: string, ach: Achievement) {
    await rpgStore.logActivity({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      actionType: 'ACHIEVEMENT_UNLOCKED',
      title: `🏆 Achievement Unlocked: ${ach.title}`,
      description: ach.description,
      xpEarned: ach.xpReward,
      goldEarned: ach.goldReward,
      createdAt: new Date().toISOString()
    });

    await rpgStore.addNotification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      title: `🏆 Milestone Unlocked: ${ach.title}`,
      message: `${ach.description} Head to Hall of Milestones to claim +${ach.xpReward} XP & +${ach.goldReward} Gold!`,
      type: 'achievement_unlocked',
      rewardXp: ach.xpReward,
      rewardGold: ach.goldReward,
      read: false,
      timestamp: new Date().toISOString()
    });
  }
}

export const achievementService = new AchievementService();
