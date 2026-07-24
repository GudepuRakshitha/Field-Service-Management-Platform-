-- Flyway Migration V6: Add active status flag to users table for account activation/deactivation

ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Ensure all existing users are set to active=true
UPDATE users SET active = TRUE WHERE active IS NULL;
