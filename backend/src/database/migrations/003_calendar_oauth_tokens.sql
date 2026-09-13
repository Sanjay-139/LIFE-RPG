-- LIFE RPG MIGRATION 003: Calendar OAuth Tokens
-- Adds OAuth 2.0 token storage and expiration tracking for Google Calendar integration

ALTER TABLE calendar_connections ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE calendar_connections ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE calendar_connections ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMPTZ;
ALTER TABLE calendar_connections ADD COLUMN IF NOT EXISTS scope TEXT;
