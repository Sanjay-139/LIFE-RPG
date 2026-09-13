import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CharacterSheet,
  Quest,
  RewardItem,
  AttributeKey,
  DailyMission,
  Achievement,
} from '../types';
import { characterService } from '../services/character';
import { questService } from '../services/quests';
import { rewardService } from '../services/rewards';
import { streakService, StreakData, MonthlyActivityData } from '../services/streaks';
import { achievementService } from '../services/achievements';
import { inventoryService } from '../services/inventory';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface LevelUpCelebration {
  previousLevel: number;
  newLevel: number;
  attributePointsGained: number;
  newTitle?: string;
  unlockedPerks: string[];
}

export const EMPTY_CHARACTER: CharacterSheet = {
  id: '',
  userId: '',
  name: 'Adventurer',
  title: 'Apprentice Novice',
  rank: 'Novice Initiate',
  avatar: 'avatar-01',
  level: 0,
  currentXp: 0,
  xpToNextLevel: 100,
  totalXp: 0,
  gold: 100,
  streak: 0,
  bestStreak: 0,
  completedQuestsCount: 0,
  attributePoints: 0,
  attributes: {
    strength: {
      key: 'strength',
      name: 'Strength',
      level: 1,
      value: 15,
      maxValue: 100,
      recentGain: 0,
      icon: 'fitness_center',
      colorClass: 'stat-strength',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-600',
      borderClass: 'border-amber-500/30',
      description: 'Physical endurance, resistance training, strength conditioning.',
      contributingCategories: ['fitness', 'health'],
    },
    intellect: {
      key: 'intellect',
      name: 'Intellect',
      level: 1,
      value: 20,
      maxValue: 100,
      recentGain: 0,
      icon: 'psychology',
      colorClass: 'stat-intellect',
      bgClass: 'bg-violet-500/10',
      textClass: 'text-violet-600',
      borderClass: 'border-violet-500/30',
      description: 'Problem-solving, algorithmic mastery, technical architectures.',
      contributingCategories: ['coding', 'study'],
    },
    vitality: {
      key: 'vitality',
      name: 'Vitality',
      level: 1,
      value: 15,
      maxValue: 100,
      recentGain: 0,
      icon: 'spa',
      colorClass: 'stat-vitality',
      bgClass: 'bg-sky-500/10',
      textClass: 'text-sky-600',
      borderClass: 'border-sky-500/30',
      description: 'Cardiovascular uptime, hydration, recovery, balanced sleep.',
      contributingCategories: ['fitness', 'health'],
    },
    discipline: {
      key: 'discipline',
      name: 'Discipline',
      level: 1,
      value: 25,
      maxValue: 100,
      recentGain: 0,
      icon: 'hourglass_top',
      colorClass: 'stat-discipline',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600',
      borderClass: 'border-emerald-500/30',
      description: 'Distraction-free deep work blocks, consistency, meditation.',
      contributingCategories: ['reading', 'personal', 'study'],
    },
    charisma: {
      key: 'charisma',
      name: 'Charisma',
      level: 1,
      value: 10,
      maxValue: 100,
      recentGain: 0,
      icon: 'palette',
      colorClass: 'stat-charisma',
      bgClass: 'bg-rose-500/10',
      textClass: 'text-rose-600',
      borderClass: 'border-rose-500/30',
      description: 'Communication, team leadership, creative showcases, design.',
      contributingCategories: ['career', 'other'],
    },
  },
  equipment: {},
};

interface GameContextType {
  character: CharacterSheet;
  quests: Quest[];
  rewards: RewardItem[];
  achievements: Achievement[];
  streakData: StreakData | null;
  monthlyActivity: MonthlyActivityData | null;
  dailyMissions: DailyMission[];
  unallocatedPoints: number;
  levelUpCelebration: LevelUpCelebration | null;
  isLoadingGame: boolean;
  dismissLevelUp: () => void;
  completeQuest: (id: string) => Promise<boolean>;
  createQuest: (questData: Omit<Quest, 'id' | 'status' | 'progress'>) => Promise<boolean>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<boolean>;
  deleteQuest: (id: string) => Promise<boolean>;
  toggleDailyMission: (id: string) => void;
  purchaseReward: (id: string) => Promise<boolean>;
  equipItem: (id: string) => Promise<boolean>;
  unequipItem: (id: string) => Promise<boolean>;
  claimAchievement: (id: string) => Promise<boolean>;
  allocateAttributePoint: (attribute: AttributeKey) => Promise<boolean>;
  refreshGameData: () => Promise<void>;
  refreshStreakData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotifications();

