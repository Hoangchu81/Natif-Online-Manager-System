-- Migration 008: User Enhancements - Password Reset, Email Verification, Soft Delete
-- For NATIF OMS v2

-- ============================================================
-- Add columns to users table
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'verification_code'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_code VARCHAR(10);
    ALTER TABLE users ADD COLUMN verification_expires_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'reset_code'
  ) THEN
    ALTER TABLE users ADD COLUMN reset_code VARCHAR(10);
    ALTER TABLE users ADD COLUMN reset_expires_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
  ELSE
    ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
    UPDATE users SET is_active = true WHERE is_active IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'reset_attempts'
  ) THEN
    ALTER TABLE users ADD COLUMN reset_attempts INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN last_reset_attempt_at TIMESTAMP;
  END IF;
END $$;

-- ============================================================
-- Add notification preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_application_submitted BOOLEAN DEFAULT true,
  email_application_approved BOOLEAN DEFAULT true,
  email_application_rejected BOOLEAN DEFAULT true,
  email_expert_assigned BOOLEAN DEFAULT true,
  email_review_completed BOOLEAN DEFAULT true,
  email_council_meeting BOOLEAN DEFAULT true,
  email_disbursement BOOLEAN DEFAULT true,
  email_report_reminder BOOLEAN DEFAULT true,
  email_other BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Update index on users for soft delete
-- ============================================================
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL AND is_active = true;
