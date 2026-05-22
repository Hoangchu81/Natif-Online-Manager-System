-- Migration 004: News CMS - Categories, Menu, Extended News
-- Supports: WYSIWYG news, categories, site menu management

-- 1. Extend news table
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 2. News categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Site menus table
CREATE TABLE IF NOT EXISTS site_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  icon VARCHAR(100),
  parent_id UUID REFERENCES site_menus(id) ON DELETE CASCADE,
  position VARCHAR(30) DEFAULT 'header' CHECK (position IN ('header', 'footer', 'sidebar')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Seed default categories
INSERT INTO news_categories (name, slug, description, sort_order) VALUES
  ('Tin hoạt động', 'hoat-dong', 'Tin tức về hoạt động của Quỹ NATIF', 1),
  ('Tin công nghệ', 'cong-nghe', 'Tin tức công nghệ và đổi mới sáng tạo', 2),
  ('Thông báo', 'thong-bao', 'Thông báo chính thức từ Quỹ', 3)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed default header menu
INSERT INTO site_menus (label, url, position, sort_order) VALUES
  ('Giới thiệu', '/about', 'header', 1),
  ('Chương trình', '/programs', 'header', 2),
  ('Tin tức', '/news', 'header', 3),
  ('Hướng dẫn', '/news/thong-bao', 'header', 4),
  ('Liên hệ', '/contact', 'header', 5)
ON CONFLICT DO NOTHING;

-- 6. Seed default footer menu
INSERT INTO site_menus (label, url, position, sort_order) VALUES
  ('Giới thiệu', '/about', 'footer', 1),
  ('Chương trình', '/programs', 'footer', 2),
  ('Tin tức', '/news', 'footer', 3),
  ('Chính sách bảo mật', '/privacy', 'footer', 4),
  ('Liên hệ', '/contact', 'footer', 5)
ON CONFLICT DO NOTHING;

-- 7. Update existing news records with status
UPDATE news SET status = 'published' WHERE status IS NULL;
