-- LIFE RPG MIGRATION 002: Master RPG Enhancements
-- Adds Level 0 support, 100 initial coins, timezone, preferences, and Google Calendar tables

-- 1. Update user_profiles level constraint to allow Level 0
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_current_level_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_current_level_check CHECK (current_level >= 0);
ALTER TABLE user_profiles ALTER COLUMN current_level SET DEFAULT 0;
ALTER TABLE user_profiles ALTER COLUMN gold SET DEFAULT 100;

-- 2. Add timezone, preferences, and Google linking columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"sound": true, "celebrations": true, "notifications": true}'::jsonb;

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 3. Google Calendar Integration Table
CREATE TABLE IF NOT EXISTS calendar_connections (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connected BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'NOT_CONNECTED' CHECK (status IN ('NOT_CONNECTED', 'CONNECTED', 'REAUTHORIZATION_REQUIRED')),
    account_email VARCHAR(255),
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_connections_user ON calendar_connections(user_id);
