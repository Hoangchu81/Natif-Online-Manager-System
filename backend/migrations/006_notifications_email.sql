-- Migration 006: Notifications, Email Logs, Email Templates, Scheduled Reminders
-- For NATIF OMS v2

-- ============================================================
-- TABLE: notifications (In-App Notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'In-app notifications for NATIF OMS users';

-- ============================================================
-- TABLE: email_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  body_text TEXT,
  body_html TEXT,
  template_code VARCHAR(100),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'bounced', 'skipped')),
  resend_message_id VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

COMMENT ON TABLE email_logs IS 'Email delivery tracking for NATIF OMS';

-- ============================================================
-- TABLE: email_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject_template VARCHAR(500) NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_code ON email_templates(code);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

COMMENT ON TABLE email_templates IS 'Email templates with variable placeholders';

-- ============================================================
-- TABLE: scheduled_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(100) NOT NULL,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  data JSONB DEFAULT '{}',
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_pending
  ON scheduled_reminders(scheduled_at)
  WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_app
  ON scheduled_reminders(application_id);

COMMENT ON TABLE scheduled_reminders IS 'Scheduled email reminders for NATIF OMS';

-- ============================================================
-- Seed: Default Email Templates
-- ============================================================
INSERT INTO email_templates (code, name, subject_template, body_template, variables) VALUES

-- Application Lifecycle
(
  'application.submitted.enterprise',
  'Xác nhận nộp hồ sơ - Doanh nghiệp',
  '[NATIF] Xác nhận nộp hồ sơ - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Quỹ Đổi mới công nghệ quốc gia (NATIF) đã tiếp nhận hồ sơ của Quý Doanh nghiệp.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <p style="margin: 0;"><strong>Thông tin hồ sơ:</strong></p>\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Chương trình:</strong> {{program_type_display}}</li>\n        <li><strong>Tên dự án:</strong> {{title}}</li>\n        <li><strong>Doanh nghiệp:</strong> {{company_name}}</li>\n        <li><strong>Mã số thuế:</strong> {{tax_code}}</li>\n        <li><strong>Ngân sách đề nghị:</strong> {{budget_requested_formatted}} VND</li>\n        <li><strong>Ngày nộp:</strong> {{submitted_at}}</li>\n        <li><strong>Mã hồ sơ:</strong> #{{application_id_short}}</li>\n      </ul>\n    </div>\n    <p>Hồ sơ của Quý Doanh nghiệp đang trong giai đoạn xét duyệt. Chúng tôi sẽ thông báo qua email khi có cập nhật tiếp theo.</p>\n    <p style="color: #6b7280; font-size: 13px;"><em>Lưu ý: Thời gian xét duyệt theo quy định tại Nghị định 268/2025/NĐ-CP là không quá 60 ngày làm việc kể từ ngày tiếp nhận đầy đủ hồ sơ.</em></p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Theo dõi tiến độ</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF) | natif.gov.vn</p>\n  </div>\n</div>',
  '["contact_name","title","company_name","tax_code","program_type_display","budget_requested_formatted","submitted_at","application_id_short","app_url"]'
),

(
  'application.submitted.clerk',
  'Thông báo có hồ sơ mới - Clerk',
  '[NATIF] Hồ sơ mới cần tiếp nhận - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{clerk_name}}</strong>,</p>\n    <p>Có hồ sơ mới cần được tiếp nhận.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Tên dự án:</strong> {{title}}</li>\n        <li><strong>Doanh nghiệp:</strong> {{company_name}}</li>\n        <li><strong>Mã số thuế:</strong> {{tax_code}}</li>\n        <li><strong>Ngân sách đề nghị:</strong> {{budget_requested_formatted}} VND</li>\n        <li><strong>Ngày nộp:</strong> {{submitted_at}}</li>\n        <li><strong>Người liên hệ:</strong> {{contact_name}} ({{contact_phone}})</li>\n      </ul>\n    </div>\n    <a href="{{app_url}}/admin/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xử lý hồ sơ</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Thông báo tự động</p>\n  </div>\n</div>',
  '["clerk_name","title","company_name","tax_code","budget_requested_formatted","submitted_at","contact_name","contact_phone","app_url"]'
),

