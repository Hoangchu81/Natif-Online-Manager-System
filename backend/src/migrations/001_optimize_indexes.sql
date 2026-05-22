-- Migration: optimize_indexes
-- Description: Add composite indexes, fix status constraint, add missing indexes
-- Created: 2026-05-22

-- 1. Index for users.email lookup (used in auth, assignments, reviews)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);

-- 2. Composite indexes for applications filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status
  ON applications(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_status_created
  ON applications(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_type_status
  ON applications(user_id, program_type, status);

-- 3. Index for expert_assignments filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_assignments_expert_status
  ON expert_assignments(expert_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_assignments_status_created
  ON expert_assignments(status, created_at DESC);

-- 4. Index for expert_reviews by expert
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_reviews_expert_created
  ON expert_reviews(expert_id, created_at DESC);

-- 5. Index for application_workflow history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_workflow_app_created
  ON application_workflow(application_id, created_at ASC);

-- 6. Partial index for active users (most queries filter by active users)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active
  ON users(email)
  WHERE role != 'deleted';

-- 7. Index for news by published date and category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_category_published
  ON news(category, published_at DESC);

-- 8. Fix CHECK constraint on applications.status to match workflow states
-- First check current constraint name
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'applications'::regclass
    AND contype = 'c'
    AND conname LIKE '%status%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE applications
    ADD CONSTRAINT applications_status_check
    CHECK (status IN (
      'draft', 'submitted', 'received', 'assigned',
      'preliminary_review', 'expert_review', 'summarized',
      'dept_approved', 'dept_rejected',
      'approved', 'rejected', 'returned'
    ));
END $$;

-- 9. Add comment for documentation
COMMENT ON INDEX idx_applications_user_status IS 'Composite index for getApplications query with user_id + status filter';
COMMENT ON INDEX idx_applications_status_created IS 'Composite index for dashboard stats and sorting by status + date';
COMMENT ON INDEX idx_users_email IS 'Index for auth lookups and JOIN operations';
