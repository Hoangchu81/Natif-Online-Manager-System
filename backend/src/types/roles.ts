// NATIF OMS — Canonical Role & Account Types
// 17-role model per master_account_email_architecture.md

export const CANONICAL_ROLES = [
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
  'external_partner',
] as const;

export type CanonicalRole = typeof CANONICAL_ROLES[number];

export const LEGACY_ROLES = ['admin', 'moderator', 'enterprise', 'expert', 'officer', 'dept_head', 'director', 'clerk'] as const;
export type LegacyRole = typeof LEGACY_ROLES[number];

export const ACCOUNT_TYPES = ['internal', 'external', 'expert', 'partner', 'system'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const ACCOUNT_STATUSES = ['invited', 'pending_verification', 'pending_approval', 'active', 'suspended', 'deactivated', 'deleted'] as const;
export type AccountStatus = typeof ACCOUNT_STATUSES[number];

// Legacy → Canonical mapping
export const LEGACY_TO_CANONICAL: Record<LegacyRole, CanonicalRole> = {
  admin: 'chief_system_architect',
  moderator: 'admin_desk',
  enterprise: 'external_partner',
  expert: 'independent_expert',
  officer: 'grants_orders_specialist',
  dept_head: 'department_manager',
  director: 'natif_executive',
  clerk: 'admin_desk',
};

// Canonical → Legacy (for backward compat in JWT/API)
export const CANONICAL_TO_LEGACY: Record<CanonicalRole, LegacyRole> = {
  chief_system_architect: 'admin',
  fullstack_developer: 'admin',
  devsecops_security: 'admin',
  data_ai_scientist: 'admin',
  natif_executive: 'director',
  department_manager: 'dept_head',
  grants_orders_specialist: 'officer',
  voucher_startup_specialist: 'officer',
  finance_disbursement: 'officer',
  legal_risk_control: 'officer',
  admin_desk: 'clerk',
  it_sysadmin_support: 'admin',
  scientific_council: 'expert',
  independent_expert: 'expert',
  financial_appraiser: 'expert',
  independent_auditor: 'expert',
  external_partner: 'enterprise',
};

// Role metadata for UI
export const ROLE_LABELS: Record<CanonicalRole, string> = {
  chief_system_architect: 'Kiến trúc sư hệ thống',
  fullstack_developer: 'Lập trình viên hệ thống',
  devsecops_security: 'An toàn thông tin/DevSecOps',
  data_ai_scientist: 'Dữ liệu/AI',
  natif_executive: 'Lãnh đạo NATIF',
  department_manager: 'Lãnh đạo phòng/ban',
  grants_orders_specialist: 'Chuyên viên tài trợ/đặt hàng',
  voucher_startup_specialist: 'Chuyên viên voucher/startup',
  finance_disbursement: 'Tài chính/giải ngân',
  legal_risk_control: 'Pháp chế/kiểm soát rủi ro',
  admin_desk: 'Văn thư/tiếp nhận',
  it_sysadmin_support: 'CNTT/hỗ trợ',
  scientific_council: 'Thành viên hội đồng KH',
  independent_expert: 'Chuyên gia độc lập',
  financial_appraiser: 'Thẩm định tài chính',
  independent_auditor: 'Kiểm toán/giám sát độc lập',
  external_partner: 'Doanh nghiệp/đối tác',
};

// Which roles can self-register
export const SELF_REGISTER_ROLES: CanonicalRole[] = ['external_partner', 'independent_expert'];

// Which roles require admin creation
export const ADMIN_CREATED_ROLES: CanonicalRole[] = [
  'chief_system_architect', 'fullstack_developer', 'devsecops_security', 'data_ai_scientist',
  'natif_executive', 'department_manager', 'grants_orders_specialist', 'voucher_startup_specialist',
  'finance_disbursement', 'legal_risk_control', 'admin_desk', 'it_sysadmin_support',
  'financial_appraiser', 'independent_auditor',
];

// Which roles can be invited
export const INVITABLE_ROLES: CanonicalRole[] = [
  'scientific_council', 'independent_expert', 'financial_appraiser', 'independent_auditor', 'external_partner',
];

// Admin-level roles (can manage users)
export const ADMIN_ROLES: CanonicalRole[] = [
  'chief_system_architect', 'it_sysadmin_support', 'natif_executive',
];

// Internal staff roles
export const INTERNAL_ROLES: CanonicalRole[] = [
  'chief_system_architect', 'fullstack_developer', 'devsecops_security', 'data_ai_scientist',
  'natif_executive', 'department_manager', 'grants_orders_specialist', 'voucher_startup_specialist',
  'finance_disbursement', 'legal_risk_control', 'admin_desk', 'it_sysadmin_support',
];

// Expert-class roles
export const EXPERT_ROLES: CanonicalRole[] = [
  'scientific_council', 'independent_expert', 'financial_appraiser', 'independent_auditor',
];

// Role → default dashboard path
export const ROLE_DASHBOARD_PATH: Record<CanonicalRole, string> = {
  chief_system_architect: '/admin',
  fullstack_developer: '/admin',
  devsecops_security: '/admin',
  data_ai_scientist: '/admin',
  natif_executive: '/executive',
  department_manager: '/dept-head',
  grants_orders_specialist: '/officer',
  voucher_startup_specialist: '/officer',
  finance_disbursement: '/finance',
  legal_risk_control: '/legal',
  admin_desk: '/clerk',
  it_sysadmin_support: '/admin',
  scientific_council: '/councils',
  independent_expert: '/expert',
  financial_appraiser: '/expert',
  independent_auditor: '/auditor',
  external_partner: '/apply',
};