(
  'application.received.enterprise',
  'Hồ sơ được tiếp nhận - Doanh nghiệp',
  '[NATIF] Hồ sơ đã được tiếp nhận - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp đã được tiếp nhận và đang chuyển lên Giám đốc xem xét.</p>\n    <p>Thời gian xét duyệt: <strong>không quá 60 ngày làm việc</strong> theo Nghị định 268/2025/NĐ-CP.</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Theo dõi tiến độ</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","app_url"]'
),

(
  'application.dept_assigned.enterprise',
  'Hồ sơ được phân bổ - Doanh nghiệp',
  '[NATIF] Hồ sơ được phân bổ thẩm định - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp đã được phân bổ để thẩm định sơ bộ.</p>\n    <p>Hệ thống sẽ thông báo khi có kết quả thẩm định.</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Theo dõi tiến độ</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","app_url"]'
),

(
  'application.dept_assigned.depthead',
  'Được phân bổ hồ sơ - Dept Head',
  '[NATIF] Bạn được gán hồ sơ cần thẩm định - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{dept_head_name}}</strong>,</p>\n    <p>Bạn được gán hồ sơ để thẩm định sơ bộ.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Tên dự án:</strong> {{title}}</li>\n        <li><strong>Doanh nghiệp:</strong> {{company_name}}</li>\n        <li><strong>Ngân sách đề nghị:</strong> {{budget_requested_formatted}} VND</li>\n      </ul>\n    </div>\n    <a href="{{app_url}}/admin/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem hồ sơ</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["dept_head_name","title","company_name","budget_requested_formatted","app_url"]'
),

-- Expert Notifications
(
  'expert.assigned',
  'Mời đánh giá chuyên gia',
  '[NATIF] Mời đánh giá hồ sơ - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{expert_name}}</strong>,</p>\n    <p>Bạn được mời tham gia đánh giá hồ sơ sau:</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Tên dự án:</strong> {{title}}</li>\n        <li><strong>Doanh nghiệp:</strong> {{company_name}}</li>\n        <li><strong>Chương trình:</strong> {{program_type_display}}</li>\n        <li><strong>Ngân sách đề nghị:</strong> {{budget_requested_formatted}} VND</li>\n        <li><strong>Thời hạn đánh giá:</strong> {{deadline}}</li>\n      </ul>\n    </div>\n    <p>Vui lòng đăng nhập hệ thống để xem chi tiết và đánh giá.</p>\n    <a href="{{app_url}}/expert/profile" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Đăng nhập đánh giá</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Thông báo tự động</p>\n  </div>\n</div>',
  '["expert_name","title","company_name","program_type_display","budget_requested_formatted","deadline","app_url"]'
),

(
  'expert.accepted',
  'Chuyên gia chấp nhận đánh giá - Admin',
  '[NATIF] Chuyên gia chấp nhận đánh giá - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Chuyên gia <strong>{{expert_name}}</strong> đã chấp nhận đánh giá hồ sơ <strong>{{title}}</strong>.</p>\n    <p>Thời hạn: <strong>{{deadline}}</strong></p>\n    <a href="{{app_url}}/admin/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["expert_name","title","deadline","app_url"]'
),

(
  'expert.declined',
  'Chuyên gia từ chối đánh giá - Admin',
  '[NATIF] ⚠️ Chuyên gia từ chối đánh giá - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">⚠️ Cần gán chuyên gia khác</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p>Chuyên gia <strong>{{expert_name}}</strong> đã từ chối đánh giá hồ sơ <strong>{{title}}</strong>.</p>\n    <p style="color: #dc2626; font-weight: bold;">Vui lòng gán chuyên gia khác để tiếp tục quy trình.</p>\n    <a href="{{app_url}}/admin/applications" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xử lý ngay</a>\n  </div>\n  <div style="padding: 15px; background: #dc2626; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Thông báo khẩn</p>\n  </div>\n</div>',
  '["expert_name","title","app_url"]'
),

