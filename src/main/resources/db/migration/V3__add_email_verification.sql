-- Email verification for new signups.
-- Existing accounts are treated as verified so this change does not lock them out.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expiry TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
    ON users (email_verification_token);
