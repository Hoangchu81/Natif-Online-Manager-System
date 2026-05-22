/**
 * NATIF OMS Design Tokens — TypeScript typed exports
 * Auto-generated from design-tokens.json
 */

export const tokens = {
  color: {
    natif: {
      primary: '#1f3892',
      primaryHover: '#163075',
      primaryLight: '#2b5ab5',
      cyan: '#48C6EF',
      green: '#6FD33D',
      dark: '#0A1628',
      warmBg: '#F8FAFC',
    },
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0891b2',
  },

  workflow: {
    draft: { bg: '#f1f5f9', text: '#475569' },
    submitted: { bg: '#fffbeb', text: '#d97706' },
    received: { bg: '#ecfeff', text: '#0891b2' },
    assigned: { bg: '#eef2ff', text: '#4f46e5' },
    preliminary_review: { bg: '#faf5ff', text: '#7c3aed' },
    expert_review: { bg: '#fff1f2', text: '#e11d48' },
    summarized: { bg: '#fef3c7', text: '#b45309' },
    dept_approved: { bg: '#dcfce7', text: '#16a34a' },
    dept_rejected: { bg: '#fee2e2', text: '#dc2626' },
    approved: { bg: '#dcfce7', text: '#16a34a' },
    rejected: { bg: '#fee2e2', text: '#dc2626' },
  },

  role: {
    admin: { bg: '#dbeafe', text: '#1d4ed8' },
    moderator: { bg: '#e0e7ff', text: '#4338ca' },
    enterprise: { bg: '#dcfce7', text: '#16a34a' },
    expert: { bg: '#fef3c7', text: '#b45309' },
    officer: { bg: '#ecfeff', text: '#0891b2' },
    dept_head: { bg: '#f3e8ff', text: '#7c3aed' },
    director: { bg: '#fee2e2', text: '#dc2626' },
    clerk: { bg: '#f1f5f9', text: '#475569' },
  },

  motion: {
    durationFast: '150ms',
    durationNormal: '200ms',
    durationSlow: '300ms',
    easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
    cardHover: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    header: '0 1px 3px rgba(0,0,0,0.06)',
    modal: '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
    dropdown: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  },

  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
} as const

export type WorkflowState = keyof typeof tokens.workflow
export type UserRole = keyof typeof tokens.role

export function getWorkflowStyle(state: WorkflowState) {
  return tokens.workflow[state]
}

export function getRoleStyle(role: UserRole) {
  return tokens.role[role]
}
