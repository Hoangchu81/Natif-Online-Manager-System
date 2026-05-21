export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'user' | 'expert';
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

export interface ExpertProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  birth_place?: string;
  gender?: string;
  id_number?: string;
  id_issued_date?: string;
  id_issued_place?: string;
  hometown?: string;
  nationality?: string;
  address?: string;
  province?: string;
  bank_account?: string;
  bank_account_name?: string;
  bank_name?: string;
  bank_branch?: string;
  academic_degree?: string;
  degree_year?: number;
  academic_title?: string;
  title_year?: number;
  expertise_fields?: string[];
  avatar_url?: string;
  profile_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ExpertEducation {
  id: string;
  expert_profile_id: string;
  period?: string;
  education_system?: string;
  institution?: string;
  country?: string;
  major?: string;
  degree?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertWorkHistory {
  id: string;
  expert_profile_id: string;
  period_start?: string;
  period_end?: string;
  organization?: string;
  address_phone?: string;
  position?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertResearchProject {
  id: string;
  expert_profile_id: string;
  title: string;
  start_year?: string;
  end_year?: string;
  funding_agency?: string;
  role?: string;
  status?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertPublication {
  id: string;
  expert_profile_id: string;
  title: string;
  authors?: string;
  publisher?: string;
  year?: number;
  publication_type?: string;
  doi?: string;
  issn?: string;
  author_role?: string;
  journal_rank?: string;
  impact_factor?: number;
  citations?: number;
  notes?: string;
  source_url?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertPatent {
  id: string;
  expert_profile_id: string;
  citation: string;
  author_role?: string;
  protection_type?: string;
  country?: string;
  status?: string;
  reference_link?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertAward {
  id: string;
  expert_profile_id: string;
  title: string;
  author_role?: string;
  awarding_body?: string;
  year?: number;
  notes?: string;
  reference_link?: string;
  sort_order: number;
  created_at: Date;
}

export interface ExpertBook {
  id: string;
  expert_profile_id: string;
  title: string;
  link?: string;
  authors?: string;
  publisher?: string;
  isbn?: string;
  notes?: string;
  sort_order: number;
  created_at: Date;
}
