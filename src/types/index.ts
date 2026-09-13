export type AttributeKey = 'strength' | 'intellect' | 'vitality' | 'discipline' | 'charisma';

export interface AttributeStat {
  key: AttributeKey;
  name: string;
  level: number;
  value: number; // 0-100 or higher
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
  userId?: string;
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
  attributePoints?: number;
  attributes: Record<AttributeKey, AttributeStat>;
  equipment: {
    head?: string;
    torso?: string;
    hands?: string;
    accessory?: string;
    badge?: string;
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

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface QuestSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
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
}

export type RewardCategory =
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
  owned: boolean;
  equipped: boolean;
  requiredLevel?: number;
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
  xpReward: number;
  goldReward: number;
  badgeTitle?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | 'quest_completed'
    | 'xp_gained'
    | 'level_up'
    | 'achievement_unlocked'
    | 'reward_unlocked'
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
  fullName: string;
  email: string;
  phone?: string;
  avatar: string;
  classType: string;
  joinedDate: string;
  onboardingCompleted: boolean;
  bio?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  category: QuestCategory;
  durationMinutes: number;
  completed: boolean;
  xp: number;
  gold: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
