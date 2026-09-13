-- LIFE RPG PRODUCTION DATABASE SCHEMA (Supabase / PostgreSQL)
-- Server-Authoritative Gamified Life Progression System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'adventurer',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT 'Novice Adventurer',
    rank VARCHAR(100) DEFAULT 'Rank F Novice',
    class_type VARCHAR(100) DEFAULT 'Disciplined Warrior',
    bio TEXT,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    gold INTEGER DEFAULT 0 CHECK (gold >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
    freezes_remaining INTEGER DEFAULT 2 CHECK (freezes_remaining >= 0),
    last_activity_date VARCHAR(50),
    onboarding_completed BOOLEAN DEFAULT false,
    attribute_points INTEGER DEFAULT 0 CHECK (attribute_points >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

-- 3. CHARACTER STATS (5 Core Attributes)
CREATE TABLE IF NOT EXISTS character_stats (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attribute_name VARCHAR(50) NOT NULL CHECK (attribute_name IN ('strength', 'intellect', 'vitality', 'discipline', 'charisma')),
    value INTEGER NOT NULL DEFAULT 10 CHECK (value >= 0 AND value <= 100),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    recent_gain INTEGER NOT NULL DEFAULT 0 CHECK (recent_gain >= 0),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, attribute_name)
);

CREATE INDEX IF NOT EXISTS idx_character_stats_user ON character_stats(user_id);

-- 4. QUESTS
CREATE TABLE IF NOT EXISTS quests (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    difficulty VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard', 'epic')),
    estimated_duration INTEGER DEFAULT 30 CHECK (estimated_duration >= 0),
    due_date TIMESTAMPTZ,
    xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
    gold_reward INTEGER NOT NULL DEFAULT 25 CHECK (gold_reward >= 0),
    target_attribute VARCHAR(50) NOT NULL DEFAULT 'discipline',
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue', 'cancelled')),
    repeat_schedule VARCHAR(50) DEFAULT 'none' CHECK (repeat_schedule IN ('none', 'daily', 'weekly', 'weekdays')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    subtasks JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quests_user_status ON quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quests_due_date ON quests(user_id, due_date);

-- 5. QUEST COMPLETIONS (Historical Logs)
CREATE TABLE IF NOT EXISTS quest_completions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id VARCHAR(100) NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    gold_earned INTEGER NOT NULL CHECK (gold_earned >= 0),
    attribute_name VARCHAR(50) NOT NULL,
    attribute_gain INTEGER NOT NULL CHECK (attribute_gain >= 0),
    completion_source VARCHAR(100) DEFAULT 'user_action',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user ON quest_completions(user_id, completed_at);

-- 6. XP HISTORY
CREATE TABLE IF NOT EXISTS xp_history (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(100) NOT NULL,
    source_id VARCHAR(100),
    xp_amount INTEGER NOT NULL CHECK (xp_amount >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user ON xp_history(user_id, created_at);

-- 7. LEVEL HISTORY
CREATE TABLE IF NOT EXISTS level_history (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_level INTEGER NOT NULL,
    new_level INTEGER NOT NULL,
    xp_at_level_up INTEGER NOT NULL,
    unlocked_features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_level_history_user ON level_history(user_id);

-- 8. STREAK HISTORY
CREATE TABLE IF NOT EXISTS streak_history (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date VARCHAR(50) NOT NULL,
    streak_count INTEGER NOT NULL,
    freeze_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_streak_history_user ON streak_history(user_id, activity_date);

-- 9. GOLD TRANSACTIONS
CREATE TABLE IF NOT EXISTS gold_transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gold_transactions_user ON gold_transactions(user_id, created_at);

-- 10. REWARDS (Virtual Economy Bazaar)
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    icon VARCHAR(100) NOT NULL,
    image_url TEXT,
    attribute_buff JSONB,
    equip_slot VARCHAR(50),
    required_level INTEGER DEFAULT 1 CHECK (required_level >= 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);

-- 12. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    max_progress INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    badge_title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements ON user_achievements(user_id, achievement_id);

-- 14. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    gold_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT false,
    reward_xp INTEGER,
    reward_gold INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at);

-- 16. DAILY MISSIONS
CREATE TABLE IF NOT EXISTS daily_missions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    completed BOOLEAN DEFAULT false,
    xp INTEGER DEFAULT 35,
    gold INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user ON daily_missions(user_id);
