-- ============================================================
-- Migration 002: Full workflow redesign based on Nghị định 268/2025
-- Workflow: draft→submitted→received→director_review→dept_assigned→preliminary_review→action_taken→council_evaluation→summarized→dept_approved→approved
-- ============================================================

BEGIN;

-- 1. Drop old check constraint, add new status check
ALTER TABLE applications DROP CONSTRAINT applications_status_check;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check CHECK (
  status IN (
    'draft',
    'submitted',
    'received',
    'director_review',
    'dept_assigned',
    'preliminary_review',
    'action_taken',
    'supplementary_requested',
    'survey_conducted',
    'council_evaluation',
    'summarized',
    'dept_approved',
    'approved',
    'rejected',
    'returned'
  )
);

-- 2. Add new columns to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS scenario VARCHAR(30);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS dept_head_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS officer_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS proposal_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS director_decision_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS survey_completed_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS supplementary_deadline TIMESTAMPTZ;

-- 3. Create councils table
CREATE TABLE IF NOT EXISTS councils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name VARCHAR(255),
  evaluation_deadline DATE,
  formed_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_councils_application ON councils(application_id);

-- 4. Create council_members table
CREATE TABLE IF NOT EXISTS council_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  council_id UUID NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  expert_name VARCHAR(255),
  expert_email VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('chairman', 'member', 'secretary', 'enterprise_rep')),
  responsibility VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_council_members_council ON council_members(council_id);

-- 5. Create council_meetings table
CREATE TABLE IF NOT EXISTS council_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  council_id UUID NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  meeting_date DATE,
  meeting_location VARCHAR(255),
  attendees TEXT,
  discussion_summary TEXT,
  recommendation VARCHAR(20) CHECK (recommendation IN ('approve', 'reject', 'revise', 'defer')),
  recommendation_notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_council_meetings_council ON council_meetings(council_id);
CREATE INDEX IF NOT EXISTS idx_council_meetings_application ON council_meetings(application_id);

-- 6. Add index on applications for new assignment columns
CREATE INDEX IF NOT EXISTS idx_applications_dept_head ON applications(dept_head_id);
CREATE INDEX IF NOT EXISTS idx_applications_officer ON applications(officer_id);
CREATE INDEX IF NOT EXISTS idx_applications_scenario ON applications(scenario);

COMMIT;
