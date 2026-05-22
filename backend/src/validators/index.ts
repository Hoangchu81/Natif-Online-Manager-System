import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(128),
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const createApplicationSchema = z.object({
  program_type: z.enum(['interest_subsidy', 'sponsorship', 'voucher', 'ecosystem'], {
    errorMap: () => ({ message: 'Loại chương trình không hợp lệ' }),
  }),
  company_name: z.string().min(2).max(255),
  tax_code: z.string().min(5).max(50),
  contact_name: z.string().min(2).max(255),
  contact_email: z.string().email(),
  contact_phone: z.string().max(50).optional(),
  title: z.string().min(5).max(500),
  description: z.string().max(10000).optional(),
  budget_requested: z.number().positive('Ngân sách phải lớn hơn 0'),
});

export const createReviewSchema = z.object({
  assignment_id: z.string().uuid('assignment_id không hợp lệ'),
  application_id: z.string().uuid('application_id không hợp lệ'),
  score_innovation: z.number().int().min(1).max(10),
  score_feasibility: z.number().int().min(1).max(10),
  score_impact: z.number().int().min(1).max(10),
  score_budget: z.number().int().min(1).max(10),
  score_team: z.number().int().min(1).max(10),
  recommendation: z.enum(['approve', 'reject', 'revise']),
  strengths: z.string().max(5000).optional(),
  weaknesses: z.string().max(5000).optional(),
  comments: z.string().max(10000).optional(),
});

export const createAssignmentSchema = z.object({
  application_id: z.string().uuid('application_id không hợp lệ'),
  expert_id: z.string().uuid('expert_id không hợp lệ'),
  deadline: z.string().datetime().optional(),
});

export const workflowTransitionSchema = z.object({
  application_id: z.string().uuid('application_id không hợp lệ'),
  to_status: z.string().min(1),
  notes: z.string().max(5000).optional(),
  dept_head_id: z.string().uuid().optional(),
  officer_id: z.string().uuid().optional(),
  scenario: z.enum(['council', 'survey', 'supplementary', 'reject']).optional(),
  proposal_notes: z.string().max(5000).optional(),
  director_decision_notes: z.string().max(5000).optional(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
});
