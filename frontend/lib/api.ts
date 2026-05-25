/**
 * Typed API Client for NATIF OMS Frontend.
 * All API calls go through this module for consistent typing and error handling.
 */

import { getToken, clearAuth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: ApiPagination;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 → clear auth
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiRequestError('Phiên đăng nhập hết hạn', 401, 'UNAUTHORIZED');
  }

  // Parse response
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body as ApiError | null;
    throw new ApiRequestError(
      err?.error || `Request failed (${res.status})`,
      res.status,
      err?.code,
      err?.details,
    );
  }

  // Normalize: if response has `data` field, use it; otherwise wrap entire body
  if (body && 'data' in body) {
    return body as ApiResponse<T>;
  }
  return { data: body as T };
}

// ─── HTTP method helpers ─────────────────────────────────────────────────────

export function get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return request<T>(url);
}

export function post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function del<T = void>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}

// ─── Domain-specific API functions ──────────────────────────────────────────

// Auth
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { email: string; password: string; full_name: string; phone?: string; company?: string }
export interface AuthResult { token: string; user: UserProfile }
export interface UserProfile { id: string; email: string; full_name: string; role: string; phone?: string; company?: string }

export const auth = {
  login: (payload: LoginPayload) => post<AuthResult>('/api/auth/login', payload),
  register: (payload: RegisterPayload) => post<AuthResult>('/api/auth/register', payload),
  getProfile: () => get<UserProfile>('/api/profile'),
  updateProfile: (data: Partial<UserProfile>) => put<UserProfile>('/api/profile', data),
  changePassword: (data: { current_password: string; new_password: string }) => put<{ message: string }>('/api/auth/change-password', data),
  forgotPassword: (email: string) => post<{ message: string }>('/api/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; code: string; new_password: string }) => post<{ message: string }>('/api/auth/reset-password', data),
};

// Applications
export interface Application {
  id: string;
  user_id: string;
  program_type: string;
  company_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  title: string;
  description: string;
  budget_requested: number;
  status: string;
  scenario?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  officer_name?: string;
  dept_head_name?: string;
  officer_id?: string;
  dept_head_id?: string;
}

export interface ApplicationListParams {
  status?: string;
  program_type?: string;
  page?: number;
  limit?: number;
  my_assignments?: string;
}

export const applications = {
  list: (params?: ApplicationListParams) => get<Application[]>('/api/applications', params as Record<string, string | number | undefined>),
  getById: (id: string) => get<Application>(`/api/applications/${id}`),
  create: (data: Partial<Application>) => post<Application>('/api/applications', data),
  update: (id: string, data: Partial<Application>) => put<Application>(`/api/applications/${id}`, data),
  delete: (id: string) => del(`/api/applications/${id}`),
  submit: (id: string) => post<Application>(`/api/applications/${id}/submit`),
};

// Workflow
export interface WorkflowTransitionPayload {
  application_id: string;
  to_status: string;
  notes?: string;
  dept_head_id?: string;
  officer_id?: string;
  scenario?: string;
  proposal_notes?: string;
  director_decision_notes?: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  application_id: string;
  from_status: string;
  to_status: string;
  action_by: string;
  action_role: string;
  notes?: string;
  action_by_name?: string;
  created_at: string;
}

export const workflow = {
  transition: (payload: WorkflowTransitionPayload) => post<{ message: string; from: string; to: string }>('/api/workflow/transition', payload),
  getHistory: (applicationId: string) => get<WorkflowHistoryEntry[]>(`/api/workflow/history/${applicationId}`),
};

// Dashboard
export interface DashboardStats {
  total_applications: number;
  pending_review: number;
  approved: number;
  rejected: number;
  total_approved_budget?: number;
  total_disbursed_estimate?: number;
}

export const dashboard = {
  getStats: () => get<DashboardStats>('/api/dashboard/stats'),
  getUserStats: () => get<DashboardStats>('/api/user/stats'),
};

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notifications = {
  list: (params?: { page?: number; limit?: number }) => get<Notification[]>('/api/notifications', params as Record<string, string | number | undefined>),
  unreadCount: () => get<{ count: number }>('/api/notifications/unread-count'),
  markRead: (id: string) => put<void>(`/api/notifications/${id}/read`),
  markAllRead: () => put<void>('/api/notifications/read-all'),
};

// Users (admin)
export const users = {
  list: (params?: { page?: number; limit?: number; role?: string }) => get<UserProfile[]>('/api/admin/users', params as Record<string, string | number | undefined>),
  getById: (id: string) => get<UserProfile>(`/api/admin/users/${id}`),
  changeRole: (id: string, role: string) => put<UserProfile>(`/api/admin/users/${id}/role`, { role }),
  toggleStatus: (id: string) => put<UserProfile>(`/api/admin/users/${id}/status`),
  softDelete: (id: string) => del(`/api/admin/users/${id}`),
};

// Assignments
export interface Assignment {
  id: string;
  application_id: string;
  expert_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  deadline?: string;
  application_title?: string;
  company_name?: string;
  program_type?: string;
  budget_requested?: number;
  created_at: string;
}

export const assignments = {
  list: () => get<Assignment[]>('/api/assignments'),
  create: (data: { application_id: string; expert_id: string; deadline?: string }) => post<Assignment>('/api/assignments', data),
  update: (id: string, data: { status: string }) => put<Assignment>(`/api/assignments/${id}`, data),
  delete: (id: string) => del(`/api/assignments/${id}`),
};

// Reviews
export interface Review {
  id: string;
  assignment_id: string;
  application_id: string;
  score_innovation?: number;
  score_feasibility?: number;
  score_impact?: number;
  score_budget?: number;
  score_team?: number;
  recommendation: string;
  strengths?: string;
  weaknesses?: string;
  comments?: string;
  created_at: string;
}

export const reviews = {
  list: () => get<Review[]>('/api/reviews'),
  getById: (id: string) => get<Review>(`/api/reviews/${id}`),
  create: (data: Partial<Review>) => post<Review>('/api/reviews', data),
};

// News
export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: string;
  author?: string;
  published_at?: string;
  is_featured?: boolean;
  created_at: string;
}

