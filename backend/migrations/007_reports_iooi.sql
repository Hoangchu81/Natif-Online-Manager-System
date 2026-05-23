-- Migration 007: Reports & IOOI Database Tables
-- For NATIF OMS v2

-- ============================================================
-- TABLE: disbursements
-- ============================================================
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE RESTRICT,
  amount DECIMAL(18,2) NOT NULL CHECK (amount > 0),
  disbursement_date DATE NOT NULL,
  installment_number INTEGER DEFAULT 1 CHECK (installment_number >= 1),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursements_app ON disbursements(application_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_date ON disbursements(disbursement_date);

COMMENT ON TABLE disbursements IS 'Disbursement records for approved NATIF applications (Nghị định 268/2025/NĐ-CP)';

-- ============================================================
-- TABLE: project_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS project_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('quarterly', 'annual', 'final', 'supplementary')),
  period VARCHAR(20) NOT NULL,
  due_date DATE NOT NULL,
  submitted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  content TEXT,
  attachments JSONB DEFAULT '[]',
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_reports_app ON project_reports(application_id);
CREATE INDEX IF NOT EXISTS idx_project_reports_status ON project_reports(status);
CREATE INDEX IF NOT EXISTS idx_project_reports_due ON project_reports(due_date) WHERE status = 'pending';

COMMENT ON TABLE project_reports IS 'Periodic project reports from enterprises (Nghị định 268/2025/NĐ-CP)';

-- ============================================================
-- TABLE: report_schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  due_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_schedules_pending
  ON report_schedules(due_date)
  WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_report_schedules_app ON report_schedules(application_id);

COMMENT ON TABLE report_schedules IS 'Scheduled report reminders for NATIF projects';

-- ============================================================
-- TABLE: contracts (reference only - simplified)
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE RESTRICT,
  contract_number VARCHAR(100) UNIQUE,
  signed_at DATE,
  contract_deadline DATE NOT NULL,
  total_amount DECIMAL(18,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'expired', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_app ON contracts(application_id);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON contracts(contract_deadline) WHERE status = 'pending';

COMMENT ON TABLE contracts IS 'Contract management for approved NATIF applications';

-- ============================================================
-- TABLE: application_audit_logs (DB-backed audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS application_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_app ON application_audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON application_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON application_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON application_audit_logs(created_at DESC);

COMMENT ON TABLE application_audit_logs IS 'Comprehensive audit trail for application lifecycle (Nghị định 265/2025/NĐ-CP)';

-- ============================================================
-- TABLE: iooi_snapshots (periodic IOOI data snapshots)
-- ============================================================
CREATE TABLE IF NOT EXISTS iooi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_value VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iooi_snapshots_date ON iooi_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_iooi_snapshots_period ON iooi_snapshots(period_type, period_value);

COMMENT ON TABLE iooi_snapshots IS 'IOOI framework data snapshots for NATIF reporting (Nghị định 77/2026/NĐ-CP)';