  const [character, setCharacter] = useState<CharacterSheet>(EMPTY_CHARACTER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivityData | null>(null);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([
    { id: 'dm-1', title: 'Complete 1 Focused Deep Work Block', category: 'study', durationMinutes: 45, completed: false, xp: 50, gold: 20 },
    { id: 'dm-2', title: 'Hydrate (2 Liters Total Intake)', category: 'health', durationMinutes: 5, completed: false, xp: 25, gold: 10 },
    { id: 'dm-3', title: 'Read 10 Pages of Technical Literature', category: 'reading', durationMinutes: 20, completed: false, xp: 40, gold: 15 },
    { id: 'dm-4', title: '30-Minute Bodyweight / Cardio Circuit', category: 'fitness', durationMinutes: 30, completed: false, xp: 60, gold: 25 },
  ]);
  const [unallocatedPoints, setUnallocatedPoints] = useState<number>(0);
  const [levelUpCelebration, setLevelUpCelebration] = useState<LevelUpCelebration | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#fea619', '#10b981', '#3525cd', '#d97706'],
      });
    } catch {
      // safe fallback
    }
  };

  // Fetch live server-authoritative data for authenticated user
  const refreshGameData = useCallback(async () => {
    if (!isAuthenticated) {
      setCharacter(EMPTY_CHARACTER);
      setQuests([]);
      setRewards([]);
      setAchievements([]);
      setStreakData(null);
      setMonthlyActivity(null);
      return;
    }

    setIsLoadingGame(true);
    try {
      const [charRes, questsRes, rewardsRes, streakRes, achRes, monthlyRes] = await Promise.all([
        characterService.getCharacter(),
        questService.getQuests(),
        rewardService.getRewards(),
        streakService.getStreaks(),
        achievementService.getAchievements(),
        streakService.getMonthlyActivity(),
      ]);

      if (charRes.success && charRes.data) {
        setCharacter(charRes.data);
        setUnallocatedPoints(charRes.data.attributePoints || 0);
      }
      if (questsRes.success && questsRes.data) {
        setQuests(questsRes.data);
      }
      if (rewardsRes.success && rewardsRes.data) {
        setRewards(rewardsRes.data);
      }
      if (streakRes.success && streakRes.data) {
        setStreakData(streakRes.data);
      }
      if (achRes.success && achRes.data) {
        setAchievements(achRes.data);
      }
      if (monthlyRes.success && monthlyRes.data) {
        setMonthlyActivity(monthlyRes.data);
      }
    } catch (err) {
      console.error('Failed to load user game data:', err);
    } finally {
      setIsLoadingGame(false);
    }
  }, [isAuthenticated]);

  const refreshStreakData = useCallback(async () => {
    try {
      const [streakRes, monthlyRes] = await Promise.all([
        streakService.getStreaks(),
        streakService.getMonthlyActivity(),
      ]);
      if (streakRes.success && streakRes.data) setStreakData(streakRes.data);
      if (monthlyRes.success && monthlyRes.data) setMonthlyActivity(monthlyRes.data);
    } catch (err) {
      console.error('Failed to refresh streak data:', err);
    }
  }, []);

  useEffect(() => {
    refreshGameData();
  }, [refreshGameData, user?.id]);

  const completeQuest = async (id: string): Promise<boolean> => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status === 'completed') return false;

    try {
      const res = await questService.completeQuest(id);
      if (res.success && res.data) {
        const result = res.data;

        // 1. Update quests board with confirmed completed quest
        setQuests((prev) =>
          prev.map((q) => (q.id === id ? result.quest : q))
        );

        // 2. Authoritatively re-fetch or apply backend character updates
        const updatedCharRes = await characterService.getCharacter();
        if (updatedCharRes.success && updatedCharRes.data) {
          setCharacter(updatedCharRes.data);
          setUnallocatedPoints(updatedCharRes.data.attributePoints || 0);
        } else {
          // Direct fallback from result payload
          setCharacter((c) => ({
            ...c,
            level: result.levelUp && result.newLevel !== undefined ? result.newLevel : c.level,
            currentXp: c.currentXp + result.xpEarned,
            totalXp: c.totalXp + result.xpEarned,
            gold: c.gold + result.goldEarned,
            streak: result.streak,
            bestStreak: Math.max(c.bestStreak, result.streak),
            completedQuestsCount: c.completedQuestsCount + 1,
          }));
        }

        // 3. Refresh streaks & achievements & monthly activity concurrently
        const [streakRes, achRes, monthlyRes] = await Promise.all([
          streakService.getStreaks(),
          achievementService.getAchievements(),
          streakService.getMonthlyActivity(),
        ]);
        if (streakRes.success && streakRes.data) setStreakData(streakRes.data);
        if (achRes.success && achRes.data) setAchievements(achRes.data);
        if (monthlyRes.success && monthlyRes.data) setMonthlyActivity(monthlyRes.data);

        // 4. Handle Level-Up Celebration
        if (result.levelUp && result.newLevel) {
          setLevelUpCelebration({
            previousLevel: character.level,
            newLevel: result.newLevel,
            attributePointsGained: 5,
            newTitle: result.newLevel >= 15 ? 'Master of Agency' : result.newLevel >= 10 ? 'Elite Pathfinder' : undefined,
            unlockedPerks: ['+5 Attribute Allocation Points', 'New Tier Equipment in Bazaar'],
          });
          triggerConfetti();
          addToast({
            type: 'level_up',
            title: 'LEVEL UP!',
            message: `Level ${character.level} → Level ${result.newLevel}! +5 Attribute Points granted.`,
          });
        } else {
          addToast({
            type: 'xp_drop',
            title: '⚔ QUEST COMPLETE!',
            message: `+${result.xpEarned} XP • +${result.goldEarned} Gold • Streak: ${result.streak} 🔥`,
            xp: result.xpEarned,
            gold: result.goldEarned,
            attribute: quest.targetAttribute,
          });
        }

        // 5. Celebration for unlocked achievements
        if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
          result.unlockedAchievements.forEach((achTitle) => {
            addToast({
              type: 'achievement_unlocked',
              title: '🏆 ACHIEVEMENT UNLOCKED!',
              message: `You earned "${achTitle}". Claim your reward in Milestones!`,
            });
          });
        }

        return true;
      } else {
        addToast({
          type: 'error',
          title: 'Could Not Complete Quest',
          message: res.error?.message || 'Server rejected completion request.',
        });
        return false;
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Connection Failure',
        message: 'Could not connect to LIFE RPG server.',
      });
      return false;
    }
  };

  const createQuest = async (
    questData: Omit<Quest, 'id' | 'status' | 'progress'>
  ): Promise<boolean> => {
    try {
      const res = await questService.createQuest(questData);
      if (res.success && res.data) {
        setQuests((prev) => [res.data, ...prev]);
        addToast({
          type: 'success',
          title: 'Quest Commissioned!',
          message: `"${questData.title}" is now active on your Quest Board.`,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateQuest = async (id: string, updates: Partial<Quest>): Promise<boolean> => {
    try {
      const res = await questService.updateQuest(id, updates);
      if (res.success && res.data) {
        setQuests((prev) => prev.map((q) => (q.id === id ? res.data : q)));
        addToast({
          type: 'success',
          title: 'Quest Updated',
          message: 'Changes saved successfully.',
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteQuest = async (id: string): Promise<boolean> => {
    try {
      const res = await questService.deleteQuest(id);
      if (res.success) {
        setQuests((prev) => prev.filter((q) => q.id !== id));
        addToast({
          type: 'info',
          title: 'Quest Abandoned',
          message: 'Quest removed from your board.',
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleDailyMission = (id: string) => {
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = !m.completed;
          if (updated) {
            setCharacter((c) => ({
              ...c,
              currentXp: c.currentXp + m.xp,
              totalXp: c.totalXp + m.xp,
              gold: c.gold + m.gold,
            }));
            addToast({
              type: 'xp_drop',
              title: 'Daily Mission Done',
              message: `+${m.xp} XP • +${m.gold} Gold`,
            });
          }
          return { ...m, completed: updated };
        }
        return m;
      })
    );
  };

  const purchaseReward = async (id: string): Promise<boolean> => {
    const item = rewards.find((r) => r.id === id);
    if (!item) return false;

    if (item.owned) {
      addToast({
        type: 'info',
        title: 'Already Owned',
        message: 'This item is already registered in your Vault.',
      });
      return false;
    }

    if (character.gold < item.price) {
      addToast({
        type: 'error',
        title: 'Insufficient Gold',
        message: `You need ${item.price - character.gold} more Gold to acquire this item.`,
      });
      return false;
    }

    try {
      const res = await rewardService.purchaseReward(id);
      if (res.success && res.data) {
        // Update character gold from backend response
        setCharacter((c) => ({ ...c, gold: res.data.remainingGold }));
        setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, owned: true } : r)));
        addToast({
          type: 'success',
          title: 'Item Acquired!',
          message: `"${item.name}" transferred to your Vault. -${item.price} Gold.`,
        });
        return true;
      } else {
        addToast({
          type: 'error',
          title: 'Purchase Failed',
          message: res.error?.message || 'Could not complete transaction.',
        });
        return false;
      }
    } catch {
      return false;
    }
  };

  const equipItem = async (id: string): Promise<boolean> => {
    try {
      const res = await inventoryService.equipItem(id);
      if (res.success && res.data) {
        setRewards((prev) =>
          prev.map((r) => {
            if (r.equipSlot === res.data.equipSlot) {
              return { ...r, equipped: r.id === id };
            }
            return r;
          })
        );
        if (res.data.equipSlot) {
          setCharacter((c) => ({
            ...c,
            equipment: {
              ...c.equipment,
              [res.data.equipSlot!]: id,
            },
          }));
        }
        addToast({
          type: 'success',
          title: 'Equipped',
          message: `"${res.data.name}" is now actively equipped.`,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const unequipItem = async (id: string): Promise<boolean> => {
    try {
      const res = await inventoryService.unequipItem(id);
      if (res.success && res.data) {
        setRewards((prev) =>
          prev.map((r) => (r.id === id ? { ...r, equipped: false } : r))
        );
        if (res.data.equipSlot) {
          setCharacter((c) => {
            const nextEquip = { ...c.equipment };
            delete nextEquip[res.data.equipSlot as keyof typeof nextEquip];
            return { ...c, equipment: nextEquip };
          });
        }
        addToast({
          type: 'info',
          title: 'Unequipped',
          message: `"${res.data.name}" returned to Vault.`,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const claimAchievement = async (id: string): Promise<boolean> => {
    try {
      const res = await achievementService.claimAchievementReward(id);
      if (res.success && res.data) {
        setAchievements((prev) => prev.map((a) => (a.id === id ? res.data : a)));
        // Refresh character to reflect reward XP & Gold
        const charRes = await characterService.getCharacter();
        if (charRes.success && charRes.data) setCharacter(charRes.data);
        addToast({
          type: 'success',
          title: 'Reward Claimed!',
          message: `+${res.data.xpReward} XP and +${res.data.goldReward} Gold credited.`,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const allocateAttributePoint = async (attribute: AttributeKey): Promise<boolean> => {
    if (unallocatedPoints <= 0) return false;

    try {
      const res = await characterService.allocateAttributePoint(attribute, 1);
      if (res.success && res.data) {
        setCharacter(res.data);
        setUnallocatedPoints((prev) => Math.max(0, prev - 1));
        addToast({
          type: 'success',
          title: 'Attribute Upgraded',
          message: `+2 added to ${attribute.toUpperCase()}.`,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const dismissLevelUp = () => {
    setLevelUpCelebration(null);
  };

  return (
    <GameContext.Provider
      value={{
        character,
        quests,
        rewards,
        achievements,
        streakData,
        monthlyActivity,
        dailyMissions,
        unallocatedPoints,
        levelUpCelebration,
        isLoadingGame,
        dismissLevelUp,
        completeQuest,
        createQuest,
        updateQuest,
        deleteQuest,
        toggleDailyMission,
        purchaseReward,
        equipItem,
        unequipItem,
        claimAchievement,
        allocateAttributePoint,
        refreshGameData,
        refreshStreakData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
