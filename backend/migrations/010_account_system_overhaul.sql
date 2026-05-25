-- Migration 010: NATIF OMS Account System Overhaul
-- 17 canonical roles, account lifecycle, invitations, email governance

-- ============================================================
-- Canonical account enums via CHECK constraints
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS canonical_role VARCHAR(64),
  ADD COLUMN IF NOT EXISTS legacy_role VARCHAR(32),
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(32) DEFAULT 'external',
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(32) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS organization_type VARCHAR(64),
  ADD COLUMN IF NOT EXISTS tax_code VARCHAR(64),
  ADD COLUMN IF NOT EXISTS department VARCHAR(255),
  ADD COLUMN IF NOT EXISTS position_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS invitation_token_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP;

UPDATE users SET legacy_role = role WHERE legacy_role IS NULL;

UPDATE users SET canonical_role = CASE role
  WHEN 'admin' THEN 'chief_system_architect'
  WHEN 'moderator' THEN 'admin_desk'
  WHEN 'enterprise' THEN 'external_partner'
  WHEN 'expert' THEN 'independent_expert'
  WHEN 'officer' THEN 'grants_orders_specialist'
  WHEN 'dept_head' THEN 'department_manager'
  WHEN 'director' THEN 'natif_executive'
  WHEN 'clerk' THEN 'admin_desk'
  ELSE 'external_partner'
END
WHERE canonical_role IS NULL;

UPDATE users SET account_type = CASE canonical_role
  WHEN 'external_partner' THEN 'external'
  WHEN 'independent_expert' THEN 'expert'
  WHEN 'scientific_council' THEN 'expert'
  ELSE 'internal'
END
WHERE account_type IS NULL;

UPDATE users SET account_status = CASE
  WHEN deleted_at IS NOT NULL THEN 'deleted'
  WHEN is_active = false THEN 'deactivated'
  WHEN email_verified_at IS NULL AND canonical_role IN ('external_partner', 'independent_expert') THEN 'pending_verification'
  ELSE 'active'
