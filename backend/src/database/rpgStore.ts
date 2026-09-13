import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, isPostgresConnected, query } from '../config/database.js';
import {
  User,
  UserProfile,
  CharacterSheet,
  AttributeKey,
  AttributeStat,
  Quest,
  QuestCompletion,
  RewardItem,
  InventoryItem,
  Achievement,
  UserAchievement,
  NotificationItem,
  DailyMission,
  ActivityLog,
  GoldTransaction,
  XpHistoryItem,
  LevelHistoryItem,
  StreakHistoryItem
} from '../types/index.js';
import { SEED_REWARDS, SEED_ACHIEVEMENTS, STARTER_QUESTS } from './seed/rpg.data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'rpg_store.json');

export interface UserRecord extends User {
  passwordHash: string;
  googleId?: string;
  lastLogin?: string;
}

export interface CalendarConnectionRecord {
  id: string;
  userId: string;
  connected: boolean;
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'REAUTHORIZATION_REQUIRED';
  accountEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  scope?: string;
  lastSync?: string;
}

interface RpgStorageData {
  users: UserRecord[];
  userProfiles: Record<string, UserProfile & { timezone?: string; preferences?: any }>;
  characterStats: Record<string, Record<AttributeKey, AttributeStat>>;
  characterSheets: Record<string, Partial<CharacterSheet>>;
  quests: Quest[];
  questCompletions: QuestCompletion[];
  xpHistory: XpHistoryItem[];
  levelHistory: LevelHistoryItem[];
  streakHistory: StreakHistoryItem[];
  goldTransactions: GoldTransaction[];
  rewards: RewardItem[];
  inventory: InventoryItem[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  dailyMissions: DailyMission[];
  calendarConnections: Record<string, CalendarConnectionRecord>;
}

export function getUserLocalDate(timezone: string = 'UTC', date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

export class RpgStore {
  private data: RpgStorageData = {
    users: [],
    userProfiles: {},
    characterStats: {},
    characterSheets: {},
    quests: [],
    questCompletions: [],
    xpHistory: [],
    levelHistory: [],
    streakHistory: [],
    goldTransactions: [],
    rewards: [...SEED_REWARDS],
    inventory: [],
    achievements: [...SEED_ACHIEVEMENTS],
    userAchievements: [],
    activityLogs: [],
    notifications: [],
    dailyMissions: [],
    calendarConnections: {}
  };

  private isLoaded = false;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          userProfiles: parsed.userProfiles || {},
          characterStats: parsed.characterStats || {},
          characterSheets: parsed.characterSheets || {},
          quests: parsed.quests || [],
          questCompletions: parsed.questCompletions || [],
          xpHistory: parsed.xpHistory || [],
          levelHistory: parsed.levelHistory || [],
          streakHistory: parsed.streakHistory || [],
          goldTransactions: parsed.goldTransactions || [],
          rewards: parsed.rewards && parsed.rewards.length > 0 ? parsed.rewards : [...SEED_REWARDS],
          inventory: parsed.inventory || [],
          achievements: parsed.achievements && parsed.achievements.length > 0 ? parsed.achievements : [...SEED_ACHIEVEMENTS],
          userAchievements: parsed.userAchievements || [],
          activityLogs: parsed.activityLogs || [],
          notifications: parsed.notifications || [],
          dailyMissions: parsed.dailyMissions || [],
          calendarConnections: parsed.calendarConnections || {}
        };
        console.log(`💾 [Store] Loaded persistent data from ${DATA_FILE}`);
      } else {
        this.seedStaticData();
        this.saveToDiskImmediate();
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn('⚠️ [Store] Could not load data file, starting with default seed data:', err);
      this.seedStaticData();
      this.isLoaded = true;
    }
  }

  public saveToDiskImmediate() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ [Store] Failed to write to disk:', err);
    }
  }

  public seedStaticData() {
    this.data.rewards = [...SEED_REWARDS];
    this.data.achievements = [...SEED_ACHIEVEMENTS];
  }

  // --- USERS & AUTH ---
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [normalized]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          passwordHash: r.password_hash,
          phone: r.phone || '',
          avatar: r.avatar || 'avatar-01',
          role: r.role || 'adventurer',
          googleId: r.google_id,
          lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        };
      }
      return null;
    }
    const user = this.data.users.find(u => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }

  async findUserById(id: string): Promise<User | null> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM users WHERE id = $1', [id]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone || '',
          avatar: r.avatar || 'avatar-01',
          role: r.role || 'adventurer',
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        };
      }
      return null;
    }
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findUserByGoogleId(googleId: string): Promise<UserRecord | null> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM users WHERE google_id = $1', [googleId]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          passwordHash: r.password_hash,
          phone: r.phone || '',
          avatar: r.avatar || 'avatar-01',
          role: r.role || 'adventurer',
          googleId: r.google_id,
          lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        };
      }
      return null;
    }
    const user = this.data.users.find(u => u.googleId === googleId);
    return user ? { ...user } : null;
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    avatar?: string;
    googleId?: string;
  }): Promise<User> {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const avatar = data.avatar && /^avatar-\d{2,}$/.test(data.avatar) ? data.avatar : 'avatar-01';
    const now = new Date().toISOString();
    const normalizedEmail = data.email.trim().toLowerCase();

    const newRecord: UserRecord = {
      id,
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      phone: data.phone || '',
      avatar,
      role: 'adventurer',
      googleId: data.googleId,
      createdAt: now,
      updatedAt: now
    };

    if (pool && isPostgresConnected) {
      // 1. Insert into users
      await query(
        `INSERT INTO users (id, name, email, password_hash, phone, avatar, role, google_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, newRecord.name, newRecord.email, newRecord.passwordHash, newRecord.phone, avatar, 'adventurer', data.googleId || null, now, now]
      );

      // 2. Initialize pristine Level 0 user profile in Postgres
      await query(
        `INSERT INTO user_profiles (
           id, user_id, full_name, title, rank, class_type, bio,
           current_level, current_xp, total_xp, gold, current_streak,
           best_streak, freezes_remaining, last_activity_date, onboarding_completed,
           attribute_points, timezone, preferences, created_at, updated_at
         ) VALUES (
           $1, $2, $3, 'Apprentice Novice', 'Novice Initiate', 'Disciplined Warrior', '',
           0, 0, 0, 100, 0, 0, 2, NULL, false, 0, 'UTC',
           '{"sound": true, "celebrations": true, "notifications": true}'::jsonb,
           NOW(), NOW()
         ) ON CONFLICT (user_id) DO NOTHING`,
        [`prof-${id}`, id, newRecord.name]
      );

      // 3. Initialize default starter attributes in Postgres
      const defaultAttrs: [AttributeKey, number][] = [
        ['strength', 15],
        ['intellect', 20],
        ['vitality', 15],
        ['discipline', 25],
        ['charisma', 10]
      ];
      for (const [attrName, val] of defaultAttrs) {
        await query(
          `INSERT INTO character_stats (id, user_id, attribute_name, value, level, recent_gain, updated_at)
           VALUES ($1, $2, $3, $4, 1, 0, NOW())
           ON CONFLICT (user_id, attribute_name) DO NOTHING`,
          [`cs-${id}-${attrName}`, id, attrName, val]
        );
      }
    }

    // Local in-memory store initialization
    this.data.users.push(newRecord);
    this.data.userProfiles[id] = {
      id: `prof-${id}`,
      userId: id,
      fullName: newRecord.name,
      email: newRecord.email,
      phone: newRecord.phone,
      avatar,
      classType: 'Disciplined Warrior',
      joinedDate: now.split('T')[0],
      onboardingCompleted: false,
      bio: '',
      timezone: 'UTC',
      preferences: { sound: true, celebrations: true, notifications: true }
    };

    // Baseline Character Sheet: Level 0, 100 Gold, 0 Streak, 0 XP
    this.data.characterSheets[id] = {
      level: 0,
      currentXp: 0,
      totalXp: 0,
      gold: 100,
      streak: 0,
      bestStreak: 0,
      attributePoints: 0,
      title: 'Apprentice Novice',
      rank: 'Novice Initiate'
    };

    // Default attributes
    await this.getAttributes(id);

    this.saveToDiskImmediate();
    const { passwordHash, ...safeUser } = newRecord;
    return safeUser;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const now = new Date().toISOString();
    if (pool && isPostgresConnected) {
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
    }
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.lastLogin = now;
      this.saveToDiskImmediate();
    }
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<void> {
    if (pool && isPostgresConnected) {
      await query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, userId]);
    }
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.googleId = googleId;
      this.saveToDiskImmediate();
    }
  }

  // --- USER PROFILES ---
  async getProfile(userId: string): Promise<UserProfile & { timezone?: string; preferences?: any }> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        `SELECT p.*, u.email, u.phone, u.avatar
         FROM user_profiles p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1`,
        [userId]
      );
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userId: r.user_id,
          fullName: r.full_name,
          email: r.email || '',
          phone: r.phone || '',
          avatar: r.avatar || 'avatar-01',
          classType: r.class_type || 'Disciplined Warrior',
          joinedDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          onboardingCompleted: r.onboarding_completed || false,
          bio: r.bio || '',
          timezone: r.timezone || 'UTC',
          preferences: r.preferences || { sound: true, celebrations: true, notifications: true }
        };
      }
    }

    let profile = this.data.userProfiles[userId];
    if (!profile) {
      const user = await this.findUserById(userId);
      profile = {
        id: `prof-${userId}`,
        userId,
        fullName: user?.name || 'Novice Adventurer',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || 'avatar-01',
        classType: 'Disciplined Warrior',
        joinedDate: new Date().toISOString().split('T')[0],
        onboardingCompleted: false,
        bio: '',
        timezone: 'UTC',
        preferences: { sound: true, celebrations: true, notifications: true }
      };
      this.data.userProfiles[userId] = profile;
      this.saveToDiskImmediate();
    }
    return { ...profile };
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile> & { timezone?: string; preferences?: any }
  ): Promise<UserProfile> {
    const profile = await this.getProfile(userId);

    // Whitelist safe editable fields only (prevent mutating XP, Level, Gold, Streak via profile)
    const safeUpdates: any = {};
    if (updates.fullName !== undefined) safeUpdates.fullName = updates.fullName.trim();
    if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
    if (updates.classType !== undefined) safeUpdates.classType = updates.classType;
    if (updates.bio !== undefined) safeUpdates.bio = updates.bio;
    if (updates.onboardingCompleted !== undefined) safeUpdates.onboardingCompleted = updates.onboardingCompleted;
    if (updates.timezone !== undefined) safeUpdates.timezone = updates.timezone;
    if (updates.preferences !== undefined) safeUpdates.preferences = updates.preferences;

    // Validate avatar ID: Must be an avatar identifier, reject arbitrary external URLs
    if (updates.avatar !== undefined) {
      if (/^avatar-\d{2,}$/.test(updates.avatar)) {
        safeUpdates.avatar = updates.avatar;
      } else {
        console.warn(`[Store] Invalid avatar_id "${updates.avatar}" rejected. Using avatar-01.`);
        safeUpdates.avatar = 'avatar-01';
      }
    }

    Object.assign(profile, safeUpdates);
    this.data.userProfiles[userId] = profile;

    if (pool && isPostgresConnected) {
      await query(
        `UPDATE user_profiles
         SET full_name = COALESCE($1, full_name),
             class_type = COALESCE($2, class_type),
             bio = COALESCE($3, bio),
             onboarding_completed = COALESCE($4, onboarding_completed),
             timezone = COALESCE($5, timezone),
             preferences = COALESCE($6, preferences),
             updated_at = NOW()
         WHERE user_id = $7`,
        [
          safeUpdates.fullName || null,
          safeUpdates.classType || null,
          safeUpdates.bio || null,
          safeUpdates.onboardingCompleted !== undefined ? safeUpdates.onboardingCompleted : null,
          safeUpdates.timezone || null,
          safeUpdates.preferences ? JSON.stringify(safeUpdates.preferences) : null,
          userId
        ]
      );

      if (safeUpdates.avatar || safeUpdates.phone !== undefined) {
        await query(
          `UPDATE users
           SET avatar = COALESCE($1, avatar),
               phone = COALESCE($2, phone),
               updated_at = NOW()
           WHERE id = $3`,
          [safeUpdates.avatar || null, safeUpdates.phone !== undefined ? safeUpdates.phone : null, userId]
        );
      }
    }

    // Update in-memory user avatar
    const localUser = this.data.users.find(u => u.id === userId);
    if (localUser) {
      if (safeUpdates.avatar) localUser.avatar = safeUpdates.avatar;
      if (safeUpdates.phone !== undefined) localUser.phone = safeUpdates.phone;
    }

    this.saveToDiskImmediate();
    return { ...profile };
  }

  // --- CHARACTER SHEET & STATS ---
  async getCharacterSheet(userId: string): Promise<CharacterSheet> {
    const profile = await this.getProfile(userId);
    const attributes = await this.getAttributes(userId);

    let level = 0;
    let currentXp = 0;
    let totalXp = 0;
    let gold = 100;
    let streak = 0;
    let bestStreak = 0;
    let attributePoints = 0;
    let title = 'Apprentice Novice';
    let rank = 'Novice Initiate';

    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        `SELECT current_level, current_xp, total_xp, gold, current_streak, best_streak, attribute_points, title, rank
         FROM user_profiles
         WHERE user_id = $1`,
        [userId]
      );
      if (rows.length > 0) {
        const r = rows[0];
        level = r.current_level !== undefined ? r.current_level : 0;
        currentXp = r.current_xp || 0;
        totalXp = r.total_xp || 0;
        gold = r.gold !== undefined ? r.gold : 100;
        streak = r.current_streak || 0;
        bestStreak = r.best_streak || 0;
        attributePoints = r.attribute_points || 0;
        title = r.title || (level >= 10 ? 'Elite Pathfinder' : level > 0 ? 'Questing Scholar' : 'Apprentice Novice');
        rank = r.rank || (level >= 10 ? 'Rank A Adventurer' : level > 0 ? 'Rank F Novice' : 'Novice Initiate');
      }
    } else {
      const customSheet = this.data.characterSheets[userId] || {};
      totalXp = customSheet.totalXp !== undefined ? customSheet.totalXp : 0;
      currentXp = customSheet.currentXp !== undefined ? customSheet.currentXp : 0;
      level = customSheet.level !== undefined ? customSheet.level : (totalXp === 0 ? 0 : 1);
      gold = customSheet.gold !== undefined ? customSheet.gold : 100;
      streak = customSheet.streak !== undefined ? customSheet.streak : 0;
      bestStreak = customSheet.bestStreak !== undefined ? customSheet.bestStreak : 0;
      attributePoints = customSheet.attributePoints !== undefined ? customSheet.attributePoints : 0;
      title = customSheet.title || (level >= 10 ? 'Elite Pathfinder' : level > 0 ? 'Questing Scholar' : 'Apprentice Novice');
      rank = customSheet.rank || (level >= 10 ? 'Rank A Adventurer' : level > 0 ? 'Rank F Novice' : 'Novice Initiate');
    }

    const completions = await this.getQuestCompletions(userId);
    const completedQuestsCount = completions.length;

    // Equipped items
    const inventory = await this.getInventory(userId);
    const equipment: CharacterSheet['equipment'] = {};
    for (const item of inventory) {
      if (item.equipped && item.reward?.equipSlot) {
        const slot = item.reward.equipSlot;
        if (slot === 'torso') equipment.torso = item.rewardId;
        else if (slot === 'head') equipment.head = item.rewardId;
        else if (slot === 'hands') equipment.hands = item.rewardId;
        else if (slot === 'accessory') equipment.accessory = item.rewardId;
        else if (slot === 'badge') equipment.badge = item.rewardId;
        else if (slot === 'theme') equipment.theme = item.rewardId;
      }
    }

    return {
      id: `char-${userId}`,
      userId,
      name: profile.fullName,
      title,
      rank,
      avatar: profile.avatar || 'avatar-01',
      level,
      currentXp,
      xpToNextLevel: Math.round(100 * Math.pow(1.35, Math.max(0, level - 1))),
      totalXp,
      gold,
      streak,
      bestStreak,
      completedQuestsCount,
      attributePoints,
      attributes,
      equipment
    };
  }

  async updateCharacterSheet(userId: string, updates: Partial<CharacterSheet>): Promise<void> {
    const current = this.data.characterSheets[userId] || {};
    this.data.characterSheets[userId] = { ...current, ...updates };

    if (pool && isPostgresConnected) {
      await query(
        `UPDATE user_profiles
         SET current_level = COALESCE($1, current_level),
             current_xp = COALESCE($2, current_xp),
             total_xp = COALESCE($3, total_xp),
             gold = COALESCE($4, gold),
             current_streak = COALESCE($5, current_streak),
             best_streak = COALESCE($6, best_streak),
             attribute_points = COALESCE($7, attribute_points),
             title = COALESCE($8, title),
             rank = COALESCE($9, rank),
             updated_at = NOW()
         WHERE user_id = $10`,
        [
          updates.level !== undefined ? updates.level : null,
          updates.currentXp !== undefined ? updates.currentXp : null,
          updates.totalXp !== undefined ? updates.totalXp : null,
          updates.gold !== undefined ? updates.gold : null,
          updates.streak !== undefined ? updates.streak : null,
          updates.bestStreak !== undefined ? updates.bestStreak : null,
          updates.attributePoints !== undefined ? updates.attributePoints : null,
          updates.title || null,
          updates.rank || null,
          userId
        ]
      );
    }

    this.saveToDiskImmediate();
  }

  async getAttributes(userId: string): Promise<Record<AttributeKey, AttributeStat>> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM character_stats WHERE user_id = $1',
        [userId]
      );
      if (rows.length === 5) {
        const result: any = {};
        for (const r of rows) {
          result[r.attribute_name] = this.buildAttributeStat(
            r.attribute_name as AttributeKey,
            r.value,
            r.level,
            r.recent_gain
          );
        }
        return result;
      }
    }

    if (!this.data.characterStats[userId]) {
      this.data.characterStats[userId] = {
        strength: this.buildAttributeStat('strength', 15, 1, 0),
        intellect: this.buildAttributeStat('intellect', 20, 1, 0),
        vitality: this.buildAttributeStat('vitality', 15, 1, 0),
        discipline: this.buildAttributeStat('discipline', 25, 1, 0),
        charisma: this.buildAttributeStat('charisma', 10, 1, 0)
      };
      this.saveToDiskImmediate();
    }
    return this.data.characterStats[userId];
  }

  private buildAttributeStat(key: AttributeKey, value: number, level: number, recentGain: number): AttributeStat {
    const meta: Record<AttributeKey, { name: string; icon: string; color: string; bg: string; text: string; border: string; desc: string; cats: string[] }> = {
      strength: { name: 'Strength', icon: 'fitness_center', color: 'stat-strength', bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30', desc: 'Physical endurance, resistance training, strength conditioning.', cats: ['fitness', 'health'] },
      intellect: { name: 'Intellect', icon: 'psychology', color: 'stat-intellect', bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30', desc: 'Coding, algorithms, computer architecture, deep technical study.', cats: ['coding', 'study', 'work'] },
      vitality: { name: 'Vitality', icon: 'spa', color: 'stat-vitality', bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/30', desc: 'Cardiovascular uptime, hydration, recovery, balanced sleep.', cats: ['fitness', 'health'] },
      discipline: { name: 'Discipline', icon: 'hourglass_top', color: 'stat-discipline', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', desc: 'Distraction-free deep work blocks, consistency, meditation.', cats: ['reading', 'personal', 'study'] },
      charisma: { name: 'Charisma', icon: 'palette', color: 'stat-charisma', bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/30', desc: 'Communication, team leadership, creative showcases, design.', cats: ['career', 'other'] }
    };
    const m = meta[key];
    return {
      key,
      name: m.name,
      level,
      value,
      maxValue: 100,
      recentGain,
      icon: m.icon,
      colorClass: m.color,
      bgClass: m.bg,
      textClass: m.text,
      borderClass: m.border,
      description: m.desc,
      contributingCategories: m.cats
    };
  }

  async increaseAttribute(userId: string, attribute: AttributeKey, amount: number): Promise<AttributeStat> {
    const stats = await this.getAttributes(userId);
    const target = stats[attribute];
    if (target) {
      target.value = Math.min(100, target.value + amount);
      target.recentGain += amount;
      target.level = Math.max(1, Math.floor(target.value / 10) + 1);

      if (pool && isPostgresConnected) {
        await query(
          `UPDATE character_stats
           SET value = LEAST(100, value + $1),
               recent_gain = recent_gain + $1,
               level = GREATEST(1, FLOOR((value + $1) / 10) + 1),
               updated_at = NOW()
           WHERE user_id = $2 AND attribute_name = $3`,
          [amount, userId, attribute]
        );
      }

      this.saveToDiskImmediate();
      return { ...target };
    }
    throw new Error(`Attribute ${attribute} not found`);
  }

  async allocateAttributePoint(userId: string, attribute: AttributeKey, points: number = 1): Promise<CharacterSheet> {
    const sheet = await this.getCharacterSheet(userId);
    if (sheet.attributePoints < points) {
      throw new Error(`Insufficient attribute points (have ${sheet.attributePoints}, requested ${points})`);
    }

    await this.increaseAttribute(userId, attribute, points * 5);
    const newPoints = sheet.attributePoints - points;
    await this.updateCharacterSheet(userId, { attributePoints: newPoints });

    await this.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'ATTRIBUTE_INCREASED',
      title: `⚡ Allocated +${points} to ${attribute.toUpperCase()}`,
      description: `Invested ${points} unallocated attribute point into ${attribute}.`,
      createdAt: new Date().toISOString()
    });

    return this.getCharacterSheet(userId);
  }

  // --- QUESTS CRUD & COMPLETION ---
  async getQuests(userId: string, filters?: { status?: string; category?: string; difficulty?: string }): Promise<Quest[]> {
    if (pool && isPostgresConnected) {
      let sql = 'SELECT * FROM quests WHERE user_id = $1';
      const params: any[] = [userId];
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND status = $${params.length}`;
      }
      if (filters?.category) {
        params.push(filters.category);
        sql += ` AND category = $${params.length}`;
      }
      if (filters?.difficulty) {
        params.push(filters.difficulty);
        sql += ` AND difficulty = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC';
      const rows = await query<any>(sql, params);
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        description: r.description || '',
        category: r.category,
        difficulty: r.difficulty,
        estimatedDuration: r.estimated_duration,
        dueDate: r.due_date ? new Date(r.due_date).toISOString() : new Date().toISOString(),
        xpReward: r.xp_reward,
        goldReward: r.gold_reward,
        targetAttribute: r.target_attribute,
        status: r.status,
        repeatSchedule: r.repeat_schedule,
        progress: r.progress,
        subtasks: r.subtasks || [],
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString()
      }));
    }

    let userQuests = this.data.quests.filter(q => q.userId === userId);
    if (filters?.status) userQuests = userQuests.filter(q => q.status === filters.status);
    if (filters?.category) userQuests = userQuests.filter(q => q.category === filters.category);
    if (filters?.difficulty) userQuests = userQuests.filter(q => q.difficulty === filters.difficulty);
    return userQuests;
  }

  async getQuestById(userId: string, questId: string): Promise<Quest | null> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [questId, userId]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userId: r.user_id,
          title: r.title,
          description: r.description || '',
          category: r.category,
          difficulty: r.difficulty,
          estimatedDuration: r.estimated_duration,
          dueDate: r.due_date ? new Date(r.due_date).toISOString() : new Date().toISOString(),
          xpReward: r.xp_reward,
          goldReward: r.gold_reward,
          targetAttribute: r.target_attribute,
          status: r.status,
          repeatSchedule: r.repeat_schedule,
          progress: r.progress,
          subtasks: r.subtasks || [],
          completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        };
      }
      return null;
    }
    const quest = this.data.quests.find(q => q.id === questId && q.userId === userId);
    return quest ? { ...quest } : null;
  }

  async createQuest(userId: string, data: Omit<Quest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Quest> {
    const id = `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newQuest: Quest = {
      ...data,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };

    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO quests (
           id, user_id, title, description, category, difficulty,
           estimated_duration, due_date, xp_reward, gold_reward,
           target_attribute, status, repeat_schedule, progress, subtasks,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
         )`,
        [
          id,
          userId,
          newQuest.title,
          newQuest.description || '',
          newQuest.category,
          newQuest.difficulty,
          newQuest.estimatedDuration || 30,
          newQuest.dueDate,
          newQuest.xpReward,
          newQuest.goldReward,
          newQuest.targetAttribute,
          newQuest.status,
          newQuest.repeatSchedule || 'none',
          newQuest.progress || 0,
          JSON.stringify(newQuest.subtasks || []),
          now,
          now
        ]
      );
    }

    this.data.quests.unshift(newQuest);
    this.saveToDiskImmediate();
    return { ...newQuest };
  }

  async updateQuest(userId: string, questId: string, updates: Partial<Quest>): Promise<Quest> {
    const existing = await this.getQuestById(userId, questId);
    if (!existing) throw new Error('Quest not found');

    const updated: Quest = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (pool && isPostgresConnected) {
      await query(
        `UPDATE quests
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             category = COALESCE($3, category),
             difficulty = COALESCE($4, difficulty),
             estimated_duration = COALESCE($5, estimated_duration),
             due_date = COALESCE($6, due_date),
             xp_reward = COALESCE($7, xp_reward),
             gold_reward = COALESCE($8, gold_reward),
             target_attribute = COALESCE($9, target_attribute),
             status = COALESCE($10, status),
             repeat_schedule = COALESCE($11, repeat_schedule),
             progress = COALESCE($12, progress),
             subtasks = COALESCE($13, subtasks),
             completed_at = COALESCE($14, completed_at),
             updated_at = NOW()
         WHERE id = $15 AND user_id = $16`,
        [
          updates.title || null,
          updates.description !== undefined ? updates.description : null,
          updates.category || null,
          updates.difficulty || null,
          updates.estimatedDuration || null,
          updates.dueDate || null,
          updates.xpReward || null,
          updates.goldReward || null,
          updates.targetAttribute || null,
          updates.status || null,
          updates.repeatSchedule || null,
          updates.progress !== undefined ? updates.progress : null,
          updates.subtasks ? JSON.stringify(updates.subtasks) : null,
          updates.completedAt || null,
          questId,
          userId
        ]
      );
    }

    const idx = this.data.quests.findIndex(q => q.id === questId && q.userId === userId);
    if (idx !== -1) {
      this.data.quests[idx] = updated;
    }
    this.saveToDiskImmediate();
    return updated;
  }

  async deleteQuest(userId: string, questId: string): Promise<boolean> {
    if (pool && isPostgresConnected) {
      await query('DELETE FROM quests WHERE id = $1 AND user_id = $2', [questId, userId]);
    }
    this.data.quests = this.data.quests.filter(q => !(q.id === questId && q.userId === userId));
    this.saveToDiskImmediate();
    return true;
  }

  async getQuestCompletions(userId: string): Promise<QuestCompletion[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM quest_completions WHERE user_id = $1 ORDER BY completed_at DESC',
        [userId]
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        questId: r.quest_id,
        completedAt: new Date(r.completed_at).toISOString(),
        xpEarned: r.xp_earned,
        goldEarned: r.gold_earned,
        attributeName: r.attribute_name as AttributeKey,
        attributeGain: r.attribute_gain,
        completionSource: r.completion_source
      }));
    }
    return this.data.questCompletions.filter(qc => qc.userId === userId);
  }

  async addQuestCompletion(completion: QuestCompletion): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO quest_completions (
           id, user_id, quest_id, completed_at, xp_earned, gold_earned,
           attribute_name, attribute_gain, completion_source
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          completion.id,
          completion.userId,
          completion.questId,
          completion.completedAt,
          completion.xpEarned,
          completion.goldEarned,
          completion.attributeName,
          completion.attributeGain,
          completion.completionSource || 'manual_verification'
        ]
      );
    }
    this.data.questCompletions.unshift(completion);
    this.saveToDiskImmediate();
  }

  // --- XP & LEVEL HISTORY ---
  async addXpHistory(item: XpHistoryItem): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO xp_history (id, user_id, source_type, source_id, xp_amount, balance_after, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [item.id, item.userId, item.sourceType, item.sourceId || null, item.xpAmount, item.balanceAfter, item.description, item.createdAt]
      );
    }
    this.data.xpHistory.unshift(item);
    this.saveToDiskImmediate();
  }

  async addLevelHistory(item: LevelHistoryItem): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO level_history (id, user_id, old_level, new_level, xp_at_level_up, unlocked_features, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [item.id, item.userId, item.oldLevel, item.newLevel, item.xpAtLevelUp, JSON.stringify(item.unlockedFeatures || []), item.createdAt]
      );
    }
    this.data.levelHistory.unshift(item);
    this.saveToDiskImmediate();
  }

  // --- STREAKS & STREAK HISTORY ---
  async getStreakHistory(userId: string): Promise<StreakHistoryItem[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM streak_history WHERE user_id = $1 ORDER BY activity_date DESC',
        [userId]
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        activityDate: r.activity_date,
        streakCount: r.streak_count,
        freezeUsed: r.freeze_used,
        createdAt: new Date(r.created_at).toISOString()
      }));
    }
    return this.data.streakHistory.filter(s => s.userId === userId).sort((a, b) => b.activityDate.localeCompare(a.activityDate));
  }

  async addStreakHistory(item: StreakHistoryItem): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO streak_history (id, user_id, activity_date, streak_count, freeze_used, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, activity_date) DO UPDATE SET
           streak_count = EXCLUDED.streak_count,
           freeze_used = EXCLUDED.freeze_used`,
        [item.id, item.userId, item.activityDate, item.streakCount, item.freezeUsed, item.createdAt]
      );
    }
    const idx = this.data.streakHistory.findIndex(s => s.userId === item.userId && s.activityDate === item.activityDate);
    if (idx !== -1) {
      this.data.streakHistory[idx] = item;
    } else {
      this.data.streakHistory.unshift(item);
    }
    this.saveToDiskImmediate();
  }

  // --- GOLD TRANSACTIONS ---
  async addGoldTransaction(tx: GoldTransaction): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO gold_transactions (id, user_id, amount, transaction_type, source_id, balance_after, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tx.id, tx.userId, tx.amount, tx.transactionType, tx.sourceId || null, tx.balanceAfter, tx.description, tx.createdAt]
      );
    }
    this.data.goldTransactions.unshift(tx);
    this.saveToDiskImmediate();
  }

  // --- REWARDS & INVENTORY ---
  async getRewards(userId?: string): Promise<RewardItem[]> {
    let rewards: RewardItem[] = [];
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM rewards ORDER BY required_level ASC, price ASC');
      if (rows.length > 0) {
        rewards = rows.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          category: r.category,
          price: r.price,
          icon: r.icon,
          imageUrl: r.image_url,
          attributeBuff: r.attribute_buff,
          equipSlot: r.equip_slot,
          requiredLevel: r.required_level
        }));
      }
    } else {
      rewards = this.data.rewards;
    }

    if (userId) {
      const inventory = await this.getInventory(userId);
      return rewards.map(r => {
        const inv = inventory.find(i => i.rewardId === r.id);
        return {
          ...r,
          owned: !!inv,
          equipped: !!inv?.equipped
        };
      });
    }

    return rewards;
  }

  async getRewardById(rewardId: string): Promise<RewardItem | null> {
    const rewards = await this.getRewards();
    return rewards.find(r => r.id === rewardId) || null;
  }

  async getInventory(userId: string): Promise<InventoryItem[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        `SELECT i.*, r.name, r.description, r.category, r.icon, r.image_url, r.equip_slot, r.attribute_buff
         FROM inventory i
         JOIN rewards r ON i.reward_id = r.id
         WHERE i.user_id = $1
         ORDER BY i.acquired_at DESC`,
        [userId]
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        rewardId: r.reward_id,
        equipped: r.equipped,
        acquiredAt: new Date(r.acquired_at).toISOString(),
        reward: {
          id: r.reward_id,
          name: r.name,
          description: r.description,
          category: r.category,
          price: 0,
          icon: r.icon,
          imageUrl: r.image_url,
          equipSlot: r.equip_slot,
          attributeBuff: r.attribute_buff
        }
      }));
    }
    return this.data.inventory.filter(i => i.userId === userId).map(inv => {
      const reward = this.data.rewards.find(r => r.id === inv.rewardId);
      return { ...inv, reward };
    });
  }

  async addInventoryItem(userId: string, rewardId: string): Promise<InventoryItem> {
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const item: InventoryItem = {
      id,
      userId,
      rewardId,
      equipped: false,
      acquiredAt: now
    };

    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO inventory (id, user_id, reward_id, equipped, acquired_at)
         VALUES ($1, $2, $3, false, NOW())
         ON CONFLICT (user_id, reward_id) DO NOTHING`,
        [id, userId, rewardId]
      );
    }

    this.data.inventory.unshift(item);
    this.saveToDiskImmediate();
    return item;
  }

  async equipInventoryItem(userId: string, rewardId: string): Promise<boolean> {
    const rewards = await this.getRewards();
    const targetReward = rewards.find(r => r.id === rewardId);
    if (!targetReward?.equipSlot) return false;

    if (pool && isPostgresConnected) {
      // Unequip any item sharing this slot
      await query(
        `UPDATE inventory i
         SET equipped = false
         FROM rewards r
         WHERE i.reward_id = r.id AND i.user_id = $1 AND r.equip_slot = $2`,
        [userId, targetReward.equipSlot]
      );
      // Equip target item
      await query(
        'UPDATE inventory SET equipped = true WHERE user_id = $1 AND reward_id = $2',
        [userId, rewardId]
      );
    }

    // Update in-memory
    for (const inv of this.data.inventory.filter(i => i.userId === userId)) {
      const r = rewards.find(x => x.id === inv.rewardId);
      if (r?.equipSlot === targetReward.equipSlot) {
        inv.equipped = (inv.rewardId === rewardId);
      }
    }
    this.saveToDiskImmediate();
    return true;
  }

  async unequipInventoryItem(userId: string, rewardId: string): Promise<boolean> {
    if (pool && isPostgresConnected) {
      await query('UPDATE inventory SET equipped = false WHERE user_id = $1 AND reward_id = $2', [userId, rewardId]);
    }
    const target = this.data.inventory.find(i => i.userId === userId && i.rewardId === rewardId);
    if (target) {
      target.equipped = false;
      this.saveToDiskImmediate();
      return true;
    }
    return false;
  }

  // --- ACHIEVEMENTS & MILESTONES ---
  async getAchievements(userId: string): Promise<Achievement[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        `SELECT a.*,
                COALESCE(ua.progress, 0) as user_progress,
                COALESCE(ua.unlocked, false) as user_unlocked,
                ua.unlocked_at,
                COALESCE(ua.claimed, false) as user_claimed,
                ua.claimed_at
         FROM achievements a
         LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
         ORDER BY a.created_at ASC`,
        [userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          icon: r.icon,
          category: r.category,
          progress: r.user_progress,
          maxProgress: r.max_progress,
          unlocked: r.user_unlocked,
          unlockedAt: r.unlocked_at ? new Date(r.unlocked_at).toISOString() : undefined,
          claimed: r.user_claimed,
          claimedAt: r.claimed_at ? new Date(r.claimed_at).toISOString() : undefined,
          xpReward: r.xp_reward,
          goldReward: r.gold_reward,
          badgeTitle: r.badge_title
        }));
      }
    }

    const baseAchs = this.data.achievements;
    return baseAchs.map(a => {
      const ua = this.data.userAchievements.find(u => u.userId === userId && u.achievementId === a.id);
      return {
        ...a,
        progress: ua ? ua.progress : 0,
        unlocked: ua ? ua.unlocked : false,
        unlockedAt: ua?.unlockedAt,
        claimed: ua ? ua.claimed : false,
        claimedAt: ua?.claimedAt
      };
    });
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progressDeltaOrTarget: number
  ): Promise<{ achievement: Achievement; unlocked: boolean }> {
    const achs = await this.getAchievements(userId);
    const targetAch = achs.find(a => a.id === achievementId);
    if (!targetAch) throw new Error(`Achievement ${achievementId} not found`);

    let newProgress = Math.max(targetAch.progress, progressDeltaOrTarget);
    const shouldUnlock = newProgress >= targetAch.maxProgress && !targetAch.unlocked;
    const now = new Date().toISOString();

    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO user_achievements (id, user_id, achievement_id, progress, unlocked, unlocked_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (user_id, achievement_id) DO UPDATE SET
           progress = GREATEST(user_achievements.progress, EXCLUDED.progress),
           unlocked = CASE WHEN user_achievements.unlocked THEN true ELSE EXCLUDED.unlocked END,
           unlocked_at = CASE WHEN user_achievements.unlocked THEN user_achievements.unlocked_at ELSE EXCLUDED.unlocked_at END,
           updated_at = NOW()`,
        [
          `ua-${userId}-${achievementId}`,
          userId,
          achievementId,
          newProgress,
          shouldUnlock,
          shouldUnlock ? now : null
        ]
      );
    }

    let ua = this.data.userAchievements.find(u => u.userId === userId && u.achievementId === achievementId);
    if (!ua) {
      ua = {
        id: `ua-${userId}-${achievementId}`,
        userId,
        achievementId,
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? now : undefined,
        claimed: false
      };
      this.data.userAchievements.push(ua);
    } else {
      ua.progress = Math.max(ua.progress, newProgress);
      if (shouldUnlock && !ua.unlocked) {
        ua.unlocked = true;
        ua.unlockedAt = now;
      }
    }

    this.saveToDiskImmediate();
    return {
      achievement: {
        ...targetAch,
        progress: ua.progress,
        unlocked: ua.unlocked,
        unlockedAt: ua.unlockedAt
      },
      unlocked: shouldUnlock
    };
  }

  async claimAchievement(userId: string, achievementId: string): Promise<Achievement> {
    const achs = await this.getAchievements(userId);
    const target = achs.find(a => a.id === achievementId);
    if (!target) throw new Error('Achievement not found');
    if (!target.unlocked) throw new Error('Achievement not unlocked');
    if (target.claimed) throw new Error('Achievement already claimed');

    const now = new Date().toISOString();
    if (pool && isPostgresConnected) {
      await query(
        `UPDATE user_achievements
         SET claimed = true, claimed_at = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND achievement_id = $2`,
        [userId, achievementId]
      );
    }

    const ua = this.data.userAchievements.find(u => u.userId === userId && u.achievementId === achievementId);
    if (ua) {
      ua.claimed = true;
      ua.claimedAt = now;
      this.saveToDiskImmediate();
    }

    return {
      ...target,
      claimed: true,
      claimedAt: now
    };
  }

  // --- ACTIVITY LOGS ---
  async getActivityLogs(userId: string, limit: number = 20, offset: number = 0): Promise<ActivityLog[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset]
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        actionType: r.action_type,
        title: r.title,
        description: r.description,
        xpEarned: r.xp_earned,
        goldEarned: r.gold_earned,
        metadata: r.metadata,
        createdAt: new Date(r.created_at).toISOString()
      }));
    }
    return this.data.activityLogs.filter(a => a.userId === userId).slice(offset, offset + limit);
  }

  async logActivity(item: ActivityLog): Promise<void> {
    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO activity_logs (id, user_id, action_type, title, description, xp_earned, gold_earned, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          item.id,
          item.userId,
          item.actionType,
          item.title,
          item.description,
          item.xpEarned || 0,
          item.goldEarned || 0,
          JSON.stringify(item.metadata || {}),
          item.createdAt
        ]
      );
    }
    this.data.activityLogs.unshift(item);
    this.saveToDiskImmediate();
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        message: r.message,
        type: r.type,
        read: r.read,
        rewardXp: r.reward_xp,
        rewardGold: r.reward_gold,
        timestamp: new Date(r.created_at).toISOString()
      }));
    }
    return this.data.notifications.filter(n => n.userId === userId);
  }

  async addNotification(item: Omit<NotificationItem, 'id'> & { id?: string; userId: string }): Promise<NotificationItem> {
    const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const notif: NotificationItem = {
      ...item,
      id
    };

    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO notifications (id, user_id, title, message, type, read, reward_xp, reward_gold, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          item.userId,
          item.title,
          item.message,
          item.type,
          item.read || false,
          item.rewardXp || null,
          item.rewardGold || null,
          item.timestamp || new Date().toISOString()
        ]
      );
    }

    this.data.notifications.unshift(notif);
    this.saveToDiskImmediate();
    return notif;
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
    if (pool && isPostgresConnected) {
      await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [notificationId, userId]);
    }
    const target = this.data.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (target) {
      target.read = true;
      this.saveToDiskImmediate();
      return true;
    }
    return false;
  }

  async clearNotifications(userId: string): Promise<boolean> {
    if (pool && isPostgresConnected) {
      await query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    }
    this.data.notifications = this.data.notifications.filter(n => n.userId !== userId);
    this.saveToDiskImmediate();
    return true;
  }

  // --- DAILY MISSIONS ---
  async getDailyMissions(userId: string): Promise<DailyMission[]> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>(
        'SELECT * FROM daily_missions WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          category: r.category,
          durationMinutes: r.duration_minutes,
          completed: r.completed,
          xp: r.xp,
          gold: r.gold
        }));
      }
    }

    let missions = this.data.dailyMissions.filter(m => m.userId === userId);
    if (missions.length === 0) {
      const seedMissions: Omit<DailyMission, 'id'>[] = [
        { userId, title: 'Complete 1 Focused Deep Work Block', category: 'study', durationMinutes: 45, completed: false, xp: 50, gold: 20 },
        { userId, title: 'Hit Daily Physical Activity Target', category: 'fitness', durationMinutes: 30, completed: false, xp: 40, gold: 15 },
        { userId, title: 'Read 15 Pages of Technical / Book Material', category: 'reading', durationMinutes: 20, completed: false, xp: 35, gold: 15 },
        { userId, title: 'Review & Plan Next Day Objectives', category: 'personal', durationMinutes: 10, completed: false, xp: 25, gold: 10 }
      ];

      missions = [];
      for (const sm of seedMissions) {
        const id = `dm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const m: DailyMission = { ...sm, id };
        missions.push(m);
        this.data.dailyMissions.push(m);

        if (pool && isPostgresConnected) {
          await query(
            `INSERT INTO daily_missions (id, user_id, title, category, duration_minutes, completed, xp, gold, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [id, userId, m.title, m.category, m.durationMinutes, false, m.xp, m.gold]
          );
        }
      }
      this.saveToDiskImmediate();
    }
    return missions;
  }

  async toggleDailyMission(userId: string, missionId: string): Promise<DailyMission> {
    const missions = await this.getDailyMissions(userId);
    const target = missions.find(m => m.id === missionId);
    if (!target) throw new Error('Daily mission not found');

    const nextCompleted = !target.completed;
    target.completed = nextCompleted;

    if (pool && isPostgresConnected) {
      await query(
        'UPDATE daily_missions SET completed = $1 WHERE id = $2 AND user_id = $3',
        [nextCompleted, missionId, userId]
      );
    }

    const local = this.data.dailyMissions.find(m => m.id === missionId && m.userId === userId);
    if (local) {
      local.completed = nextCompleted;
      this.saveToDiskImmediate();
    }

    return target;
  }

  // --- GOOGLE CALENDAR CONNECTIONS ---
  async getCalendarConnection(userId: string): Promise<CalendarConnectionRecord | null> {
    if (pool && isPostgresConnected) {
      const rows = await query<any>('SELECT * FROM calendar_connections WHERE user_id = $1', [userId]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userId: r.user_id,
          connected: r.connected,
          status: r.status,
          accountEmail: r.account_email,
          accessToken: r.access_token || undefined,
          refreshToken: r.refresh_token || undefined,
          tokenExpiry: r.token_expiry ? new Date(r.token_expiry).toISOString() : undefined,
          scope: r.scope || undefined,
          lastSync: r.last_sync ? new Date(r.last_sync).toISOString() : undefined
        };
      }
      return null;
    }
    return this.data.calendarConnections[userId] || null;
  }

  async setCalendarConnection(userId: string, record: Partial<Omit<CalendarConnectionRecord, 'id' | 'userId'>>): Promise<CalendarConnectionRecord> {
    const id = `calconn-${userId}`;
    const existing = await this.getCalendarConnection(userId);
    const entry: CalendarConnectionRecord = {
      id,
      userId,
      connected: record.connected !== undefined ? record.connected : (existing?.connected ?? false),
      status: record.status || existing?.status || 'NOT_CONNECTED',
      accountEmail: record.accountEmail !== undefined ? record.accountEmail : existing?.accountEmail,
      accessToken: record.accessToken !== undefined ? record.accessToken : existing?.accessToken,
      refreshToken: record.refreshToken !== undefined ? record.refreshToken : existing?.refreshToken,
      tokenExpiry: record.tokenExpiry !== undefined ? record.tokenExpiry : existing?.tokenExpiry,
      scope: record.scope !== undefined ? record.scope : existing?.scope,
      lastSync: record.lastSync !== undefined ? record.lastSync : existing?.lastSync
    };

    if (pool && isPostgresConnected) {
      await query(
        `INSERT INTO calendar_connections (id, user_id, connected, status, account_email, access_token, refresh_token, token_expiry, scope, last_sync, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           connected = EXCLUDED.connected,
           status = EXCLUDED.status,
           account_email = EXCLUDED.account_email,
           access_token = COALESCE(EXCLUDED.access_token, calendar_connections.access_token),
           refresh_token = COALESCE(EXCLUDED.refresh_token, calendar_connections.refresh_token),
           token_expiry = COALESCE(EXCLUDED.token_expiry, calendar_connections.token_expiry),
           scope = COALESCE(EXCLUDED.scope, calendar_connections.scope),
           last_sync = EXCLUDED.last_sync,
           updated_at = NOW()`,
        [
          id,
          userId,
          entry.connected,
          entry.status,
          entry.accountEmail || null,
          entry.accessToken || null,
          entry.refreshToken || null,
          entry.tokenExpiry || null,
          entry.scope || null,
          entry.lastSync || null
        ]
      );
    }

    this.data.calendarConnections[userId] = entry;
    this.saveToDiskImmediate();
    return entry;
  }
}

export const rpgStore = new RpgStore();
