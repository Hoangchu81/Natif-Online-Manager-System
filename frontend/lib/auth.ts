const TOKEN_KEY = 'natif_token';
const USER_KEY = 'natif_user';

// Canonical 17-role model
export type CanonicalRole =
  | 'chief_system_architect'
  | 'fullstack_developer'
  | 'devsecops_security'
  | 'data_ai_scientist'
  | 'natif_executive'
  | 'department_manager'
  | 'grants_orders_specialist'
  | 'voucher_startup_specialist'
  | 'finance_disbursement'
  | 'legal_risk_control'
  | 'admin_desk'
  | 'it_sysadmin_support'
  | 'scientific_council'
  | 'independent_expert'
  | 'financial_appraiser'
  | 'independent_auditor'
  | 'external_partner';

export type LegacyRole = 'admin' | 'moderator' | 'enterprise' | 'expert' | 'officer' | 'dept_head' | 'director' | 'clerk';
export type AccountType = 'internal' | 'external' | 'expert' | 'partner' | 'system';
export type AccountStatus = 'invited' | 'pending_verification' | 'pending_approval' | 'active' | 'suspended' | 'deactivated' | 'deleted';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: LegacyRole;
  canonical_role?: CanonicalRole;
  account_type?: AccountType;
  account_status?: AccountStatus;
  phone?: string;
  company?: string;
  organization_name?: string;
}

// Role → dashboard path mapping
export const ROLE_DASHBOARD_PATH: Record<CanonicalRole, string> = {
  chief_system_architect: '/admin/architecture',
  fullstack_developer: '/admin/development',
  devsecops_security: '/admin/security',
  data_ai_scientist: '/admin/data-ai',
  natif_executive: '/executive',
  department_manager: '/dept-head',
  grants_orders_specialist: '/grants-orders',
  voucher_startup_specialist: '/voucher-startup',
  finance_disbursement: '/finance',
  legal_risk_control: '/legal-risk',
  admin_desk: '/clerk',
  it_sysadmin_support: '/admin/it-support',
  scientific_council: '/councils',
  independent_expert: '/expert',
  financial_appraiser: '/financial-appraisal',
  independent_auditor: '/auditor',
  external_partner: '/apply/dashboard',
};

// Legacy fallback
const LEGACY_DASHBOARD_PATH: Record<LegacyRole, string> = {
  admin: '/admin',
  moderator: '/moderator',
  expert: '/expert',
  officer: '/officer',
  clerk: '/clerk',
  dept_head: '/dept-head',
  director: '/director',
  enterprise: '/apply/dashboard',
};

export function getDashboardPath(user: AuthUser): string {
  if (user.canonical_role && ROLE_DASHBOARD_PATH[user.canonical_role]) {
    return ROLE_DASHBOARD_PATH[user.canonical_role];
  }
  return LEGACY_DASHBOARD_PATH[user.role] || '/';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getUser();
  if (!user) return false;
  const adminCanonical: CanonicalRole[] = ['chief_system_architect', 'it_sysadmin_support', 'natif_executive'];
  if (user.canonical_role && adminCanonical.includes(user.canonical_role)) return true;
  return user.role === 'admin';
}

export function isInternal(): boolean {
  const user = getUser();
  if (!user) return false;
  const internalTypes: AccountType[] = ['internal'];
  if (user.account_type && internalTypes.includes(user.account_type)) return true;
  return ['admin', 'moderator', 'officer', 'dept_head', 'director', 'clerk'].includes(user.role);
}

export function isExpertRole(): boolean {
  const user = getUser();
  if (!user) return false;
  const expertCanonical: CanonicalRole[] = ['scientific_council', 'independent_expert', 'financial_appraiser', 'independent_auditor'];
  if (user.canonical_role && expertCanonical.includes(user.canonical_role)) return true;
  return user.role === 'expert';
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}