END
WHERE account_status IS NULL OR account_status = 'active';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_canonical_role_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_canonical_role_check CHECK (canonical_role IN (
      'chief_system_architect',
      'fullstack_developer',
      'devsecops_security',
      'data_ai_scientist',
      'natif_executive',
      'department_manager',
      'grants_orders_specialist',
      'voucher_startup_specialist',
      'finance_disbursement',
      'legal_risk_control',
      'admin_desk',
      'it_sysadmin_support',
      'scientific_council',
      'independent_expert',
      'financial_appraiser',
      'independent_auditor',
      'external_partner'
    ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_account_type_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_account_type_check CHECK (account_type IN ('internal','external','expert','partner','system'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_account_status_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_account_status_check CHECK (account_status IN ('invited','pending_verification','pending_approval','active','suspended','deactivated','deleted'));
  END IF;
END $$;

-- ============================================================
-- Role permissions registry
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(64) NOT NULL,
  permission_code VARCHAR(128) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_code, permission_code)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_code);

-- ============================================================
-- Future-proof multi-role assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code VARCHAR(64) NOT NULL,
  scope_type VARCHAR(64),
  scope_id UUID,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_code, scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role ON user_role_assignments(role_code) WHERE is_active = true;

INSERT INTO user_role_assignments (user_id, role_code, assigned_at, is_active)
SELECT id, canonical_role, NOW(), true
FROM users
WHERE canonical_role IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- Account activity audit
-- ============================================================
CREATE TABLE IF NOT EXISTS account_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  old_value JSONB DEFAULT '{}',
  new_value JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_activity_user ON account_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_activity_action ON account_activity_logs(action, created_at DESC);

-- ============================================================
-- Email suppression + quota governance
-- ============================================================
CREATE TABLE IF NOT EXISTS email_suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  reason VARCHAR(64) NOT NULL CHECK (reason IN ('bounce','complaint','unsubscribe','manual','invalid')),
  source VARCHAR(64) DEFAULT 'system',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_suppression_email ON email_suppression_list(email);

CREATE TABLE IF NOT EXISTS email_quota_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type VARCHAR(16) NOT NULL CHECK (period_type IN ('day','month')),
  period_key VARCHAR(16) NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  quota_limit INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(period_type, period_key)
);

-- Enhance email logs if missing fields
ALTER TABLE email_logs
  ADD COLUMN IF NOT EXISTS priority VARCHAR(16) DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS account_event BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS suppressed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(32) DEFAULT 'resend';

-- ============================================================
-- Account lifecycle email templates
-- ============================================================
INSERT INTO email_templates (code, name, subject_template, body_template, variables) VALUES
(
  'account.external_partner.registered',
  'Đăng ký doanh nghiệp thành công',
  '[NATIF] Đăng ký tài khoản thành công',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Tài khoản doanh nghiệp/đối tác của Quý đơn vị đã được tạo trên hệ thống NATIF OMS.</p>\n<p><strong>Đơn vị:</strong> {{organization_name}}</p>\n<p>Vui lòng xác minh email để hoàn tất kích hoạt tài khoản.</p>\n<p><a href="{{verification_url}}">Xác minh email</a></p>',
  '["user_name","organization_name","verification_url"]'
),
(
  'account.email.verification',
  'Xác minh email tài khoản',
  '[NATIF] Mã xác minh email - {{code}}',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Mã xác minh email của bạn:</p>\n<h2 style="letter-spacing:6px;color:#1f3892">{{code}}</h2>\n<p>Mã có hiệu lực trong 24 giờ.</p>\n<p><a href="{{verification_url}}">Xác minh ngay</a></p>',
  '["user_name","code","verification_url"]'
),
(
  'account.internal.invited',
  'Mời tài khoản nội bộ',
  '[NATIF] Mời kích hoạt tài khoản hệ thống',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Bạn được mời tham gia hệ thống NATIF OMS với vai trò <strong>{{role_label}}</strong>.</p>\n<p>Vui lòng kích hoạt tài khoản trước ngày <strong>{{expires_at}}</strong>.</p>\n<p><a href="{{invitation_url}}">Kích hoạt tài khoản</a></p>',
  '["user_name","role_label","expires_at","invitation_url"]'
),
(
  'account.expert.invited',
  'Mời chuyên gia tham gia hệ thống',
  '[NATIF] Mời chuyên gia tham gia đánh giá',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>NATIF trân trọng mời Ông/Bà tham gia hệ thống chuyên gia đánh giá hồ sơ.</p>\n<p>Vui lòng đăng ký/kích hoạt tài khoản và cập nhật hồ sơ khoa học (CV).</p>\n<p><a href="{{invitation_url}}">Tham gia hệ thống</a></p>',
  '["user_name","invitation_url"]'
),
(
  'account.expert.registered',
  'Chuyên gia đăng ký tài khoản',
  '[NATIF] Đã ghi nhận đăng ký chuyên gia',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Hệ thống đã ghi nhận đăng ký tài khoản chuyên gia của Ông/Bà.</p>\n<p>Vui lòng cập nhật đầy đủ CV khoa học để NATIF xem xét phê duyệt.</p>\n<p><a href="{{profile_url}}">Cập nhật CV</a></p>',
  '["user_name","profile_url"]'
),
(
  'account.expert.cv_updated',
  'Chuyên gia cập nhật CV',
  '[NATIF] Hồ sơ chuyên gia đã được cập nhật',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>CV/hồ sơ chuyên gia của Ông/Bà đã được cập nhật thành công trên NATIF OMS.</p>\n<p>NATIF sẽ sử dụng thông tin này trong quá trình mời đánh giá hồ sơ phù hợp chuyên môn.</p>',
  '["user_name"]'
),
(
  'account.approved',
  'Tài khoản được phê duyệt',
  '[NATIF] Tài khoản đã được phê duyệt',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Tài khoản NATIF OMS của bạn đã được phê duyệt.</p>\n<p><a href="{{login_url}}">Đăng nhập hệ thống</a></p>',
  '["user_name","login_url"]'
),
(
  'account.status_changed',
  'Trạng thái tài khoản thay đổi',
  '[NATIF] Cập nhật trạng thái tài khoản',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Trạng thái tài khoản của bạn đã được cập nhật: <strong>{{account_status}}</strong>.</p>\n<p>{{reason}}</p>',
  '["user_name","account_status","reason"]'
),
(
  'account.password.changed',
  'Mật khẩu đã thay đổi',
  '[NATIF] Mật khẩu tài khoản đã được thay đổi',
  E'<p>Kính gửi <strong>{{user_name}}</strong>,</p>\n<p>Mật khẩu tài khoản NATIF OMS của bạn đã được thay đổi.</p>\n<p>Nếu không phải bạn thực hiện, vui lòng liên hệ quản trị hệ thống ngay.</p>',
  '["user_name"]'
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_canonical_role ON users(canonical_role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_invitation_token_hash ON users(invitation_token_hash) WHERE invitation_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tax_code ON users(tax_code) WHERE tax_code IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN users.canonical_role IS 'NATIF OMS canonical 17-role model';
COMMENT ON COLUMN users.legacy_role IS 'Backward-compatible role value before canonical role migration';
COMMENT ON TABLE role_permissions IS 'Canonical RBAC permission registry for 17 NATIF OMS roles';
COMMENT ON TABLE user_role_assignments IS 'Future-proof multi-role assignment with scope';
COMMENT ON TABLE account_activity_logs IS 'Account lifecycle and security audit logs';
COMMENT ON TABLE email_suppression_list IS 'Email addresses suppressed due to bounce/complaint/unsubscribe/manual action';
COMMENT ON TABLE email_quota_counters IS 'Daily/monthly email quota counters';
