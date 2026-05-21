export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const PROGRAM_LABELS: Record<string, string> = {
  interest_subsidy: 'Hỗ trợ lãi suất',
  sponsorship: 'Tài trợ, đặt hàng',
  voucher: 'Hỗ trợ voucher',
  ecosystem: 'Hệ sinh thái',
};

export const PROGRAM_COLORS: Record<string, string> = {
  interest_subsidy: 'badge-blue',
  sponsorship: 'badge-green',
  voucher: 'badge-cyan',
  ecosystem: 'badge-amber',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  submitted: 'Đã nộp',
  received: 'Đã tiếp nhận',
  assigned: 'Đã phân công',
  preliminary_review: 'Xét duyệt sơ bộ',
  expert_review: 'Chuyên gia đánh giá',
  summarized: 'Đã tổng hợp',
  dept_approved: 'Phòng duyệt',
  dept_rejected: 'Phòng từ chối',
  approved: 'Đã phê duyệt',
  rejected: 'Từ chối',
  returned: 'Trả lại',
};

export const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  submitted: 'badge-blue',
  received: 'badge-indigo',
  assigned: 'badge-purple',
  preliminary_review: 'badge-amber',
  expert_review: 'badge-orange',
  summarized: 'badge-teal',
  dept_approved: 'badge-cyan',
  dept_rejected: 'badge-red',
  approved: 'badge-green',
  rejected: 'badge-red',
  returned: 'badge-yellow',
};

export const WORKFLOW_STEPS = [
  { key: 'draft', label: 'Nháp', icon: '✏️' },
  { key: 'submitted', label: 'Đã nộp', icon: '📨' },
  { key: 'received', label: 'Tiếp nhận', icon: '📬' },
  { key: 'assigned', label: 'Phân công', icon: '👤' },
  { key: 'preliminary_review', label: 'Sơ bộ', icon: '🔍' },
  { key: 'expert_review', label: 'Chuyên gia', icon: '🎓' },
  { key: 'summarized', label: 'Tổng hợp', icon: '📊' },
  { key: 'dept_approved', label: 'Phòng duyệt', icon: '🏢' },
  { key: 'approved', label: 'Phê duyệt', icon: '✅' },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  director: 'Lãnh đạo Quỹ',
  dept_head: 'Trưởng phòng',
  officer: 'Chuyên viên',
  clerk: 'Văn thư',
  moderator: 'Điều phối viên',
  expert: 'Chuyên gia',
  enterprise: 'Doanh nghiệp',
};

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  director: 'bg-purple-100 text-purple-700',
  dept_head: 'bg-blue-100 text-blue-700',
  officer: 'bg-cyan-100 text-cyan-700',
  clerk: 'bg-teal-100 text-teal-700',
  moderator: 'bg-amber-100 text-amber-700',
  expert: 'bg-green-100 text-green-700',
  enterprise: 'bg-gray-100 text-gray-700',
};

export function formatCurrency(num: number): string {
  if (!num) return '—';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + ' triệu';
  return num.toLocaleString('vi-VN');
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWorkflowIndex(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    submitted: 1,
    received: 2,
    assigned: 3,
    preliminary_review: 4,
    expert_review: 5,
    summarized: 6,
    dept_approved: 7,
    dept_rejected: 7,
    approved: 8,
    rejected: 8,
    returned: 8,
  };
  return map[status] ?? 0;
}
