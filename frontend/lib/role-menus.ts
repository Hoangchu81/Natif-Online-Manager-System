// Centralized role-menu registry for 17 canonical personas
import type { CanonicalRole } from './auth';

export interface MenuItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  badge?: number;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const COMMON_MENU: MenuItem[] = [
  { label: 'Tổng quan', href: '', icon: 'LayoutDashboard' },
  { label: 'Thông báo', href: '/notifications', icon: 'Bell' },
  { label: 'Hồ sơ cá nhân', href: '/profile/change-password', icon: 'User' },
];

const ADMIN_TOOLS: MenuItem[] = [
  { label: 'Người dùng', href: '/admin/users', icon: 'Users' },
  { label: 'Tin tức', href: '/admin/news', icon: 'Newspaper' },
  { label: 'Báo cáo', href: '/admin/reports', icon: 'BarChart3' },
  { label: 'Menu', href: '/admin/menu', icon: 'Menu' },
];

const WORKFLOW_ITEMS: MenuItem[] = [
  { label: 'Hồ sơ cần xử lý', href: '', icon: 'ClipboardList' },
  { label: 'Hội đồng tư vấn', href: '/councils', icon: 'Users' },
];

export const ROLE_MENUS: Record<CanonicalRole, { portal: string; groups: MenuGroup[] }> = {
  chief_system_architect: { portal: '/admin/architecture', groups: [
    { title: 'Kiến trúc', items: [...COMMON_MENU, { label: 'Schema/API', href: '/admin/architecture', icon: 'Database' }, { label: 'RBAC Matrix', href: '/admin/security', icon: 'Shield' }, ...ADMIN_TOOLS] },
  ]},
  fullstack_developer: { portal: '/admin/development', groups: [
    { title: 'Phát triển', items: [...COMMON_MENU, { label: 'Backlog', href: '/admin/development', icon: 'Code2' }, { label: 'Components', href: '/admin/development/components', icon: 'Blocks' }, ...ADMIN_TOOLS] },
  ]},
  devsecops_security: { portal: '/admin/security', groups: [
    { title: 'An toàn', items: [...COMMON_MENU, { label: 'RBAC', href: '/admin/security/rbac', icon: 'ShieldCheck' }, { label: 'Audit log', href: '/admin/security/audit', icon: 'ScrollText' }, { label: 'Sessions', href: '/admin/security/sessions', icon: 'Monitor' }, ...ADMIN_TOOLS] },
  ]},
  data_ai_scientist: { portal: '/admin/data-ai', groups: [
    { title: 'Dữ liệu & AI', items: [...COMMON_MENU, { label: 'IOOI Dashboard', href: '/admin/reports', icon: 'Brain' }, { label: 'Anomalies', href: '/admin/data-ai/anomalies', icon: 'AlertTriangle' }, { label: 'Pipelines', href: '/admin/data-ai/pipelines', icon: 'Workflow' }, ...ADMIN_TOOLS] },
  ]},
  natif_executive: { portal: '/executive', groups: [
    { title: 'Lãnh đạo', items: [...COMMON_MENU, { label: 'Phê duyệt cuối', href: '/director', icon: 'CheckCircle2' }, { label: 'Danh mục chiến lược', href: '/executive/portfolio', icon: 'Briefcase' }, { label: 'Hội đồng', href: '/councils', icon: 'Users' }, { label: 'Báo cáo', href: '/admin/reports', icon: 'BarChart3' }] },
  ]},
  department_manager: { portal: '/dept-head', groups: [
    { title: 'Phòng/ban', items: [...COMMON_MENU, ...WORKFLOW_ITEMS, { label: 'Phân công', href: '/dept-head', icon: 'UserPlus' }, { label: 'Tải công việc', href: '/dept-head/workload', icon: 'Activity' }] },
  ]},
  grants_orders_specialist: { portal: '/grants-orders', groups: [
    { title: 'Tài trợ/đặt hàng', items: [...COMMON_MENU, { label: 'Hồ sơ được giao', href: '/officer', icon: 'FileText' }, { label: 'Xét sơ bộ', href: '/officer', icon: 'Search' }, { label: 'Tổng hợp', href: '/officer', icon: 'FileStack' }, { label: 'Hội đồng', href: '/councils', icon: 'Users' }] },
  ]},
  voucher_startup_specialist: { portal: '/voucher-startup', groups: [
    { title: 'Voucher & Startup', items: [...COMMON_MENU, { label: 'Marketplace', href: '/voucher-startup/marketplace', icon: 'Store' }, { label: 'Vendor', href: '/voucher-startup/vendors', icon: 'Building2' }, { label: 'Startup KPIs', href: '/voucher-startup/startups', icon: 'Rocket' }, { label: 'Techfest', href: '/voucher-startup/techfest', icon: 'Calendar' }] },
  ]},
  finance_disbursement: { portal: '/finance', groups: [
    { title: 'Tài chính', items: [...COMMON_MENU, { label: 'Thẩm định dự toán', href: '/finance/appraisal', icon: 'Calculator' }, { label: 'Giải ngân', href: '/finance/disbursement', icon: 'Banknote' }, { label: 'Hỗ trợ lãi suất', href: '/finance/interest', icon: 'Percent' }, { label: 'Kho bạc', href: '/finance/treasury', icon: 'Landmark' }] },
  ]},
  legal_risk_control: { portal: '/legal-risk', groups: [
    { title: 'Pháp chế', items: [...COMMON_MENU, { label: 'Hợp đồng', href: '/legal-risk/contracts', icon: 'FileSignature' }, { label: 'Trùng hỗ trợ', href: '/legal-risk/duplicates', icon: 'AlertOctagon' }, { label: 'Ngoại lệ', href: '/legal-risk/exceptions', icon: 'ShieldAlert' }, { label: 'Mẫu điều khoản', href: '/legal-risk/templates', icon: 'BookOpen' }] },
  ]},
  admin_desk: { portal: '/clerk', groups: [
    { title: 'Văn thư', items: [...COMMON_MENU, { label: 'Tiếp nhận', href: '/clerk', icon: 'Inbox' }, { label: 'OCR', href: '/clerk/ocr', icon: 'ScanLine' }, { label: 'Sổ công văn', href: '/clerk/registry', icon: 'BookMarked' }] },
  ]},
  it_sysadmin_support: { portal: '/admin/it-support', groups: [
    { title: 'CNTT', items: [...COMMON_MENU, { label: 'System health', href: '/admin/it-support/health', icon: 'HeartPulse' }, { label: 'Tickets', href: '/admin/it-support/tickets', icon: 'Ticket' }, { label: 'Backup', href: '/admin/it-support/backup', icon: 'HardDrive' }, ...ADMIN_TOOLS] },
  ]},
  scientific_council: { portal: '/councils', groups: [
    { title: 'Hội đồng KH', items: [...COMMON_MENU, { label: 'Phiên họp', href: '/councils', icon: 'Video' }, { label: 'Phiếu điểm', href: '/councils/scoring', icon: 'ClipboardCheck' }, { label: 'Biên bản', href: '/councils/minutes', icon: 'FileText' }] },
  ]},
  independent_expert: { portal: '/expert', groups: [
    { title: 'Chuyên gia', items: [...COMMON_MENU, { label: 'Nhiệm vụ phản biện', href: '/expert/assignments', icon: 'FileSearch' }, { label: 'Hồ sơ khoa học', href: '/expert/profile', icon: 'GraduationCap' }, { label: 'Công bố', href: '/expert/publications', icon: 'BookOpen' }] },
  ]},
  financial_appraiser: { portal: '/financial-appraisal', groups: [
    { title: 'Thẩm định TC', items: [...COMMON_MENU, { label: 'Dự toán', href: '/financial-appraisal', icon: 'Calculator' }, { label: 'Định mức', href: '/financial-appraisal/norms', icon: 'Scale' }, { label: 'Ý kiến', href: '/financial-appraisal/opinions', icon: 'MessageSquare' }] },
  ]},
  independent_auditor: { portal: '/auditor', groups: [
    { title: 'Kiểm toán', items: [...COMMON_MENU, { label: 'Data room', href: '/auditor', icon: 'FolderLock' }, { label: 'Mẫu kiểm tra', href: '/auditor/samples', icon: 'ListChecks' }, { label: 'Xuất log', href: '/auditor/exports', icon: 'Download' }] },
  ]},
  external_partner: { portal: '/apply/dashboard', groups: [
    { title: 'Doanh nghiệp', items: [...COMMON_MENU, { label: 'Hồ sơ của tôi', href: '/apply/dashboard', icon: 'FolderOpen' }, { label: 'Nộp hồ sơ mới', href: '/apply', icon: 'FilePlus' }, { label: 'Hợp đồng', href: '/apply/contracts', icon: 'FileSignature' }, { label: 'Báo cáo định kỳ', href: '/apply/reports', icon: 'CalendarClock' }] },
  ]},
};

export function getMenuForRole(role: CanonicalRole): MenuGroup[] {
  return ROLE_MENUS[role]?.groups || ROLE_MENUS.external_partner.groups;
}

export function getPortalPath(role: CanonicalRole): string {
  return ROLE_MENUS[role]?.portal || '/apply/dashboard';
}