(
  'review.completed',
  'Đánh giá chuyên gia hoàn thành',
  '[NATIF] Đánh giá chuyên gia hoàn thành - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{recipient_name}}</strong>,</p>\n    <p>Chuyên gia <strong>{{expert_name}}</strong> đã hoàn thành đánh giá hồ sơ:</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <p><strong>Hồ sơ:</strong> {{title}} ({{company_name}})</p>\n      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">\n      <p><strong>Điểm số:</strong></p>\n      <ul style="color: #374151; line-height: 1.8;">\n        <li>Đổi mới sáng tạo: {{score_innovation}}/10</li>\n        <li>Tính khả thi: {{score_feasibility}}/10</li>\n        <li>Tác động: {{score_impact}}/10</li>\n        <li>Ngân sách: {{score_budget}}/10</li>\n        <li>Năng lực đội ngũ: {{score_team}}/10</li>\n      </ul>\n      <p style="font-size: 20px; font-weight: bold; color: #1f3892;">Điểm tổng: {{overall_score}}/10</p>\n      <p><strong>Khuyến nghị:</strong> {{recommendation_display}}</p>\n      <p><strong>Điểm mạnh:</strong> {{strengths}}</p>\n      <p><strong>Điểm yếu:</strong> {{weaknesses}}</p>\n    </div>\n    <a href="{{app_url}}/admin/applications/{{application_id}}" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["recipient_name","expert_name","title","company_name","score_innovation","score_feasibility","score_impact","score_budget","score_team","overall_score","recommendation_display","strengths","weaknesses","application_id","app_url"]'
),

-- Action Notifications
(
  'action.supplementary',
  'Yêu cầu bổ sung tài liệu',
  '[NATIF] Hồ sơ cần bổ sung tài liệu - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">⚠️ Yêu cầu bổ sung hồ sơ</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp cần được bổ sung tài liệu.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">\n      <p><strong>Nội dung yêu cầu bổ sung:</strong></p>\n      <p>{{proposal_notes}}</p>\n      <p><strong>Thời hạn:</strong> {{supplementary_deadline}}</p>\n    </div>\n    <p style="color: #dc2626;"><em>Lưu ý: Hồ sơ sẽ bị tạm dừng xét duyệt cho đến khi nhận đủ tài liệu bổ sung.</em></p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Bổ sung ngay</a>\n  </div>\n  <div style="padding: 15px; background: #f59e0b; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","proposal_notes","supplementary_deadline","app_url"]'
),

(
  'action.survey',
  'Yêu cầu khảo sát thực tế',
  '[NATIF] Hồ sơ cần khảo sát thực tế - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp cần được khảo sát thực tế.</p>\n    <p>Đại diện của NATIF sẽ liên hệ để sắp xếp lịch khảo sát trong thời gian sớm nhất.</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","app_url"]'
),

(
  'action.rejected',
  'Hồ sơ bị từ chối',
  '[NATIF] Hồ sơ không được phê duyệt - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Kết quả xét duyệt hồ sơ</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Rất tiếc, hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp <strong>không được phê duyệt</strong>.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">\n      <p><strong>Lý do:</strong></p>\n      <p>{{proposal_notes}}</p>\n    </div>\n    <p>Quý Doanh nghiệp có thể nộp hồ sơ mới hoặc liên hệ với chúng tôi để được tư vấn thêm.</p>\n    <a href="{{app_url}}/programs" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chương trình hỗ trợ</a>\n  </div>\n  <div style="padding: 15px; background: #dc2626; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","proposal_notes","app_url"]'
),

-- Council Notifications
(
  'council.created',
  'Mời tham gia Hội đồng đánh giá',
  '[NATIF] Mời tham gia Hội đồng đánh giá - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{member_name}}</strong>,</p>\n    <p>Bạn được mời tham gia <strong>Hội đồng đánh giá</strong> với vai trò <strong>{{member_role}}</strong>.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Hồ sơ:</strong> {{title}}</li>\n        <li><strong>Doanh nghiệp:</strong> {{company_name}}</li>\n        <li><strong>Thời hạn đánh giá:</strong> {{evaluation_deadline}}</li>\n        <li><strong>Chủ tọa:</strong> {{chairman_name}}</li>\n      </ul>\n    </div>\n    <a href="{{app_url}}/expert/profile" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Thông báo tự động</p>\n  </div>\n</div>',
  '["member_name","member_role","title","company_name","evaluation_deadline","chairman_name","app_url"]'
),

