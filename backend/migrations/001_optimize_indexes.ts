/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  // 1. Index for users.email lookup (used in auth, assignments, reviews)
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)`);

  // 2. Composite indexes for applications filtering
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status ON applications(user_id, status)`);
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_status_created ON applications(status, created_at DESC)`);
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_type_status ON applications(user_id, program_type, status)`);

  // 3. Index for expert_assignments filtering
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_assignments_expert_status ON expert_assignments(expert_id, status)`);
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_assignments_status_created ON expert_assignments(status, created_at DESC)`);

  // 4. Index for expert_reviews by expert
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_reviews_expert_created ON expert_reviews(expert_id, created_at DESC)`);

  // 5. Index for application_workflow history
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_workflow_app_created ON application_workflow(application_id, created_at ASC)`);

  // 6. Index for news by published date and category
  await db.schema.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_category_published ON news(category, published_at DESC)`);

  // 7. Fix CHECK constraint on applications.status to match workflow states
  await db.schema.raw(`
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
  `);
}

export async function down(db: Knex): Promise<void> {
  await db.schema.raw('DROP INDEX IF EXISTS idx_users_email');
  await db.schema.raw('DROP INDEX IF EXISTS idx_applications_user_status');
  await db.schema.raw('DROP INDEX IF EXISTS idx_applications_status_created');
  await db.schema.raw('DROP INDEX IF EXISTS idx_applications_user_type_status');
  await db.schema.raw('DROP INDEX IF EXISTS idx_expert_assignments_expert_status');
  await db.schema.raw('DROP INDEX IF EXISTS idx_expert_assignments_status_created');
  await db.schema.raw('DROP INDEX IF EXISTS idx_expert_reviews_expert_created');
  await db.schema.raw('DROP INDEX IF EXISTS idx_application_workflow_app_created');
  await db.schema.raw('DROP INDEX IF EXISTS idx_news_category_published');
  await db.schema.raw('ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check');
}