export const news = {
  list: (params?: { page?: number; limit?: number }) => get<NewsItem[]>('/api/news', params as Record<string, string | number | undefined>),
  getBySlug: (slug: string) => get<NewsItem>(`/api/news/${slug}`),
  // Admin
  adminList: (params?: { page?: number; limit?: number; status?: string }) => get<NewsItem[]>('/api/admin/news', params as Record<string, string | number | undefined>),
  adminCreate: (data: Partial<NewsItem>) => post<NewsItem>('/api/admin/news', data),
  adminUpdate: (id: string, data: Partial<NewsItem>) => put<NewsItem>(`/api/admin/news/${id}`, data),
  adminDelete: (id: string) => del(`/api/admin/news/${id}`),
};

// ─── Điều 11 — Thuyết minh & sub-resources ─────────────────────────────────

export interface ThuyetMinh {
  id: string;
  application_id: string;
  tinh_cap_thiet: string;
  tong_quan_trong_nuoc?: string;
  tong_quan_quoc_te?: string;
  tinh_moi_sang_tao: string;
  muc_tieu_tong_quat: string;
  muc_tieu_cu_the: string[];
  hieu_qua_kinh_te?: string;
  hieu_qua_xa_hoi?: string;
  hieu_qua_moi_truong?: string;
  kha_nang_ung_dung?: string;
  co_so_vat_chat?: string;
  hop_tac_quoc_te?: string;
}

export interface NoiDung {
  id?: string;
  noi_dung_so: number;
  ten: string;
  mo_ta_chi_tiet?: string;
  phuong_phap?: string;
  san_pham_du_kien?: string;
  nguoi_thuc_hien?: string;
  thoi_gian_tu?: string;
  thoi_gian_den?: string;
}

