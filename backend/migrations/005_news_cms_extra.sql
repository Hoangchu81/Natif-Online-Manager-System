-- Migration 005: News CMS Extra Columns
-- Adds is_featured, created_by columns to news, is_active to news_categories
-- Fixes news_category_check constraint to allow proper category slugs

-- Fix category constraint to allow both old slugs and new slugs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_category_check') THEN
    ALTER TABLE news DROP CONSTRAINT news_category_check;
  END IF;
END $$;
ALTER TABLE news ADD CONSTRAINT news_category_check CHECK (
  category IN ('hoat-dong', 'cong-nghe', 'thong-bao', 'tech', 'activity', 'announcement')
  OR category IS NULL
);

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE news_categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set published_at for existing published articles
UPDATE news SET published_at = NOW() WHERE status = 'published' AND published_at IS NULL;

-- Backfill created_by from existing articles using the first user found
UPDATE news SET created_by = (
  SELECT id FROM users WHERE role = 'admin' LIMIT 1
) WHERE created_by IS NULL;
