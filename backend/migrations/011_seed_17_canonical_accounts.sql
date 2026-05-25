-- Migration 011: Seed 17 canonical role accounts (idempotent)
-- Password: Natif@2026 (bcrypt hash below)
-- Generated: 2026-05-25

DO $$
DECLARE
  pw_hash TEXT := '$2a$12$lVky6Q7H2W1uiDmZp3bBaO4IsoM1MNBL/0mhqZVt9fRFyNsituBke';
BEGIN
  -- 01. Chief System Architect
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('architect@natif.gov.vn', pw_hash, '01. Chief System Architect', 'admin', 'admin', 'chief_system_architect', 'system', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'CDH/BMad', 'Chief System Architect', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='chief_system_architect', account_type='system', account_status='active', department='CDH/BMad', position_title='Chief System Architect', is_verified=true, updated_at=NOW();

  -- 02. Full-Stack Developer
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('fullstack@natif.gov.vn', pw_hash, '02. Full-Stack Developer', 'admin', 'admin', 'fullstack_developer', 'system', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Engineering', 'Full-Stack Developer', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='fullstack_developer', account_type='system', account_status='active', department='Engineering', position_title='Full-Stack Developer', is_verified=true, updated_at=NOW();

  -- 03. DevSecOps and Security
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('devsecops@natif.gov.vn', pw_hash, '03. DevSecOps and Security', 'admin', 'admin', 'devsecops_security', 'system', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Security', 'DevSecOps/Security Lead', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='devsecops_security', account_type='system', account_status='active', department='Security', position_title='DevSecOps/Security Lead', is_verified=true, updated_at=NOW();

  -- 04. Data Scientist and AI
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('data-ai@natif.gov.vn', pw_hash, '04. Data Scientist and AI', 'admin', 'admin', 'data_ai_scientist', 'system', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Data/AI', 'Data Scientist/AI Lead', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='data_ai_scientist', account_type='system', account_status='active', department='Data/AI', position_title='Data Scientist/AI Lead', is_verified=true, updated_at=NOW();

  -- 05. NATIF Executive
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('executive@natif.gov.vn', pw_hash, '05. NATIF Executive', 'director', 'director', 'natif_executive', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Ban lãnh đạo', 'Lãnh đạo NATIF', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='natif_executive', account_type='internal', account_status='active', department='Ban lãnh đạo', position_title='Lãnh đạo NATIF', is_verified=true, updated_at=NOW();

  -- 06. Department Manager
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('manager@natif.gov.vn', pw_hash, '06. Department Manager', 'dept_head', 'dept_head', 'department_manager', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Phòng nghiệp vụ', 'Lãnh đạo phòng/ban', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='department_manager', account_type='internal', account_status='active', department='Phòng nghiệp vụ', position_title='Lãnh đạo phòng/ban', is_verified=true, updated_at=NOW();

  -- 07. Grants and Orders Specialist
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('grants@natif.gov.vn', pw_hash, '07. Grants and Orders Specialist', 'officer', 'officer', 'grants_orders_specialist', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Tài trợ/Đặt hàng', 'Chuyên viên tài trợ/đặt hàng', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='grants_orders_specialist', account_type='internal', account_status='active', department='Tài trợ/Đặt hàng', position_title='Chuyên viên tài trợ/đặt hàng', is_verified=true, updated_at=NOW();

  -- 08. Voucher and Startup Specialist
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('voucher@natif.gov.vn', pw_hash, '08. Voucher and Startup Specialist', 'officer', 'officer', 'voucher_startup_specialist', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Voucher/Startup', 'Chuyên viên voucher/startup', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='voucher_startup_specialist', account_type='internal', account_status='active', department='Voucher/Startup', position_title='Chuyên viên voucher/startup', is_verified=true, updated_at=NOW();

  -- 09. Finance and Disbursement
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('finance@natif.gov.vn', pw_hash, '09. Finance and Disbursement', 'officer', 'officer', 'finance_disbursement', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Tài chính', 'Tài chính/giải ngân', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='finance_disbursement', account_type='internal', account_status='active', department='Tài chính', position_title='Tài chính/giải ngân', is_verified=true, updated_at=NOW();

  -- 10. Legal and Risk Control
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('legal@natif.gov.vn', pw_hash, '10. Legal and Risk Control', 'officer', 'officer', 'legal_risk_control', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Pháp chế', 'Pháp chế/kiểm soát rủi ro', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='legal_risk_control', account_type='internal', account_status='active', department='Pháp chế', position_title='Pháp chế/kiểm soát rủi ro', is_verified=true, updated_at=NOW();

  -- 11. Admin Desk
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('desk@natif.gov.vn', pw_hash, '11. Admin Desk', 'clerk', 'clerk', 'admin_desk', 'internal', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Văn thư', 'Văn thư/tiếp nhận', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='admin_desk', account_type='internal', account_status='active', department='Văn thư', position_title='Văn thư/tiếp nhận', is_verified=true, updated_at=NOW();

  -- 12. IT SysAdmin and Support
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('sysadmin@natif.gov.vn', pw_hash, '12. IT SysAdmin and Support', 'admin', 'admin', 'it_sysadmin_support', 'system', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'CNTT', 'CNTT/hỗ trợ', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='it_sysadmin_support', account_type='system', account_status='active', department='CNTT', position_title='CNTT/hỗ trợ', is_verified=true, updated_at=NOW();

  -- 13. Scientific Council
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('council@natif.gov.vn', pw_hash, '13. Scientific Council', 'expert', 'expert', 'scientific_council', 'expert', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Hội đồng khoa học', 'Thành viên hội đồng KH', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='scientific_council', account_type='expert', account_status='active', department='Hội đồng khoa học', position_title='Thành viên hội đồng KH', is_verified=true, updated_at=NOW();

  -- 14. Independent Expert
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('independent-expert@natif.gov.vn', pw_hash, '14. Independent Expert', 'expert', 'expert', 'independent_expert', 'expert', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Chuyên gia', 'Chuyên gia độc lập', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='independent_expert', account_type='expert', account_status='active', department='Chuyên gia', position_title='Chuyên gia độc lập', is_verified=true, updated_at=NOW();

  -- 15. Financial Appraiser
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('appraiser@natif.gov.vn', pw_hash, '15. Financial Appraiser', 'expert', 'expert', 'financial_appraiser', 'expert', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Thẩm định tài chính', 'Thẩm định tài chính', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='financial_appraiser', account_type='expert', account_status='active', department='Thẩm định tài chính', position_title='Thẩm định tài chính', is_verified=true, updated_at=NOW();

  -- 16. Independent Auditor
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('auditor@natif.gov.vn', pw_hash, '16. Independent Auditor', 'expert', 'expert', 'independent_auditor', 'expert', 'active', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia', 'Quỹ Đổi mới công nghệ quốc gia', 'Kiểm toán/Giám sát', 'Kiểm toán/giám sát độc lập', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='independent_auditor', account_type='expert', account_status='active', department='Kiểm toán/Giám sát', position_title='Kiểm toán/giám sát độc lập', is_verified=true, updated_at=NOW();

  -- 17. External Partner
  INSERT INTO users (email, password_hash, full_name, role, legacy_role, canonical_role, account_type, account_status, phone, company, organization_name, department, position_title, is_verified, verified_at)
  VALUES ('partner@natif.gov.vn', pw_hash, '17. External Partner', 'enterprise', 'enterprise', 'external_partner', 'external', 'active', '0913060581', 'Đối tác NATIF', 'Đối tác NATIF', 'Đối tác ngoài', 'Doanh nghiệp/đối tác', true, NOW())
  ON CONFLICT (email) DO UPDATE SET canonical_role='external_partner', account_type='external', account_status='active', department='Đối tác ngoài', position_title='Doanh nghiệp/đối tác', is_verified=true, updated_at=NOW();

  RAISE NOTICE '17 canonical role accounts seeded/updated successfully';
END $$;