export interface SanPham {
  id?: string;
  loai: 'khoa_hoc' | 'dao_tao' | 'ung_dung' | 'shtt';
  ten: string;
  chi_tieu_chat_luong?: string;
  yeu_cau_ky_thuat?: string;
  so_luong?: number;
  don_vi?: string;
  quy_mo?: string;
  dia_chi_ung_dung?: string;
}

export interface DuToan {
  id?: string;
  hang_muc: 'cong_lao_dong' | 'nguyen_vat_lieu' | 'thiet_bi' | 'cong_tac_phi' | 'hoi_thao' | 'quan_ly' | 'khac';
  noi_dung: string;
  don_vi?: string;
  so_luong?: number;
  don_gia?: number;
  thanh_tien: number;
  nguon_nsnn?: number;
  nguon_khac?: number;
  ghi_chu?: string;
}

export interface NhomNghienCuu {
  id?: string;
  ho_ten: string;
  hoc_vi?: string;
  chuc_danh?: string;
  don_vi_cong_tac?: string;
  vai_tro: string;
  thoi_gian_tham_gia_thang?: number;
  so_gio_quy_doi?: number;
}

export interface TienDo {
  id?: string;
  giai_doan: number;
  noi_dung: string;
  san_pham?: string;
  thoi_gian_tu?: string;
  thoi_gian_den?: string;
  kinh_phi?: number;
}

export interface ApplicationFull extends Application {
  funding_mechanism?: string;
  task_category?: string;
  program_id?: string;
  field_of_study?: string;
  pi_name?: string;
  pi_degree?: string;
  pi_title?: string;
  pi_organization?: string;
  pi_phone?: string;
  pi_email?: string;
  total_budget?: number;
  requested_funding?: number;
  co_funding_amount?: number;
  co_funding_ratio?: number;
  implementation_start?: string;
  implementation_end?: string;
  implementation_months?: number;
  decl_no_duplicate_funding?: boolean;
  decl_self_responsibility?: boolean;
  decl_proper_use?: boolean;
  thuyet_minh: ThuyetMinh | null;
  noi_dung: NoiDung[];
  san_pham: SanPham[];
  du_toan: DuToan[];
  nhom_nghien_cuu: NhomNghienCuu[];
  tien_do: TienDo[];
}

export type DetailKind = 'noi_dung' | 'san_pham' | 'du_toan' | 'nhom_nghien_cuu' | 'tien_do';

export const applicationDetails = {
  getFull: (id: string) => get<ApplicationFull>(`/api/applications/${id}/full`),
  getThuyetMinh: (id: string) => get<ThuyetMinh | null>(`/api/applications/${id}/thuyet-minh`),
  upsertThuyetMinh: (id: string, data: Partial<ThuyetMinh>) => put<ThuyetMinh>(`/api/applications/${id}/thuyet-minh`, data),
  listDetail: <T>(id: string, kind: DetailKind) => get<T[]>(`/api/applications/${id}/details/${kind}`),
  createDetail: <T>(id: string, kind: DetailKind, data: unknown) => post<T>(`/api/applications/${id}/details/${kind}`, data),
  updateDetail: <T>(id: string, kind: DetailKind, detailId: string, data: unknown) => put<T>(`/api/applications/${id}/details/${kind}/${detailId}`, data),
  deleteDetail: (id: string, kind: DetailKind, detailId: string) => del(`/api/applications/${id}/details/${kind}/${detailId}`),
  bulkSave: <T>(id: string, kind: DetailKind, items: unknown[]) => put<T[]>(`/api/applications/${id}/details/${kind}/bulk`, { items }),
};

// Export all as api namespace
const api = { auth, applications, applicationDetails, workflow, dashboard, notifications, users, assignments, reviews, news };
export default api;
