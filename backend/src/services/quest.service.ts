import { rpgStore } from '../database/rpgStore.js';
import { Quest, AttributeKey, QuestCategory, QuestDifficulty } from '../types/index.js';
import { progressionService } from './progression.service.js';
import { streakService } from './streak.service.js';
import { achievementService } from './achievement.service.js';
import { AppError } from '../middleware/error.middleware.js';

export interface QuestCompletionResult {
  quest: Quest;
  xpEarned: number;
  goldEarned: number;
  attributeGained: {
    attribute: AttributeKey;
    amount: number;
  };
  streak: number;
  todayQuestCount: number;
  levelUp: boolean;
  newLevel?: number;
  unlockedAchievements?: string[];
}

export class QuestService {
  async getQuests(userId: string, filters?: { status?: string; category?: string; difficulty?: string }): Promise<Quest[]> {
    return rpgStore.getQuests(userId, filters);
  }

  async getQuestById(userId: string, questId: string): Promise<Quest> {
    const quest = await rpgStore.getQuestById(userId, questId);
    if (!quest) {
      throw new AppError('Quest not found or access unauthorized', 404, 'NOT_FOUND');
    }
    return quest;
  }

  async createQuest(userId: string, data: {
    title: string;
    description?: string;
    category?: QuestCategory;
    difficulty?: QuestDifficulty;
    estimatedDuration?: number;
    dueDate?: string;
    targetAttribute?: AttributeKey;
    repeatSchedule?: 'none' | 'daily' | 'weekly' | 'weekdays';
    subtasks?: { id: string; title: string; completed: boolean }[];
  }): Promise<Quest> {
    if (!data.title || data.title.trim().length === 0) {
      throw new AppError('Quest title is required', 400, 'VALIDATION_ERROR');
    }

    const category = data.category || 'other';
    const difficulty = data.difficulty || 'medium';
    const targetAttribute = data.targetAttribute || progressionService.mapCategoryToAttribute(category);

    // Server-authoritative reward calculation
    const xpReward = progressionService.calculateQuestXP(difficulty);
    const goldReward = progressionService.calculateGoldReward(difficulty);

    const quest = await rpgStore.createQuest(userId, {
      title: data.title.trim(),
      description: data.description || '',
      category,
      difficulty,
      estimatedDuration: data.estimatedDuration || 30,
      dueDate: data.dueDate || new Date(Date.now() + 86400000).toISOString(),
      xpReward,
      goldReward,
      targetAttribute,
      status: 'not_started',
      repeatSchedule: data.repeatSchedule || 'none',
      progress: 0,
      subtasks: data.subtasks || []
    });

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'QUEST_CREATED',
      title: `⚔️ Quest Commissioned: ${quest.title}`,
      description: `Targeting +${xpReward} XP, +${goldReward} Gold in ${targetAttribute.toUpperCase()}.`,
      createdAt: new Date().toISOString()
    });

    return quest;
  }

  async updateQuest(userId: string, questId: string, updates: Partial<Quest>): Promise<Quest> {
    const existing = await this.getQuestById(userId, questId);
    if (existing.status === 'completed') {
      throw new AppError('Cannot modify an already completed quest', 400, 'CANNOT_MODIFY_COMPLETED');
    }

    // Protect server-assigned progression rewards from client tampering
    const safeUpdates: Partial<Quest> = {
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      description: updates.description !== undefined ? updates.description : existing.description,
      category: updates.category !== undefined ? updates.category : existing.category,
      estimatedDuration: updates.estimatedDuration !== undefined ? updates.estimatedDuration : existing.estimatedDuration,
      dueDate: updates.dueDate !== undefined ? updates.dueDate : existing.dueDate,
      repeatSchedule: updates.repeatSchedule !== undefined ? updates.repeatSchedule : existing.repeatSchedule,
      progress: updates.progress !== undefined ? updates.progress : existing.progress,
      subtasks: updates.subtasks !== undefined ? updates.subtasks : existing.subtasks
    };

    if (updates.difficulty && updates.difficulty !== existing.difficulty) {
      safeUpdates.difficulty = updates.difficulty;
      safeUpdates.xpReward = progressionService.calculateQuestXP(updates.difficulty);
      safeUpdates.goldReward = progressionService.calculateGoldReward(updates.difficulty);
    }

    return rpgStore.updateQuest(userId, questId, safeUpdates);
  }

  async deleteQuest(userId: string, questId: string): Promise<boolean> {
    await this.getQuestById(userId, questId);
    return rpgStore.deleteQuest(userId, questId);
  }

  /**
   * ATOMIC SERVER-AUTHORITATIVE QUEST COMPLETION TRANSACTION
   */
  async completeQuest(userId: string, questId: string, timezone?: string): Promise<QuestCompletionResult> {
    const quest = await this.getQuestById(userId, questId);

    if (quest.status === 'completed') {
      throw new AppError('Quest is already completed. Duplicate rewards prevented.', 409, 'ALREADY_COMPLETED');
    }

    // 1. Calculate server-authoritative progression values
    const xpEarned = progressionService.calculateQuestXP(quest.difficulty);
    const goldEarned = progressionService.calculateGoldReward(quest.difficulty);
    const attributeGain = progressionService.calculateAttributeGain(quest.difficulty);
    const targetAttribute = quest.targetAttribute || progressionService.mapCategoryToAttribute(quest.category);
    const now = new Date().toISOString();

    // 2. Mark quest completed in store
    const updatedQuest = await rpgStore.updateQuest(userId, questId, {
      status: 'completed',
      progress: 100,
      completedAt: now
    });

    // 3. Record historical completion log
    await rpgStore.addQuestCompletion({
      id: `qc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      questId,
      completedAt: now,
      xpEarned,
      goldEarned,
      attributeName: targetAttribute,
      attributeGain,
      completionSource: 'manual_verification'
    });

    // 4. Update Character Progression (XP, Level, Gold)
    const currentSheet = await rpgStore.getCharacterSheet(userId);
    const oldLevel = currentSheet.level;
    const newTotalXp = currentSheet.totalXp + xpEarned;
    const levelCalc = progressionService.calculateLevelFromTotalXp(newTotalXp);

    const levelUp = levelCalc.level > oldLevel;
    const newLevel = levelCalc.level;
    const attributePointsAdded = levelUp ? (newLevel - oldLevel) : 0;

    await rpgStore.updateCharacterSheet(userId, {
      level: newLevel,
      currentXp: levelCalc.currentXp,
      totalXp: newTotalXp,
      gold: currentSheet.gold + goldEarned,
      attributePoints: currentSheet.attributePoints + attributePointsAdded
    });

    // 5. Update Attribute Stat
    await rpgStore.increaseAttribute(userId, targetAttribute, attributeGain);

    // 6. Record XP History
    await rpgStore.addXpHistory({
      id: `xp-${Date.now()}`,
      userId,
      sourceType: 'QUEST_COMPLETION',
      sourceId: questId,
      xpAmount: xpEarned,
      balanceAfter: newTotalXp,
      description: `Completed Quest: ${quest.title}`,
      createdAt: now
    });

    // 7. Record Gold Transaction
    await rpgStore.addGoldTransaction({
      id: `gt-${Date.now()}`,
      userId,
      amount: goldEarned,
      transactionType: 'QUEST_REWARD',
      sourceId: questId,
      balanceAfter: currentSheet.gold + goldEarned,
      description: `Reward for: ${quest.title}`,
      createdAt: now
    });

    // 8. Consecutive Day Streak Calculation
    const streakResult = await streakService.recordActivity(userId, timezone);

    // 9. If Leveled Up, Record Level History and Notification
    if (levelUp) {
      await rpgStore.addLevelHistory({
        id: `lvl-${Date.now()}`,
        userId,
        oldLevel,
        newLevel,
        xpAtLevelUp: newTotalXp,
        unlockedFeatures: ['+1 Attribute Point', 'Higher Tier Perks'],
        createdAt: now
      });

      await rpgStore.logActivity({
        id: `act-${Date.now()}-lvl`,
        userId,
        actionType: 'LEVEL_UP',
        title: `⭐ LEVEL UP! Ascended to Level ${newLevel}`,
        description: `Threshold conquered! Gained +${attributePointsAdded} Attribute Allocation Point.`,
        createdAt: now
      });

      await rpgStore.addNotification({
        id: `notif-${Date.now()}-lvl`,
        userId,
        title: `⭐ Level Up: Level ${newLevel}!`,
        message: `Congratulations! You have reached Level ${newLevel}. Allocate your attribute points in the Character Sheet.`,
        type: 'level_up',
        read: false,
        timestamp: now
      });
    }

    // 10. Log Activity for Completion
    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'QUEST_COMPLETED',
      title: `✅ Completed Quest: ${quest.title}`,
      description: `Earned +${xpEarned} XP, +${goldEarned} Gold, and +${attributeGain} ${targetAttribute.toUpperCase()}.`,
      xpEarned,
      goldEarned,
      createdAt: now
    });

    // 11. Create Completion Notification
    await rpgStore.addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: `Quest Completed: ${quest.title}`,
      message: `Earned +${xpEarned} XP and +${goldEarned} Gold. Streak is now ${streakResult.currentStreak} days!`,
      type: 'quest_completed',
      rewardXp: xpEarned,
      rewardGold: goldEarned,
      read: false,
      timestamp: now
    });

    // 12. Evaluate Milestones & Achievements
    const completedCount = (await rpgStore.getQuestCompletions(userId)).length;
    const unlockedAchievements = await achievementService.evaluateAchievementsOnQuestComplete(userId, {
      completedCount,
      category: quest.category,
      xpEarned,
      streak: streakResult.currentStreak,
      level: newLevel
    });

    return {
      quest: updatedQuest,
      xpEarned,
      goldEarned,
      attributeGained: {
        attribute: targetAttribute,
        amount: attributeGain
      },
      streak: streakResult.currentStreak,
      todayQuestCount: streakResult.todayQuestCount,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      unlockedAchievements
    };
  }

  async getCompletionHistory(userId: string) {
    return rpgStore.getQuestCompletions(userId);
  }
}

export const questService = new QuestService();
