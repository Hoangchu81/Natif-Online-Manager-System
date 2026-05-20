export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'user';
  phone?: string;
  company?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  user_id: string;
  program_type: 'interest_subsidy' | 'sponsorship' | 'voucher' | 'ecosystem';
  company_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  title: string;
  description: string;
  budget_requested: number;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewer_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  requirements: string[];
  max_budget: number;
  min_budget: number;
  is_active: boolean;
  created_at: Date;
}

export interface News {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'activity' | 'tech' | 'announcement';
  author: string;
  published_at: Date;
  is_featured: boolean;
  created_at: Date;
}

export interface DashboardStats {
  total_applications: number;
  pending_review: number;
  approved: number;
  rejected: number;
  total_budget_allocated: number;
  total_budget_disbursed: number;
}
