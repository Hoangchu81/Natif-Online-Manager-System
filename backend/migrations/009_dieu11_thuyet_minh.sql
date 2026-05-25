-- ============================================================
-- Migration 009: Điều 11 NĐ 268/2025 — Hồ sơ đề xuất nhiệm vụ ĐMST
-- Adds: funding_mechanism, task_category, declarations to applications
-- Creates: thuyet_minh, noi_dung, san_pham, du_toan, nhom_nghien_cuu, tien_do
-- ============================================================

BEGIN;

-- ─── 1. Extend applications table ─────────────────────────────────────────────

-- Funding mechanism: tài trợ (Quỹ tự làm) vs đặt hàng (gắn chương trình)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS funding_mechanism VARCHAR(20)
  DEFAULT 'tai_tro';

-- Task category per NĐ 268 Điều 5
ALTER TABLE applications ADD COLUMN IF NOT EXISTS task_category VARCHAR(50);

-- Link to program (required for đặt hàng)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program_id UUID;

-- Program order document URL (văn bản giao nhiệm vụ)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program_order_document_url TEXT;

-- Financial fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_budget NUMERIC(18,2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS requested_funding NUMERIC(18,2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS co_funding_amount NUMERIC(18,2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS co_funding_ratio NUMERIC(5,2);

-- Implementation timeline
ALTER TABLE applications ADD COLUMN IF NOT EXISTS implementation_start DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS implementation_end DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS implementation_months INTEGER;

-- Legal declarations (Điều 11 cam kết)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decl_no_duplicate_funding BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decl_self_responsibility BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decl_proper_use BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS declaration_signed_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS declaration_ip_address INET;

-- Legal basis tracking
ALTER TABLE applications ADD COLUMN IF NOT EXISTS legal_basis_decree VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS legal_basis_article VARCHAR(50);

-- Field of science/technology
ALTER TABLE applications ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);

-- Principal investigator (chủ nhiệm nhiệm vụ)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_name VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_degree VARCHAR(50);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_title VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_organization VARCHAR(300);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_phone VARCHAR(50);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pi_email VARCHAR(255);

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_funding_mechanism'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT chk_funding_mechanism
      CHECK (funding_mechanism IS NULL OR funding_mechanism IN ('tai_tro', 'dat_hang'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_task_category'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT chk_task_category
      CHECK (task_category IS NULL OR task_category IN (
        'doi_moi_cong_nghe', 'shtt_nang_suat', 'khoi_nghiep', 'lai_suat', 'voucher'
      ));
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_applications_funding_mechanism ON applications(funding_mechanism);
CREATE INDEX IF NOT EXISTS idx_applications_task_category ON applications(task_category);
CREATE INDEX IF NOT EXISTS idx_applications_program_id ON applications(program_id);

-- ─── 2. Thuyết minh nhiệm vụ ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_thuyet_minh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Tổng quan (Phần A)
  tinh_cap_thiet TEXT NOT NULL,
  tong_quan_trong_nuoc TEXT,
  tong_quan_quoc_te TEXT,
  tinh_moi_sang_tao TEXT NOT NULL,

  -- Mục tiêu (Phần B)
  muc_tieu_tong_quat TEXT NOT NULL,
  muc_tieu_cu_the JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Hiệu quả (Phần C)
  hieu_qua_kinh_te TEXT,
  hieu_qua_xa_hoi TEXT,
  hieu_qua_moi_truong TEXT,
  kha_nang_ung_dung TEXT,

  -- Phương án tổ chức (Phần D)
  co_so_vat_chat TEXT,
  hop_tac_quoc_te TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_thuyet_minh_application UNIQUE(application_id)
);

-- ─── 3. Nội dung thực hiện ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_noi_dung (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  noi_dung_so INTEGER NOT NULL,
  ten TEXT NOT NULL,
  mo_ta_chi_tiet TEXT,
  phuong_phap TEXT,
  san_pham_du_kien TEXT,
  nguoi_thuc_hien TEXT,
  thoi_gian_tu DATE,
  thoi_gian_den DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_noi_dung_so UNIQUE(application_id, noi_dung_so)
);

CREATE INDEX IF NOT EXISTS idx_app_noi_dung_app ON application_noi_dung(application_id);

-- ─── 4. Sản phẩm đầu ra ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_san_pham (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  loai VARCHAR(50) NOT NULL
    CHECK (loai IN ('khoa_hoc', 'dao_tao', 'ung_dung', 'shtt')),
  ten TEXT NOT NULL,
  chi_tieu_chat_luong TEXT,
  yeu_cau_ky_thuat TEXT,
  so_luong INTEGER,
  don_vi VARCHAR(50),
  quy_mo TEXT,
  dia_chi_ung_dung TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_san_pham_app ON application_san_pham(application_id);

-- ─── 5. Dự toán kinh phí ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_du_toan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  hang_muc VARCHAR(50) NOT NULL
    CHECK (hang_muc IN (
      'cong_lao_dong', 'nguyen_vat_lieu', 'thiet_bi',
      'cong_tac_phi', 'hoi_thao', 'quan_ly', 'khac'
    )),
  noi_dung TEXT NOT NULL,
  don_vi VARCHAR(50),
  so_luong NUMERIC(10,2),
  don_gia NUMERIC(18,2),
  thanh_tien NUMERIC(18,2) NOT NULL,
  nguon_nsnn NUMERIC(18,2),
  nguon_khac NUMERIC(18,2),
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_du_toan_app ON application_du_toan(application_id);

-- ─── 6. Nhóm nghiên cứu ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_nhom_nghien_cuu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  ho_ten VARCHAR(255) NOT NULL,
  hoc_vi VARCHAR(50),
  chuc_danh VARCHAR(100),
  don_vi_cong_tac VARCHAR(300),
  vai_tro VARCHAR(100) NOT NULL,
  thoi_gian_tham_gia_thang INTEGER,
  so_gio_quy_doi INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_nhom_nc_app ON application_nhom_nghien_cuu(application_id);

-- ─── 7. Tiến độ thực hiện ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_tien_do (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  giai_doan INTEGER NOT NULL,
  noi_dung TEXT NOT NULL,
  san_pham TEXT,
  thoi_gian_tu DATE,
  thoi_gian_den DATE,
  kinh_phi NUMERIC(18,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tien_do_giai_doan UNIQUE(application_id, giai_doan)
);

CREATE INDEX IF NOT EXISTS idx_app_tien_do_app ON application_tien_do(application_id);

COMMIT;
