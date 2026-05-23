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

// Export all as api namespace
const api = { auth, applications, workflow, dashboard, notifications, users, assignments, reviews, news };
export default api;
