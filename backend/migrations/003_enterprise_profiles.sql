-- ============================================================
-- Migration 003: Enterprise profiles + document management
-- Based on Điều 11, Nghị định 268/2025/NĐ-CP (Phụ lục I)
-- ============================================================

BEGIN;

-- 1. Add is_verified to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Enterprise profiles — detailed company info
CREATE TABLE IF NOT EXISTS enterprise_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Company Legal Info (Điều 11, mục 3 — tư cách pháp lý)
  company_name VARCHAR(500) NOT NULL,
  tax_code VARCHAR(20) NOT NULL UNIQUE,
  company_address TEXT,
  district VARCHAR(255),
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  company_type VARCHAR(100), -- CTCP, TNHH, DN tư nhân, Hợp tác xã...
  founding_date DATE,
  business_lines TEXT,
  employee_count INTEGER,
  charter_capital NUMERIC(18,2),
  total_assets NUMERIC(18,2),
  -- Legal Representative
  rep_name VARCHAR(255),
  rep_position VARCHAR(255),
  rep_id_no VARCHAR(20),
  rep_id_issued_date DATE,
  rep_id_issued_place VARCHAR(255),
  rep_phone VARCHAR(50),
  rep_email VARCHAR(255),
  -- Bank Info
  bank_name VARCHAR(255),
  bank_branch VARCHAR(255),
  bank_account_no VARCHAR(50),
  bank_account_name VARCHAR(255),
  -- Registration documents (Điều 11, mục 3)
  doc_dkkd_url TEXT,           -- Quyết định thành lập / Điều lệ
  doc_dkkd_uploaded_at TIMESTAMPTZ,
  -- Business registration status
  verification_status VARCHAR(20) DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'submitted', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enterprise_profiles_user ON enterprise_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_profiles_tax ON enterprise_profiles(tax_code);

-- 3. Application documents (theo Điều 11: 6 loại tài liệu bắt buộc)
-- Document types theo Phụ lục I:
--   type_1: Đơn đăng ký (Mẫu I.1)
--   type_2: Thuyết minh nhiệm vụ (Mẫu I.2-I.5)
--   type_3: Tài liệu chứng minh tư cách pháp lý (Điều lệ / QD thành lập)
--   type_4: Văn bản cam kết (Mẫu I.6)
--   type_5: Hồ sơ dự án đầu tư (nếu có)
--   type_6: Tài liệu khác theo yêu cầu
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type VARCHAR(30) NOT NULL
    CHECK (document_type IN (
      'don_dang_ky',       -- type_1: Mẫu I.1
      'thuyet_minh_nhiem_vu', -- type_2: Mẫu I.2-I.5
      'tu_cach_phap_ly',   -- type_3: Điều lệ / QD thành lập
      'cam_ket',           -- type_4: Mẫu I.6
      'ho_so_du_an',       -- type_5: Hồ sơ dự án đầu tư
      'tai_lieu_khac',     -- type_6: Tài liệu bổ sung
      'quyet_dinh_thanh_lap', -- Refined version of type_3
      'giay_phep_kinh_doanh',
      'bao_cao_tai_chinh',
      'ho_so_khac'
    )),
  file_name VARCHAR(500),
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'uploaded'
    CHECK (status IN ('pending', 'uploaded', 'verified', 'rejected')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_docs_application ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_type ON application_documents(document_type);

-- 4. Track document checklist per application — which doc types are required
ALTER TABLE applications ADD COLUMN IF NOT EXISTS document_checklist JSONB DEFAULT '[]'::jsonb;

-- 5. Add submitted_by for tracking enterprise who submitted
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL;

COMMIT;