(
  'council.meeting_scheduled',
  'Thông báo cuộc họp Hội đồng',
  '[NATIF] Thông báo họp Hội đồng - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">📅 Thông báo cuộc họp Hội đồng</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p>Cuộc họp Hội đồng đánh giá hồ sơ <strong>{{title}}</strong> đã được lên lịch.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <ul style="color: #374151; line-height: 1.8;">\n        <li><strong>Ngày họp:</strong> {{meeting_date}}</li>\n        <li><strong>Địa điểm:</strong> {{meeting_location}}</li>\n        <li><strong>Người tham dự:</strong> {{attendees}}</li>\n      </ul>\n    </div>\n    <p>Vui lòng xác nhận tham dự.</p>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["title","meeting_date","meeting_location","attendees","app_url"]'
),

-- Final Decisions
(
  'application.approved',
  'Hồ sơ được phê duyệt - Doanh nghiệp',
  '[NATIF] 🎉 Hồ sơ được phê duyệt - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #059669; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">🎉 Phê duyệt hồ sơ</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p style="font-size: 18px; font-weight: bold; color: #059669;">Hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp đã được <strong>PHÊ DUYỆT</strong>.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">\n      <p><strong>Quyết định:</strong> {{director_decision_notes}}</p>\n    </div>\n    <p>Chúng tôi sẽ liên hệ để hướng dẫn các bước tiếp theo (ký hợp đồng, giải ngân).</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #059669; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","director_decision_notes","app_url"]'
),

(
  'application.rejected_final',
  'Hồ sơ không được phê duyệt cuối cùng',
  '[NATIF] Kết quả xét duyệt cuối cùng - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Kết quả xét duyệt cuối cùng</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Sau khi xem xét kỹ lưỡng, hồ sơ <strong>{{title}}</strong> của Quý Doanh nghiệp <strong>không được phê duyệt</strong>.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">\n      <p><strong>Quyết định:</strong></p>\n      <p>{{director_decision_notes}}</p>\n    </div>\n    <p>Quý Doanh nghiệp có thể nộp hồ sơ mới hoặc liên hệ để được tư vấn.</p>\n    <a href="{{app_url}}/programs" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chương trình</a>\n  </div>\n  <div style="padding: 15px; background: #dc2626; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","director_decision_notes","app_url"]'
),

-- Disbursement
(
  'disbursement.made',
  'Thông báo giải ngân',
  '[NATIF] Đợt giải ngân đã thực hiện - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #059669; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">💰 Thông báo giải ngân</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Đợt giải ngân cho dự án <strong>{{title}}</strong> đã được thực hiện.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">\n      <p style="font-size: 24px; font-weight: bold; color: #059669;">{{amount_formatted}} VND</p>\n      <p><strong>Đợt:</strong> {{installment_number}}</p>\n      <p><strong>Ngày giải ngân:</strong> {{disbursement_date}}</p>\n    </div>\n    <p>Đề nghị theo dõi và thực hiện báo cáo tiến độ theo quy định.</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #059669; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","amount_formatted","installment_number","disbursement_date","app_url"]'
),

(
  'contract.reminder',
  'Nhắc ký hợp đồng',
  '[NATIF] ⏰ Nhắc ký hợp đồng - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">⏰ Nhắc nhở ký hợp đồng</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hồ sơ <strong>{{title}}</strong> đã được phê duyệt. Vui lòng ký hợp đồng <strong>trước ngày {{contract_deadline}}</strong>.</p>\n    <p style="color: #dc2626; font-weight: bold;">Quá thời hạn, hồ sơ sẽ bị hủy.</p>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ký hợp đồng ngay</a>\n  </div>\n  <div style="padding: 15px; background: #f59e0b; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["contact_name","title","contract_deadline","app_url"]'
),

