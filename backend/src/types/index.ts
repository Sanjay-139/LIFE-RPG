export type AttributeKey = 'strength' | 'intellect' | 'vitality' | 'discipline' | 'charisma';

export interface AttributeStat {
  key: AttributeKey;
  name: string;
  level: number;
  value: number; // 0 - 100
  maxValue: number;
  recentGain: number;
  icon: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  contributingCategories: string[];
}

export interface CharacterSheet {
  id: string;
  userId: string;
  name: string;
  title: string;
  rank: string;
  avatar: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  gold: number;
  streak: number;
  bestStreak: number;
  completedQuestsCount: number;
  attributePoints: number;
  attributes: Record<AttributeKey, AttributeStat>;
  equipment: {
    head?: string;
    torso?: string;
    hands?: string;
    accessory?: string;
    badge?: string;
    theme?: string;
  };
}

export type QuestCategory =
  | 'coding'
  | 'study'
  | 'fitness'
  | 'reading'
  | 'health'
  | 'career'
  | 'personal'
  | 'work'
  | 'other';

export type QuestDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';

export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface QuestSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  targetAttribute: AttributeKey;
  dueDate: string; // ISO string
  estimatedDuration: number; // minutes
  status: QuestStatus;
  progress: number; // 0 - 100
  subtasks?: QuestSubtask[];
  completedAt?: string;
  repeatSchedule?: 'none' | 'daily' | 'weekly' | 'weekdays';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestCompletion {
  id: string;
  userId: string;
  questId: string;
  completedAt: string;
  xpEarned: number;
  goldEarned: number;
  attributeName: AttributeKey;
  attributeGain: number;
  completionSource?: string;
}

export type RewardCategory =
  | 'gear'
  | 'avatar_item'
  | 'theme'
  | 'profile_frame'
  | 'title'
  | 'badge'
  | 'visual_effect'
  | 'cosmetic';

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  price: number;
  icon: string;
  imageUrl?: string;
  attributeBuff?: {
    attribute: AttributeKey;
    value: number;
  };
  equipSlot?: 'head' | 'torso' | 'hands' | 'accessory' | 'badge' | 'theme' | 'frame';
  owned?: boolean;
  equipped?: boolean;
  requiredLevel?: number;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  rewardId: string;
  equipped: boolean;
  acquiredAt: string;
  reward?: RewardItem;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  claimed?: boolean;
  claimedAt?: string;
  xpReward: number;
  goldReward: number;
  badgeTitle?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  claimed: boolean;
  claimedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'quest_completed'
    | 'xp_gained'
    | 'level_up'
    | 'achievement_unlocked'
    | 'reward_unlocked'
    | 'reward_purchased'
    | 'streak_increased'
    | 'quest_due'
    | 'quest_overdue';
  timestamp: string;
  read: boolean;
  rewardXp?: number;
  rewardGold?: number;
}

export interface LevelMilestone {
  level: number;
  title: string;
  xpRequired: number;
  perks: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar: string;
  classType: string;
  joinedDate: string;
  onboardingCompleted: boolean;
  bio?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyMission {
  id: string;
  userId: string;
  title: string;
  category: QuestCategory;
  durationMinutes: number;
  completed: boolean;
  xp: number;
  gold: number;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  actionType:
    | 'QUEST_CREATED'
    | 'QUEST_COMPLETED'
    | 'XP_EARNED'
    | 'ATTRIBUTE_INCREASED'
    | 'GOLD_EARNED'
    | 'GOLD_SPENT'
    | 'LEVEL_UP'
    | 'STREAK_INCREASED'
    | 'ACHIEVEMENT_UNLOCKED'
    | 'REWARD_PURCHASED'
    | 'ITEM_EQUIPPED'
    | 'ITEM_UNEQUIPPED'
    | 'CALENDAR_CONNECTED'
    | 'CALENDAR_DISCONNECTED';
  title: string;
  description: string;
  xpEarned?: number;
  goldEarned?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface GoldTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: 'QUEST_REWARD' | 'ACHIEVEMENT_REWARD' | 'BONUS' | 'REWARD_PURCHASE';
  sourceId?: string;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

export interface XpHistoryItem {
  id: string;
  userId: string;
  sourceType: 'QUEST_COMPLETION' | 'ACHIEVEMENT' | 'BONUS' | 'DAILY_MISSION';
  sourceId?: string;
  xpAmount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

export interface LevelHistoryItem {
  id: string;
  userId: string;
  oldLevel: number;
  newLevel: number;
  xpAtLevelUp: number;
  unlockedFeatures?: string[];
  createdAt: string;
}

export interface StreakHistoryItem {
  id: string;
  userId: string;
  activityDate: string; // YYYY-MM-DD
  streakCount: number;
  freezeUsed: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
