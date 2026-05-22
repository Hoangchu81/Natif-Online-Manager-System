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
  director_review: 'Lãnh đạo xem xét',
  dept_assigned: 'Đã phân phòng',
  preliminary_review: 'Xét sơ bộ',
  action_taken: 'Đã quyết định',
  supplementary_requested: 'Yêu cầu bổ sung',
  survey_conducted: 'Đã khảo sát',
  council_evaluation: 'Hội đồng đánh giá',
  summarized: 'Đã tổng hợp',
  dept_approved: 'Phòng duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Từ chối',
  returned: 'Trả lại',
};

export const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  submitted: 'badge-blue',
  received: 'badge-indigo',
  director_review: 'badge-purple',
  dept_assigned: 'badge-violet',
  preliminary_review: 'badge-amber',
  action_taken: 'badge-orange',
  supplementary_requested: 'badge-yellow',
  survey_conducted: 'badge-teal',
  council_evaluation: 'badge-cyan',
  summarized: 'badge-emerald',
  dept_approved: 'badge-green',
  approved: 'badge-green',
  rejected: 'badge-red',
  returned: 'badge-yellow',
};

export const SCENARIO_LABELS: Record<string, string> = {
  council: 'Lập Hội đồng tư vấn',
  survey: 'Đi khảo sát thực tế',
  supplementary: 'Yêu cầu bổ sung hồ sơ',
  reject: 'Loại hồ sơ',
};

export const SCENARIO_COLORS: Record<string, string> = {
  council: 'bg-purple-100 text-purple-700',
  survey: 'bg-teal-100 text-teal-700',
  supplementary: 'bg-amber-100 text-amber-700',
  reject: 'bg-red-100 text-red-700',
};

/** Full workflow timeline — 11 steps */
export const WORKFLOW_STEPS = [
  { key: 'draft', label: 'Nháp' },
  { key: 'submitted', label: 'Đã nộp' },
  { key: 'received', label: 'Tiếp nhận' },
  { key: 'director_review', label: 'Lãnh đạo' },
  { key: 'dept_assigned', label: 'Phân phòng' },
  { key: 'preliminary_review', label: 'Xét sơ bộ' },
  { key: 'action_taken', label: 'Quyết định' },
  { key: 'council_evaluation', label: 'HĐ đánh giá' },
  { key: 'summarized', label: 'Tổng hợp' },
  { key: 'dept_approved', label: 'Phòng duyệt' },
  { key: 'approved', label: 'Phê duyệt' },
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

export function formatCurrency(num?: number | null): string {
  if (!num) return '—';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + ' triệu';
  return num.toLocaleString('vi-VN');
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Map status → index in WORKFLOW_STEPS (0-based) */
export function getWorkflowIndex(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    submitted: 1,
    received: 2,
    director_review: 3,
    dept_assigned: 4,
    preliminary_review: 5,
    action_taken: 6,
    supplementary_requested: 6,
    survey_conducted: 7,
    council_evaluation: 7,
    summarized: 8,
    dept_approved: 9,
    approved: 10,
    rejected: 10,
    returned: 10,
  };
  return map[status] ?? 0;
}

/** Check if status is terminal (no further transitions) */
export function isTerminalStatus(status: string): boolean {
  return ['approved', 'rejected', 'returned'].includes(status);
}