-- Reporting
(
  'disbursement.reminder',
  'Nhắc báo cáo định kỳ',
  '[NATIF] Nhắc báo cáo tiến độ - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Báo cáo tiến độ cho dự án <strong>{{title}}</strong> sắp đến hạn nộp.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">\n      <p><strong>Loại báo cáo:</strong> {{report_type}}</p>\n      <p><strong>Hạn nộp:</strong> {{due_date}}</p>\n    </div>\n    <a href="{{app_url}}/profile/reports" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Nộp báo cáo</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["contact_name","title","report_type","due_date","app_url"]'
),

(
  'reporting.overdue',
  'Báo cáo quá hạn',
  '[NATIF] ⚠️ Báo cáo quá hạn - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">⚠️ Báo cáo quá hạn</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Báo cáo tiến độ dự án <strong>{{title}}</strong> đã <strong style="color:#dc2626">quá hạn {{days_overdue}} ngày</strong>.</p>\n    <p style="color: #dc2626; font-weight: bold;">Vui lòng nộp ngay để tránh ảnh hưởng đến các đợt giải ngân tiếp theo.</p>\n    <a href="{{app_url}}/profile/reports" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Nộp báo cáo ngay</a>\n  </div>\n  <div style="padding: 15px; background: #dc2626; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Thông báo khẩn</p>\n  </div>\n</div>',
  '["contact_name","title","days_overdue","app_url"]'
),

-- Password / Auth
(
  'password.reset',
  'Yêu cầu đặt lại mật khẩu',
  '[NATIF] Mã đặt lại mật khẩu - {{code}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{user_name}}</strong>,</p>\n    <p>Yêu cầu đặt lại mật khẩu cho tài khoản NATIF OMS của bạn.</p>\n    <div style="background: white; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; border: 2px dashed #1f3892;">\n      <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Mã xác minh của bạn:</p>\n      <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f3892; margin: 0;">{{code}}</p>\n      <p style="font-size: 13px; color: #6b7280; margin: 10px 0 0 0;">Mã có hiệu lực trong 15 phút</p>\n    </div>\n    <p style="color: #dc2626; font-size: 13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS - Không trả lời email này</p>\n  </div>\n</div>',
  '["user_name","code"]'
),

(
  'email.verification',
  'Xác minh địa chỉ email',
  '[NATIF] Xác minh email - {{code}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{user_name}}</strong>,</p>\n    <p>Cảm ơn bạn đã đăng ký tài khoản NATIF OMS. Vui lòng xác minh địa chỉ email của bạn.</p>\n    <div style="background: white; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; border: 2px dashed #1f3892;">\n      <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Mã xác minh của bạn:</p>\n      <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f3892; margin: 0;">{{code}}</p>\n      <p style="font-size: 13px; color: #6b7280; margin: 10px 0 0 0;">Mã có hiệu lực trong 24 giờ</p>\n    </div>\n    <a href="{{verification_url}}" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xác minh email</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Hệ thống NATIF OMS</p>\n  </div>\n</div>',
  '["user_name","code","verification_url"]'
),

-- Council recommendation
(
  'council.recommendation',
  'Kết luận Hội đồng đánh giá',
  '[NATIF] Kết luận Hội đồng - {{title}}',
  E'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">\n  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">\n    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>\n  </div>\n  <div style="padding: 30px; background: #f9fafb;">\n    <p style="font-size: 16px;">Kính gửi <strong>{{contact_name}}</strong>,</p>\n    <p>Hội đồng đánh giá đã có kết luận về hồ sơ <strong>{{title}}</strong>.</p>\n    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1f3892;">\n      <p><strong>Kết luận:</strong> {{recommendation_display}}</p>\n      <p><strong>Nhận xét:</strong></p>\n      <p>{{recommendation_notes}}</p>\n    </div>\n    <a href="{{app_url}}/profile/applications" style="display: inline-block; background: #1f3892; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Xem chi tiết</a>\n  </div>\n  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">\n    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>\n  </div>\n</div>',
  '["contact_name","title","recommendation_display","recommendation_notes","app_url"]'
)

ON CONFLICT (code) DO NOTHING;
