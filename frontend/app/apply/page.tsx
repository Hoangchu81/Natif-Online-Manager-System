'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const PROGRAMS = [
  {
    value: 'interest_subsidy',
    label: 'Hỗ trợ lãi suất vay',
    desc: 'Cho doanh nghiệp thực hiện dự án đổi mới công nghệ',
    legal: 'Theo Nghị định 268/2025/NĐ-CP (Phụ lục II)',
    color: 'blue',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    badge: 'badge-blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-natif-blue',
    maxBudget: '5 tỷ VNĐ',
    minBudget: '100 triệu VNĐ',
  },
  {
    value: 'sponsorship',
    label: 'Tài trợ, đặt hàng',
    desc: 'Tài trợ không hoàn lại cho nhiệm vụ KH&CN và ĐMST',
    legal: 'Theo Nghị định 68/2025/NĐ-CP (Phụ lục I)',
    color: 'green',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    badge: 'badge-green',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    maxBudget: '2 tỷ VNĐ',
    minBudget: '50 triệu VNĐ',
  },
  {
    value: 'voucher',
    label: 'Hỗ trợ voucher',
    desc: 'Dịch vụ công nghệ, đào tạo và tư vấn chuyên gia',
    legal: 'Theo Nghị định 268/2025/NĐ-CP (Phụ lục III)',
    color: 'cyan',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    badge: 'badge-cyan',
    bgClass: 'bg-cyan-50',
    borderClass: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    maxBudget: '100 triệu VNĐ',
    minBudget: '5 triệu VNĐ',
  },
  {
    value: 'ecosystem',
    label: 'Thúc đẩy hệ sinh thái',
    desc: 'Phát triển hệ sinh thái đổi mới sáng tạo',
    legal: 'Theo Nghị định 268/2025/NĐ-CP (Phụ lục IV)',
    color: 'amber',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    badge: 'badge-amber',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    maxBudget: '3 tỷ VNĐ',
    minBudget: '200 triệu VNĐ',
  },
];

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1
  program_type: string;
  // Step 2 - Company info
  company_name: string;
  tax_code: string;
  company_address: string;
  district_city: string;
  phone: string;
  email: string;
  website: string;
  company_type: string;
  founding_date: string;
  business_lines: string;
  employee_count: string;
  charter_capital: string;
  total_assets: string;
  // Step 2b - Representative
  representative_name: string;
  representative_position: string;
  representative_id_no: string;
  representative_id_issued_date: string;
  representative_id_issued_place: string;
  has_power_of_attorney: boolean;
  // Step 2c - Contact
  contact_name: string;
  contact_position: string;
  contact_phone: string;
  contact_email: string;
  // Step 3 - Loan info (interest_subsidy only)
  bank_name: string;
  bank_branch: string;
  credit_contract_no: string;
  credit_contract_date: string;
  loan_amount: string;
  disbursed_amount: string;
  outstanding_balance: string;
  loan_purpose: string;
  interest_rate: string;
  loan_term_months: string;
  disbursement_date: string;
  maturity_date: string;
  collateral_description: string;
  collateral_value: string;
  repayment_method: string;
  loan_account_no: string;
  // Step 4 - Project info (all programs)
  project_name: string;
  project_address: string;
  project_objectives: string;
  project_content: string;
  technology_description: string;
  technology_reason: string;
  project_duration: string;
  total_investment: string;
  equity_contribution: string;
  loan_portion: string;
  other_funding: string;
  other_funding_source: string;
  budget_breakdown: string;
  expected_revenue_y1: string;
  expected_revenue_y2: string;
  expected_revenue_y3: string;
  expected_profit_y1: string;
  expected_profit_y2: string;
  expected_profit_y3: string;
  payback_period: string;
  economic_impact: string;
  social_impact: string;
  implementation_milestones: string;
  technical_capacity: string;
  commitment_content: string;
  // Sponsorship specific
  task_location: string;
  task_methodology: string;
  org_description: string;
  org_experience: string;
  // S&T task details (Nghị định 68/2025 - Phụ lục I)
  task_category: string;         // Loại nhiệm vụ S&T
  task_class_code: string;       // Mã số theo danh mục NV
  task_type: string;             // Nghiên cứu / Ứng dụng / Tổng hợp
  expected_products: string;     // Sản phẩm dự kiến
  deliverables_description: string; // Mô tả sản phẩm chi tiết
  work_packages: string;          // Các gói công việc
  research_method: string;       // Phương pháp nghiên cứu
  hr_involvement: string;       // Nhân lực tham gia
  hr_qualification: string;      // Trình độ chuyên môn
  equipment_needed: string;      // Thiết bị cần thiết
  materials_budget: string;      // Vật tư, nguyên liệu
  budget_category_1: string;    // Chi phí nhân lực
  budget_category_2: string;    // Chi phí nguyên liệu
  budget_category_3: string;    // Chi phí thiết bị
  budget_category_4: string;    // Chi phí dịch vụ
  budget_category_5: string;    // Chi phí khác
  budget_total: string;         // Tổng chi phí
  funding_own: string;          // Vốn tự có
  funding_other: string;         // Nguồn khác (ghi rõ)
  ip_ownership: string;         // Sở hữu trí tuệ
  ip_sharing: string;           // Chia sẻ quyền SHTT
  commercialization: string;     // Thương mại hóa
  expected_impact: string;       // Tác động dự kiến
  science_indicators: string;   // Chỉ tiêu khoa học
  // Voucher specific
  service_type: string;
  service_provider: string;
  provider_contact: string;
  service_cost: string;
  commitment_use: string;
  // Ecosystem specific
  activities_description: string;
  activities_results: string;
  org_recognition_type: string;
  // Step 5 - Documents
  doc_dkkd: boolean;
  doc_id_copy: boolean;
  doc_financial_report: boolean;
  doc_credit_contract: boolean;
  doc_no_bad_debt: boolean;
  doc_business_plan: boolean;
  doc_collateral: boolean;
  doc_budget_approved: boolean;
  doc_commitment: boolean;
  doc_board_resolution: boolean;
  doc_other: boolean;
  doc_other_note: string;
}

const initialForm: FormData = {
  program_type: '',
  company_name: '', tax_code: '', company_address: '', district_city: '', phone: '', email: '', website: '',
  company_type: '', founding_date: '', business_lines: '', employee_count: '', charter_capital: '', total_assets: '',
  representative_name: '', representative_position: '', representative_id_no: '', representative_id_issued_date: '',
  representative_id_issued_place: '', has_power_of_attorney: false,
  contact_name: '', contact_position: '', contact_phone: '', contact_email: '',
  bank_name: '', bank_branch: '', credit_contract_no: '', credit_contract_date: '', loan_amount: '',
  disbursed_amount: '', outstanding_balance: '', loan_purpose: '', interest_rate: '', loan_term_months: '',
  disbursement_date: '', maturity_date: '', collateral_description: '', collateral_value: '', repayment_method: '',
  loan_account_no: '',
  project_name: '', project_address: '', project_objectives: '', project_content: '', technology_description: '',
  technology_reason: '', project_duration: '', total_investment: '', equity_contribution: '', loan_portion: '',
  other_funding: '', other_funding_source: '', budget_breakdown: '', expected_revenue_y1: '', expected_revenue_y2: '',
  expected_revenue_y3: '', expected_profit_y1: '', expected_profit_y2: '', expected_profit_y3: '', payback_period: '',
  economic_impact: '', social_impact: '', implementation_milestones: '', technical_capacity: '', commitment_content: '',
  task_location: '', task_methodology: '', org_description: '', org_experience: '',
  task_category: '', task_class_code: '', task_type: '', expected_products: '', deliverables_description: '',
  work_packages: '', research_method: '', hr_involvement: '', hr_qualification: '', equipment_needed: '',
  materials_budget: '', budget_category_1: '', budget_category_2: '', budget_category_3: '',
  budget_category_4: '', budget_category_5: '', budget_total: '', funding_own: '', funding_other: '',
  ip_ownership: '', ip_sharing: '', commercialization: '', expected_impact: '', science_indicators: '',
  service_type: '', service_provider: '', provider_contact: '', service_cost: '', commitment_use: '',
  activities_description: '', activities_results: '', org_recognition_type: '',
  doc_dkkd: false, doc_id_copy: false, doc_financial_report: false, doc_credit_contract: false,
  doc_no_bad_debt: false, doc_business_plan: false, doc_collateral: false, doc_budget_approved: false,
  doc_commitment: false, doc_board_resolution: false, doc_other: false, doc_other_note: '',
};

function formatCurrency(num: number) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + ' triệu';
  return num.toLocaleString('vi-VN');
}

export default function ApplyPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.company_name.trim()) e.company_name = 'Tên doanh nghiệp là bắt buộc';
    if (!form.tax_code.trim()) e.tax_code = 'Mã số thuế là bắt buộc';
    else if (!/^\d{10}(\d{3})?$/.test(form.tax_code.replace(/\s/g, ''))) e.tax_code = 'Mã số thuế không hợp lệ';
    if (!form.district_city.trim()) e.district_city = 'Quận/Huyện, Tỉnh/Thành phố là bắt buộc';
    if (!form.representative_name.trim()) e.representative_name = 'Người đại diện là bắt buộc';
    if (!form.representative_id_no.trim()) e.representative_id_no = 'Số CCCD là bắt buộc';
    if (!form.representative_id_issued_date.trim()) e.representative_id_issued_date = 'Ngày cấp CCCD là bắt buộc';
    if (!form.representative_id_issued_place.trim()) e.representative_id_issued_place = 'Nơi cấp CCCD là bắt buộc';
    if (!form.contact_name.trim()) e.contact_name = 'Người liên hệ là bắt buộc';
    if (!form.contact_email.trim()) e.contact_email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'Email không hợp lệ';
    if (!form.phone.trim()) e.phone = 'Số điện thoại là bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    if (form.program_type !== 'interest_subsidy') return true;
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.bank_name.trim()) e.bank_name = 'Tên ngân hàng là bắt buộc';
    if (!form.credit_contract_no.trim()) e.credit_contract_no = 'Số hợp đồng tín dụng là bắt buộc';
    if (!form.loan_amount.trim()) e.loan_amount = 'Số tiền vay là bắt buộc';
    if (!form.disbursed_amount.trim()) e.disbursed_amount = 'Số tiền đã giải ngân là bắt buộc';
    if (!form.outstanding_balance.trim()) e.outstanding_balance = 'Số dư nợ còn lại là bắt buộc';
    if (!form.interest_rate.trim()) e.interest_rate = 'Lãi suất là bắt buộc';
    if (!form.collateral_description.trim()) e.collateral_description = 'Mô tả tài sản bảo đảm là bắt buộc';
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateStep4 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.project_name.trim()) e.project_name = 'Tên dự án là bắt buộc';
    if (!form.project_objectives.trim()) e.project_objectives = 'Mục tiêu dự án là bắt buộc';
    if (!form.project_content.trim()) e.project_content = 'Nội dung dự án là bắt buộc';
    if (!form.total_investment.trim()) e.total_investment = 'Tổng vốn đầu tư là bắt buộc';
    if (!form.equity_contribution.trim()) e.equity_contribution = 'Vốn tự có là bắt buộc';
    if (!form.budget_breakdown.trim()) e.budget_breakdown = 'Dự toán chi phí là bắt buộc';
    if (!form.expected_revenue_y1.trim()) e.expected_revenue_y1 = 'Doanh thu năm 1 là bắt buộc';
    if (!form.payback_period.trim()) e.payback_period = 'Thời gian hoàn vốn là bắt buộc';
    if (!form.commitment_content.trim()) e.commitment_content = 'Nội dung cam kết là bắt buộc';
    if (!form.implementation_milestones.trim()) e.implementation_milestones = 'Tiến độ thực hiện là bắt buộc';
    if (form.program_type === 'voucher') {
      if (!form.service_type.trim()) e.service_type = 'Loại dịch vụ là bắt buộc';
      if (!form.service_provider.trim()) e.service_provider = 'Đơn vị cung cấp là bắt buộc';
    }
    if (form.program_type === 'ecosystem') {
      if (!form.activities_description.trim()) e.activities_description = 'Mô tả hoạt động là bắt buộc';
    }
    if (form.program_type === 'sponsorship') {
      if (!form.task_category.trim()) e.task_category = 'Loại nhiệm vụ S&T là bắt buộc';
      if (!form.expected_products.trim()) e.expected_products = 'Sản phẩm dự kiến là bắt buộc';
      if (!form.deliverables_description.trim()) e.deliverables_description = 'Mô tả sản phẩm chi tiết là bắt buộc';
      if (!form.work_packages.trim()) e.work_packages = 'Các gói công việc là bắt buộc';
      if (!form.hr_involvement.trim()) e.hr_involvement = 'Nhân lực tham gia là bắt buộc';
      if (!form.budget_category_1.trim()) e.budget_category_1 = 'Chi phí nhân lực là bắt buộc';
      if (!form.budget_category_2.trim()) e.budget_category_2 = 'Chi phí nguyên liệu là bắt buộc';
      if (!form.budget_category_3.trim()) e.budget_category_3 = 'Chi phí thiết bị là bắt buộc';
      if (!form.ip_ownership.trim()) e.ip_ownership = 'Sở hữu trí tuệ là bắt buộc';
    }
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateStep5 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.doc_dkkd) e.doc_dkkd = 'ĐKKD là bắt buộc';
    if (!form.doc_id_copy) e.doc_id_copy = 'Bản sao CCCD là bắt buộc';
    if (!form.doc_financial_report) e.doc_financial_report = 'Báo cáo tài chính là bắt buộc';
    if (!form.doc_commitment) e.doc_commitment = 'Cam kết hoàn vốn là bắt buộc';
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && form.program_type) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4 && validateStep4()) setStep(5);
  };

  const handleBack = () => {
    if (step === 5) setStep(4);
    else if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const getStepLabel = (s: Step) => {
    const labels: Record<Step, string> = {
      1: 'Chọn chương trình',
      2: 'Thông tin doanh nghiệp',
      3: form.program_type === 'interest_subsidy' ? 'Thông tin khoản vay' : 'Nội dung hồ sơ',
      4: 'Thông tin dự án',
      5: 'Tài liệu đính kèm',
    };
    return labels[s];
  };

  const totalSteps = form.program_type === 'interest_subsidy' ? 5 : 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.program_type === 'interest_subsidy') {
      if (!validateStep5()) return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      program_type: form.program_type,
      company_name: form.company_name,
      tax_code: form.tax_code,
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      title: form.project_name,
      description: JSON.stringify({
        // Company
        district_city: form.district_city, phone: form.phone, email: form.email, website: form.website,
        company_type: form.company_type, founding_date: form.founding_date, business_lines: form.business_lines,
        employee_count: form.employee_count, charter_capital: form.charter_capital, total_assets: form.total_assets,
        // Representative
        representative_name: form.representative_name, representative_position: form.representative_position,
        representative_id_no: form.representative_id_no, representative_id_issued_date: form.representative_id_issued_date,
        representative_id_issued_place: form.representative_id_issued_place, has_power_of_attorney: form.has_power_of_attorney,
        // Contact
        contact_position: form.contact_position,
        // Loan
        bank_name: form.bank_name, bank_branch: form.bank_branch, credit_contract_no: form.credit_contract_no,
        credit_contract_date: form.credit_contract_date, loan_amount: form.loan_amount, disbursed_amount: form.disbursed_amount,
        outstanding_balance: form.outstanding_balance, loan_purpose: form.loan_purpose, interest_rate: form.interest_rate,
        loan_term_months: form.loan_term_months, disbursement_date: form.disbursement_date, maturity_date: form.maturity_date,
        collateral_description: form.collateral_description, collateral_value: form.collateral_value,
        repayment_method: form.repayment_method, loan_account_no: form.loan_account_no,
        // Project
        project_address: form.project_address, project_objectives: form.project_objectives,
        project_content: form.project_content, technology_description: form.technology_description,
        technology_reason: form.technology_reason, project_duration: form.project_duration,
        total_investment: form.total_investment, equity_contribution: form.equity_contribution,
        loan_portion: form.loan_portion, other_funding: form.other_funding, other_funding_source: form.other_funding_source,
        budget_breakdown: form.budget_breakdown,
        expected_revenue_y1: form.expected_revenue_y1, expected_revenue_y2: form.expected_revenue_y2,
        expected_revenue_y3: form.expected_revenue_y3,
        expected_profit_y1: form.expected_profit_y1, expected_profit_y2: form.expected_profit_y2,
        expected_profit_y3: form.expected_profit_y3,
        payback_period: form.payback_period, economic_impact: form.economic_impact, social_impact: form.social_impact,
        implementation_milestones: form.implementation_milestones, technical_capacity: form.technical_capacity,
        commitment_content: form.commitment_content,
        // Sponsorship
        task_location: form.task_location, task_methodology: form.task_methodology,
        org_description: form.org_description, org_experience: form.org_experience,
        task_category: form.task_category, task_class_code: form.task_class_code, task_type: form.task_type,
        expected_products: form.expected_products, deliverables_description: form.deliverables_description,
        work_packages: form.work_packages, research_method: form.research_method,
        hr_involvement: form.hr_involvement, hr_qualification: form.hr_qualification,
        equipment_needed: form.equipment_needed, materials_budget: form.materials_budget,
        budget_category_1: form.budget_category_1, budget_category_2: form.budget_category_2,
        budget_category_3: form.budget_category_3, budget_category_4: form.budget_category_4,
        budget_category_5: form.budget_category_5, budget_total: form.budget_total,
        funding_own: form.funding_own, funding_other: form.funding_other,
        ip_ownership: form.ip_ownership, ip_sharing: form.ip_sharing,
        commercialization: form.commercialization, expected_impact: form.expected_impact,
        science_indicators: form.science_indicators,
        // Voucher
        service_type: form.service_type, service_provider: form.service_provider,
        provider_contact: form.provider_contact, service_cost: form.service_cost, commitment_use: form.commitment_use,
        // Ecosystem
        activities_description: form.activities_description, activities_results: form.activities_results,
        org_recognition_type: form.org_recognition_type,
        // Documents
        doc_other_note: form.doc_other_note,
      }),
      budget_requested: Number(form.loan_portion || form.total_investment || 0),
    };

    try {
      const res = await authFetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gửi hồ sơ thất bại');
      }
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    }
  };

  const selectedProgram = PROGRAMS.find(p => p.value === form.program_type);
  const isInterestSubsidy = form.program_type === 'interest_subsidy';

  if (status === 'success') {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 bg-gray-50">
          <div className="max-w-lg w-full mx-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading font-bold text-2xl text-gray-900 mb-3">Nộp hồ sơ thành công!</h1>
            <p className="text-gray-500 mb-8">
              Hồ sơ của bạn đã được ghi nhận. Đội ngũ NATIF sẽ xem xét và phản hồi qua email trong vòng <strong>5 ngày làm việc</strong>.
            </p>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Chương trình</span>
                <span className="font-medium text-gray-900">{selectedProgram?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dự án</span>
                <span className="font-medium text-gray-900">{form.project_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Doanh nghiệp</span>
                <span className="font-medium text-gray-900">{form.company_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã số thuế</span>
                <span className="font-medium text-gray-900">{form.tax_code}</span>
              </div>
              {isInterestSubsidy && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngân hàng</span>
                    <span className="font-medium text-gray-900">{form.bank_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số tiền vay</span>
                    <span className="font-semibold text-natif-blue">
                      {form.loan_amount ? formatCurrency(Number(form.loan_amount)) : '—'} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số dư nợ còn lại</span>
                    <span className="font-semibold text-natif-blue">
                      {form.outstanding_balance ? formatCurrency(Number(form.outstanding_balance)) : '—'} VNĐ
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Căn cứ pháp lý</span>
                <span className="font-medium text-gray-900 text-right text-xs">{selectedProgram?.legal}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/login" className="btn-primary justify-center">Đăng nhập theo dõi hồ sơ</a>
              <a href="/" className="btn-secondary justify-center">Quay về trang chủ</a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* Page header */}
        <div className="bg-gov-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <a href="/" className="hover:text-white">Trang chủ</a>
                <span>/</span>
                <span>Nộp hồ sơ</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl md:text-4xl mb-2">Nộp hồ sơ xin hỗ trợ</h1>
              <p className="text-white/80 text-sm">
                {isInterestSubsidy
                  ? 'Hồ sơ chi tiết theo mẫu Quỹ NATIF — Nghị định 268/2025/NĐ-CP (Phụ lục II). Điền đầy đủ thông tin theo từng phần.'
                  : 'Hoàn tất hồ sơ theo các bước bên dưới để được xem xét hỗ trợ.'}
              </p>
              <a href="/apply/dashboard" className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Theo dõi hồ sơ đã nộp →
              </a>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-5 overflow-x-auto">
              {([1, 2, 3, 4, 5] as Step[]).filter(s => s <= totalSteps).map((s, i, arr) => (
                <div key={s} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-2 ${step >= s ? 'text-natif-blue' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0
                      ${step >= s ? 'bg-natif-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step > s ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap hidden md:block">{getStepLabel(s)}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-2 shrink-0 ${step > s ? 'bg-natif-blue' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit}>

              {/* Step 1: Select program */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <h2 className="font-heading font-bold text-lg text-gray-900 mb-1">Chọn chương trình hỗ trợ</h2>
                    <p className="text-gray-500 text-sm mb-6">Chọn loại hỗ trợ phù hợp với nhu cầu của doanh nghiệp.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PROGRAMS.map((p) => (
                        <button key={p.value} type="button" onClick={() => set('program_type', p.value)}
                          className={`text-left p-5 rounded-xl border-2 transition-all relative
                            ${form.program_type === p.value
                              ? `${p.borderClass} ${p.bgClass}`
                              : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${p.iconBg}`}>
                              <svg className={`w-5 h-5 ${p.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm mb-1">{p.label}</div>
                              <div className="text-xs text-gray-500 leading-relaxed mb-2">{p.desc}</div>
                              <div className="text-xs text-gray-400">{p.legal}</div>
                              <div className="text-xs font-medium text-gray-700 mt-1">
                                Từ {p.minBudget} — Tối đa {p.maxBudget}
                              </div>
                            </div>
                          </div>
                          {form.program_type === p.value && (
                            <div className="absolute top-3 right-3">
                              <svg className="w-5 h-5 text-natif-blue" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={handleNext} disabled={!form.program_type}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Company info */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">Thông tin doanh nghiệp</h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {isInterestSubsidy
                            ? 'Phần A: Thông tin doanh nghiệp — Nghị định 268/2025/NĐ-CP (Phụ lục II)'
                            : 'Thông tin pháp lý, người đại diện và người liên hệ của tổ chức/doanh nghiệp'}
                        </p>
                      </div>
                      <button type="button" onClick={handleBack} className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-6">
                      {/* A. Thông tin pháp lý */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-natif-blue text-white text-xs flex items-center justify-center font-bold">A</span>
                          Thông tin pháp lý
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Tên doanh nghiệp (theo ĐKKD) <span className="text-red-500">*</span></label>
                            <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)}
                              className={`form-input ${errors.company_name ? 'border-red-400' : ''}`}
                              placeholder="Công ty TNHH MTV ABC Việt Nam" />
                            {errors.company_name && <p className="form-error">{errors.company_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Mã số thuế (MST) <span className="text-red-500">*</span></label>
                            <input type="text" value={form.tax_code} onChange={e => set('tax_code', e.target.value)}
                              className={`form-input ${errors.tax_code ? 'border-red-400' : ''}`}
                              placeholder="0123456789" maxLength={14} />
                            {errors.tax_code && <p className="form-error">{errors.tax_code}</p>}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="form-label">Địa chỉ trụ sở chính</label>
                            <input type="text" value={form.company_address} onChange={e => set('company_address', e.target.value)}
                              className="form-input" placeholder="Số X, đường Y, phường Z" />
                          </div>
                          <div>
                            <label className="form-label">Quận/Huyện, Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                            <input type="text" value={form.district_city} onChange={e => set('district_city', e.target.value)}
                              className={`form-input ${errors.district_city ? 'border-red-400' : ''}`}
                              placeholder="Quận Cầu Giấy, Hà Nội" />
                            {errors.district_city && <p className="form-error">{errors.district_city}</p>}
                          </div>
                          <div>
                            <label className="form-label">Số điện thoại <span className="text-red-500">*</span></label>
                            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                              className={`form-input ${errors.phone ? 'border-red-400' : ''}`}
                              placeholder="024 3xxx xxxx" />
                            {errors.phone && <p className="form-error">{errors.phone}</p>}
                          </div>
                          <div>
                            <label className="form-label">Email</label>
                            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                              className="form-input" placeholder="contact@doanhnghiep.vn" />
                          </div>
                          <div>
                            <label className="form-label">Website (nếu có)</label>
                            <input type="text" value={form.website} onChange={e => set('website', e.target.value)}
                              className="form-input" placeholder="https://doanhnghiep.vn" />
                          </div>
                          <div>
                            <label className="form-label">Loại hình doanh nghiệp</label>
                            <select value={form.company_type} onChange={e => set('company_type', e.target.value)} className="form-input">
                              <option value="">-- Chọn loại hình --</option>
                              <option value="dn_tu_nhan">Doanh nghiệp tư nhân</option>
                              <option value="tnhh_1tv">Công ty TNHH một thành viên</option>
                              <option value="tnhh_2tv">Công ty TNHH hai thành viên trở lên</option>
                              <option value="ctcp">Công ty cổ phần</option>
                              <option value="htx">Hợp tác xã</option>
                              <option value="khac">Loại hình khác</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Ngày thành lập</label>
                            <input type="date" value={form.founding_date} onChange={e => set('founding_date', e.target.value)}
                              className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">Ngành nghề đăng ký kinh doanh</label>
                            <input type="text" value={form.business_lines} onChange={e => set('business_lines', e.target.value)}
                              className="form-input" placeholder="Theo ĐKKD" />
                          </div>
                          <div>
                            <label className="form-label">Số lao động hiện có</label>
                            <input type="number" value={form.employee_count} onChange={e => set('employee_count', e.target.value)}
                              className="form-input" placeholder="50" min="0" />
                          </div>
                          <div>
                            <label className="form-label">Vốn điều lệ (VNĐ)</label>
                            <input type="number" value={form.charter_capital} onChange={e => set('charter_capital', e.target.value)}
                              className="form-input" placeholder="10000000000" min="0" step="1000000" />
                          </div>
                          <div>
                            <label className="form-label">Tổng tài sản (VNĐ)</label>
                            <input type="number" value={form.total_assets} onChange={e => set('total_assets', e.target.value)}
                              className="form-input" placeholder="50000000000" min="0" step="1000000" />
                          </div>
                        </div>
                      </div>

                      {/* B. Người đại diện */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-natif-blue text-white text-xs flex items-center justify-center font-bold">B</span>
                          Người đại diện pháp lý
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                            <input type="text" value={form.representative_name} onChange={e => set('representative_name', e.target.value)}
                              className={`form-input ${errors.representative_name ? 'border-red-400' : ''}`}
                              placeholder="Nguyễn Văn A" />
                            {errors.representative_name && <p className="form-error">{errors.representative_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Chức vụ</label>
                            <input type="text" value={form.representative_position} onChange={e => set('representative_position', e.target.value)}
                              className="form-input" placeholder="Giám đốc" />
                          </div>
                          <div>
                            <label className="form-label">Số CCCD/CMND <span className="text-red-500">*</span></label>
                            <input type="text" value={form.representative_id_no} onChange={e => set('representative_id_no', e.target.value)}
                              className={`form-input ${errors.representative_id_no ? 'border-red-400' : ''}`}
                              placeholder="012345678901" maxLength={12} />
                            {errors.representative_id_no && <p className="form-error">{errors.representative_id_no}</p>}
                          </div>
                          <div>
                            <label className="form-label">Ngày cấp CCCD <span className="text-red-500">*</span></label>
                            <input type="date" value={form.representative_id_issued_date} onChange={e => set('representative_id_issued_date', e.target.value)}
                              className={`form-input ${errors.representative_id_issued_date ? 'border-red-400' : ''}`} />
                            {errors.representative_id_issued_date && <p className="form-error">{errors.representative_id_issued_date}</p>}
                          </div>
                          <div>
                            <label className="form-label">Nơi cấp CCCD <span className="text-red-500">*</span></label>
                            <input type="text" value={form.representative_id_issued_place} onChange={e => set('representative_id_issued_place', e.target.value)}
                              className={`form-input ${errors.representative_id_issued_place ? 'border-red-400' : ''}`}
                              placeholder="Công an TP. Hà Nội" />
                            {errors.representative_id_issued_place && <p className="form-error">{errors.representative_id_issued_place}</p>}
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 sm:col-span-2">
                            <input type="checkbox" id="has_poa" checked={form.has_power_of_attorney} onChange={e => set('has_power_of_attorney', e.target.checked)}
                              className="w-4 h-4 text-natif-blue rounded border-gray-300" />
                            <label htmlFor="has_poa" className="text-sm text-gray-700">
                              Doanh nghiệp ủy quyền cho người khác nộp hồ sơ (có giấy ủy quyền đính kèm)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* C. Người liên hệ */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-natif-blue text-white text-xs flex items-center justify-center font-bold">C</span>
                          Người liên hệ (phụ trách hồ sơ)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                            <input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)}
                              className={`form-input ${errors.contact_name ? 'border-red-400' : ''}`}
                              placeholder="Nguyễn Thị B" />
                            {errors.contact_name && <p className="form-error">{errors.contact_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Chức vụ</label>
                            <input type="text" value={form.contact_position} onChange={e => set('contact_position', e.target.value)}
                              className="form-input" placeholder="Kế toán trưởng" />
                          </div>
                          <div>
                            <label className="form-label">Email <span className="text-red-500">*</span></label>
                            <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                              className={`form-input ${errors.contact_email ? 'border-red-400' : ''}`}
                              placeholder="hotro@doanhnghiep.vn" />
                            {errors.contact_email && <p className="form-error">{errors.contact_email}</p>}
                          </div>
                          <div>
                            <label className="form-label">Điện thoại</label>
                            <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                              className="form-input" placeholder="0912 345 678" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="btn-secondary">← Quay lại</button>
                    <button type="button" onClick={handleNext} className="btn-primary">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Loan info (interest_subsidy only) */}
              {step === 3 && isInterestSubsidy && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">Thông tin khoản vay</h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          Phần B: Thông tin khoản vay tại ngân hàng thương mại — Nghị định 268/2025/NĐ-CP
                        </p>
                      </div>
                      <button type="button" onClick={handleBack} className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-6">
                      {/* Thông tin hợp đồng */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                          Thông tin hợp đồng tín dụng
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Tên ngân hàng cho vay <span className="text-red-500">*</span></label>
                            <input type="text" value={form.bank_name} onChange={e => set('bank_name', e.target.value)}
                              className={`form-input ${errors.bank_name ? 'border-red-400' : ''}`}
                              placeholder="Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)" />
                            {errors.bank_name && <p className="form-error">{errors.bank_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Chi nhánh/TP ngân hàng</label>
                            <input type="text" value={form.bank_branch} onChange={e => set('bank_branch', e.target.value)}
                              className="form-input" placeholder="Chi nhánh TP. Hồ Chí Minh" />
                          </div>
                          <div>
                            <label className="form-label">Số hợp đồng tín dụng <span className="text-red-500">*</span></label>
                            <input type="text" value={form.credit_contract_no} onChange={e => set('credit_contract_no', e.target.value)}
                              className={`form-input ${errors.credit_contract_no ? 'border-red-400' : ''}`}
                              placeholder="001/HDTD/2026" />
                            {errors.credit_contract_no && <p className="form-error">{errors.credit_contract_no}</p>}
                          </div>
                          <div>
                            <label className="form-label">Ngày ký hợp đồng</label>
                            <input type="date" value={form.credit_contract_date} onChange={e => set('credit_contract_date', e.target.value)}
                              className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">Số tài khoản thanh toán</label>
                            <input type="text" value={form.loan_account_no} onChange={e => set('loan_account_no', e.target.value)}
                              className="form-input" placeholder="1234567890123" />
                          </div>
                          <div>
                            <label className="form-label">Phương thức trả nợ</label>
                            <select value={form.repayment_method} onChange={e => set('repayment_method', e.target.value)} className="form-input">
                              <option value="">-- Chọn --</option>
                              <option value="monthly">Hàng tháng</option>
                              <option value="quarterly">Hàng quý</option>
                              <option value="bullet">Một lần khi đáo hạn</option>
                              <option value="mixed">Kết hợp (vốn gốc định kỳ, lãi hàng tháng)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Số tiền vay */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                          Số tiền vay và giải ngân
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Tổng số tiền vay theo HĐ tín dụng (VNĐ) <span className="text-red-500">*</span></label>
                            <input type="number" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)}
                              className={`form-input ${errors.loan_amount ? 'border-red-400' : ''}`}
                              placeholder="3000000000" min="0" step="1000000" />
                            {errors.loan_amount && <p className="form-error">{errors.loan_amount}</p>}
                            {form.loan_amount && !isNaN(Number(form.loan_amount)) && Number(form.loan_amount) > 0 && (
                              <p className="text-xs text-gray-500 mt-1">Tương đương: {formatCurrency(Number(form.loan_amount))} VNĐ</p>
                            )}
                          </div>
                          <div>
                            <label className="form-label">Lãi suất theo HĐ (%/năm) <span className="text-red-500">*</span></label>
                            <input type="text" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)}
                              className={`form-input ${errors.interest_rate ? 'border-red-400' : ''}`}
                              placeholder="8.5" />
                            {errors.interest_rate && <p className="form-error">{errors.interest_rate}</p>}
                          </div>
                          <div>
                            <label className="form-label">Số tiền đã giải ngân (VNĐ) <span className="text-red-500">*</span></label>
                            <input type="number" value={form.disbursed_amount} onChange={e => set('disbursed_amount', e.target.value)}
                              className={`form-input ${errors.disbursed_amount ? 'border-red-400' : ''}`}
                              placeholder="1500000000" min="0" step="1000000" />
                            {errors.disbursed_amount && <p className="form-error">{errors.disbursed_amount}</p>}
                          </div>
                          <div>
                            <label className="form-label">Số dư nợ gốc còn lại (VNĐ) <span className="text-red-500">*</span></label>
                            <input type="number" value={form.outstanding_balance} onChange={e => set('outstanding_balance', e.target.value)}
                              className={`form-input ${errors.outstanding_balance ? 'border-red-400' : ''}`}
                              placeholder="2500000000" min="0" step="1000000" />
                            {errors.outstanding_balance && <p className="form-error">{errors.outstanding_balance}</p>}
                          </div>
                          <div>
                            <label className="form-label">Ngày giải ngân dự kiến/đã giải ngân</label>
                            <input type="date" value={form.disbursement_date} onChange={e => set('disbursement_date', e.target.value)}
                              className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">Ngày đến hạn trả nợ</label>
                            <input type="date" value={form.maturity_date} onChange={e => set('maturity_date', e.target.value)}
                              className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">Thời hạn vay (tháng)</label>
                            <input type="number" value={form.loan_term_months} onChange={e => set('loan_term_months', e.target.value)}
                              className="form-input" placeholder="36" min="1" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="form-label">Mục đích vay theo HĐ tín dụng</label>
                            <textarea rows={2} value={form.loan_purpose} onChange={e => set('loan_purpose', e.target.value)}
                              className="form-input resize-none"
                              placeholder="Mua sắm máy móc, thiết bị phục vụ đổi mới công nghệ sản xuất..." />
                          </div>
                        </div>
                      </div>

                      {/* Tài sản bảo đảm */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                          Tài sản bảo đảm cho khoản vay
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Mô tả tài sản bảo đảm <span className="text-red-500">*</span></label>
                            <textarea rows={3} value={form.collateral_description} onChange={e => set('collateral_description', e.target.value)}
                              className={`form-input resize-none ${errors.collateral_description ? 'border-red-400' : ''}`}
                              placeholder="- Nhà xưởng tại KCN ABC, diện tích 2.000m²&#10;- Máy móc thiết bị dây chuyền sản xuất&#10;- Phương tiện vận tải: 03 xe ô tô tải" />
                            {errors.collateral_description && <p className="form-error">{errors.collateral_description}</p>}
                          </div>
                          <div>
                            <label className="form-label">Tổng giá trị tài sản bảo đảm (VNĐ)</label>
                            <input type="number" value={form.collateral_value} onChange={e => set('collateral_value', e.target.value)}
                              className="form-input" placeholder="5000000000" min="0" step="1000000" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800">
                        <strong>Lưu ý:</strong> Theo Nghị định 268/2025/NĐ-CP, doanh nghiệp phải không có nợ xấu tại tổ chức tín dụng và đảm bảo hoàn vốn với phương án trả nợ khả thi. Quỹ hỗ trợ tối đa <strong>5 tỷ VNĐ</strong>, tối thiểu <strong>100 triệu VNĐ</strong>.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="btn-secondary">← Quay lại</button>
                    <button type="button" onClick={handleNext} className="btn-primary">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Project content (non-interest_subsidy) */}
              {step === 3 && !isInterestSubsidy && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">Nội dung hồ sơ</h2>
                        <p className="text-gray-500 text-sm mt-0.5">{selectedProgram?.legal}</p>
                      </div>
                      <button type="button" onClick={handleBack} className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-5">
                      {/* Sponsorship */}
                      {form.program_type === 'sponsorship' && (
                        <div className="space-y-4">
                          {/* A. Thông tin nhiệm vụ S&T */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">A</span>
                              Thông tin nhiệm vụ khoa học và công nghệ — Nghị định 68/2025/NĐ-CP (Phụ lục I)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="form-label">Tên nhiệm vụ KH&CN <span className="text-red-500">*</span></label>
                                <input type="text" value={form.project_name} onChange={e => set('project_name', e.target.value)}
                                  className="form-input" placeholder="Nghiên cứu ứng dụng AI trong sản xuất thông minh" />
                              </div>
                              <div>
                                <label className="form-label">Loại nhiệm vụ S&T <span className="text-red-500">*</span></label>
                                <select value={form.task_category} onChange={e => set('task_category', e.target.value)} className="form-input">
                                  <option value="">-- Chọn loại nhiệm vụ --</option>
                                  <option value="nc_coban">Nghiên cứu cơ bản</option>
                                  <option value="nc_ungdung">Nghiên cứu ứng dụng</option>
                                  <option value="nc_thuchien">Nghiên cứu triển khai thực hiện</option>
                                  <option value="pilot">Thử nghiệm, pilot</option>
                                </select>
                              </div>
                              <div>
                                <label className="form-label">Mã số danh mục nhiệm vụ</label>
                                <input type="text" value={form.task_class_code} onChange={e => set('task_class_code', e.target.value)}
                                  className="form-input" placeholder="NV-2026-XXX" />
                              </div>
                              <div>
                                <label className="form-label">Loại hình nghiên cứu</label>
                                <select value={form.task_type} onChange={e => set('task_type', e.target.value)} className="form-input">
                                  <option value="">-- Chọn --</option>
                                  <option value="nc">Nghiên cứu</option>
                                  <option value="ungdung">Ứng dụng</option>
                                  <option value="tonghop">Tổng hợp</option>
                                  <option value="tuvan">Tư vấn</option>
                                </select>
                              </div>
                              <div>
                                <label className="form-label">Địa điểm thực hiện</label>
                                <input type="text" value={form.task_location} onChange={e => set('task_location', e.target.value)}
                                  className="form-input" placeholder="TP. Hồ Chí Minh / Địa chỉ cụ thể" />
                              </div>
                            </div>
                          </div>

                          {/* B. Sản phẩm và gói công việc */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">B</span>
                              Sản phẩm, kết quả dự kiến và gói công việc
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="form-label">Sản phẩm dự kiến <span className="text-red-500">*</span></label>
                                <textarea rows={3} value={form.expected_products} onChange={e => set('expected_products', e.target.value)}
                                  className={`form-input resize-none ${errors.expected_products ? 'border-red-400' : ''}`}
                                  placeholder="VD: Báo cáo tổng hợp kết quả nghiên cứu; Tài liệu kỹ thuật; Phần mềm; Mô hình thử nghiệm..." />
                                {errors.expected_products && <p className="form-error">{errors.expected_products}</p>}
                              </div>
                              <div>
                                <label className="form-label">Mô tả sản phẩm chi tiết <span className="text-red-500">*</span></label>
                                <textarea rows={4} value={form.deliverables_description} onChange={e => set('deliverables_description', e.target.value)}
                                  className={`form-input resize-none ${errors.deliverables_description ? 'border-red-400' : ''}`}
                                  placeholder="Mô tả chi tiết từng sản phẩm, kết quả nghiên cứu cụ thể, chỉ tiêu định lượng (nếu có)..." />
                                {errors.deliverables_description && <p className="form-error">{errors.deliverables_description}</p>}
                              </div>
                              <div>
                                <label className="form-label">Các gói công việc <span className="text-red-500">*</span></label>
                                <textarea rows={4} value={form.work_packages} onChange={e => set('work_packages', e.target.value)}
                                  className={`form-input resize-none ${errors.work_packages ? 'border-red-400' : ''}`}
                                  placeholder="Gói 1 (tháng 1-3): Khảo sát, thu thập dữ liệu&#10;Gói 2 (tháng 4-8): Phân tích, thiết kế&#10;Gói 3 (tháng 9-12): Triển khai, thử nghiệm&#10;Gói 4 (tháng 13-15): Tổng kết, nghiệm thu" />
                                {errors.work_packages && <p className="form-error">{errors.work_packages}</p>}
                              </div>
                              <div>
                                <label className="form-label">Chỉ tiêu khoa học dự kiến</label>
                                <textarea rows={2} value={form.science_indicators} onChange={e => set('science_indicators', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="VD: 01 bài báo quốc tế indexed Scopus; 02 báo cáo khoa học; 01 patent..." />
                              </div>
                              <div>
                                <label className="form-label">Phương pháp nghiên cứu</label>
                                <textarea rows={2} value={form.research_method} onChange={e => set('research_method', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="VD: Phương pháp khảo sát, phân tích SWOT, mô hình hóa..." />
                              </div>
                            </div>
                          </div>

                          {/* C. Nhân lực và thiết bị */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">C</span>
                              Nhân lực và thiết bị
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="form-label">Nhân lực tham gia thực hiện nhiệm vụ <span className="text-red-500">*</span></label>
                                <textarea rows={3} value={form.hr_involvement} onChange={e => set('hr_involvement', e.target.value)}
                                  className={`form-input resize-none ${errors.hr_involvement ? 'border-red-400' : ''}`}
                                  placeholder="Chủ nhiệm: PGS.TS Nguyễn Văn A (10% time)&#10;Thư ký: ThS. Trần Thị B (50% time)&#10;Cộng tác viên: KS. Lê Văn C (30% time)" />
                                {errors.hr_involvement && <p className="form-error">{errors.hr_involvement}</p>}
                              </div>
                              <div>
                                <label className="form-label">Trình độ chuyên môn của nhóm nghiên cứu</label>
                                <textarea rows={2} value={form.hr_qualification} onChange={e => set('hr_qualification', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="VD: 02 tiến sĩ, 03 thạc sĩ, 05 kỹ sư; trung bình 8 năm kinh nghiệm trong lĩnh vực..." />
                              </div>
                              <div>
                                <label className="form-label">Thiết bị, vật tư cần thiết</label>
                                <textarea rows={2} value={form.equipment_needed} onChange={e => set('equipment_needed', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="VD: Máy tính chuyên dụng, phần mềm phân tích, thiết bị đo lường..." />
                              </div>
                            </div>
                          </div>

                          {/* D. Dự toán kinh phí */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">D</span>
                              Dự toán kinh phí — Theo Thông tư 40/2024/TT-BKH&CN
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="form-label">Chi phí nhân lực (NVL) <span className="text-red-500">*</span></label>
                                <input type="number" value={form.budget_category_1} onChange={e => set('budget_category_1', e.target.value)}
                                  className={`form-input ${errors.budget_category_1 ? 'border-red-400' : ''}`}
                                  placeholder="200000000" min="0" step="1000000" />
                                {errors.budget_category_1 && <p className="form-error">{errors.budget_category_1}</p>}
                              </div>
                              <div>
                                <label className="form-label">Chi phí nguyên liệu, vật tư, năng lượng <span className="text-red-500">*</span></label>
                                <input type="number" value={form.budget_category_2} onChange={e => set('budget_category_2', e.target.value)}
                                  className={`form-input ${errors.budget_category_2 ? 'border-red-400' : ''}`}
                                  placeholder="50000000" min="0" step="1000000" />
                                {errors.budget_category_2 && <p className="form-error">{errors.budget_category_2}</p>}
                              </div>
                              <div>
                                <label className="form-label">Chi phí máy móc, thiết bị, công nghệ <span className="text-red-500">*</span></label>
                                <input type="number" value={form.budget_category_3} onChange={e => set('budget_category_3', e.target.value)}
                                  className={`form-input ${errors.budget_category_3 ? 'border-red-400' : ''}`}
                                  placeholder="150000000" min="0" step="1000000" />
                                {errors.budget_category_3 && <p className="form-error">{errors.budget_category_3}</p>}
                              </div>
                              <div>
                                <label className="form-label">Chi phí dịch vụ, tư vấn, chuyển giao</label>
                                <input type="number" value={form.budget_category_4} onChange={e => set('budget_category_4', e.target.value)}
                                  className="form-input" placeholder="50000000" min="0" step="1000000" />
                              </div>
                              <div>
                                <label className="form-label">Chi phí khác (đi công tác, hội nghị...)</label>
                                <input type="number" value={form.budget_category_5} onChange={e => set('budget_category_5', e.target.value)}
                                  className="form-input" placeholder="30000000" min="0" step="1000000" />
                              </div>
                              <div>
                                <label className="form-label">Tổng dự toán (VNĐ)</label>
                                <input type="number" value={form.budget_total} onChange={e => set('budget_total', e.target.value)}
                                  className="form-input" placeholder="480000000" min="0" step="1000000" />
                                {form.budget_category_1 && form.budget_category_2 && form.budget_category_3 && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Tạm tính: {(() => {
                                      const c1 = Number(form.budget_category_1) || 0;
                                      const c2 = Number(form.budget_category_2) || 0;
                                      const c3 = Number(form.budget_category_3) || 0;
                                      const c4 = Number(form.budget_category_4) || 0;
                                      const c5 = Number(form.budget_category_5) || 0;
                                      return formatCurrency(c1 + c2 + c3 + c4 + c5);
                                    })()} VNĐ
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="form-label">Nguồn vốn tự có của tổ chức/cá nhân (VNĐ)</label>
                                <input type="number" value={form.funding_own} onChange={e => set('funding_own', e.target.value)}
                                  className="form-input" placeholder="48000000" min="0" step="1000000" />
                              </div>
                              <div>
                                <label className="form-label">Nguồn khác (ghi rõ nguồn)</label>
                                <input type="text" value={form.funding_other} onChange={e => set('funding_other', e.target.value)}
                                  className="form-input" placeholder="Vốn vay, đối tác..." />
                              </div>
                            </div>
                          </div>

                          {/* E. Mục tiêu, hiệu quả */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">E</span>
                              Mục tiêu, hiệu quả và tác động
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="form-label">Mục tiêu nhiệm vụ <span className="text-red-500">*</span></label>
                                <textarea rows={3} value={form.project_objectives} onChange={e => set('project_objectives', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Mục tiêu tổng quát và các mục tiêu cụ thể cần đạt được..." />
                              </div>
                              <div>
                                <label className="form-label">Nội dung nhiệm vụ <span className="text-red-500">*</span></label>
                                <textarea rows={4} value={form.project_content} onChange={e => set('project_content', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Mô tả chi tiết các nội dung, phạm vi nghiên cứu, phương pháp tiếp cận..." />
                              </div>
                              <div>
                                <label className="form-label">Phương pháp thực hiện</label>
                                <textarea rows={2} value={form.task_methodology} onChange={e => set('task_methodology', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Các phương pháp nghiên cứu cụ thể sẽ áp dụng..." />
                              </div>
                              <div>
                                <label className="form-label">Tác động dự kiến</label>
                                <textarea rows={2} value={form.expected_impact} onChange={e => set('expected_impact', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Tác động kinh tế, xã hội, công nghệ dự kiến..." />
                              </div>
                              <div>
                                <label className="form-label">Kết quả dự kiến</label>
                                <textarea rows={2} value={form.economic_impact} onChange={e => set('economic_impact', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Sản phẩm, chỉ tiêu kinh tế-xã hội dự kiến..." />
                              </div>
                            </div>
                          </div>

                          {/* F. Sở hữu trí tuệ & Thương mại hóa */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">F</span>
                              Sở hữu trí tuệ và thương mại hóa
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="form-label">Phương án sở hữu trí tuệ <span className="text-red-500">*</span></label>
                                <select value={form.ip_ownership} onChange={e => set('ip_ownership', e.target.value)} className="form-input">
                                  <option value="">-- Chọn phương án --</option>
                                  <option value="org_owned">Thuộc sở hữu của tổ chức/cá nhân nhận tài trợ</option>
                                  <option value="shared">Chia sẻ quyền sở hữu với Quỹ NATIF</option>
                                  <option value="natif_owned">Thuộc sở hữu của Quỹ NATIF</option>
                                  <option value="public">Công khai, không độc quyền</option>
                                </select>
                                {errors.ip_ownership && <p className="form-error">{errors.ip_ownership}</p>}
                              </div>
                              <div>
                                <label className="form-label">Phương án chia sẻ quyền SHTT (nếu có)</label>
                                <textarea rows={2} value={form.ip_sharing} onChange={e => set('ip_sharing', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Chi tiết phương án chia sẻ quyền sở hữu trí tuệ với các bên liên quan..." />
                              </div>
                              <div>
                                <label className="form-label">Kế hoạch thương mại hóa (nếu có)</label>
                                <textarea rows={3} value={form.commercialization} onChange={e => set('commercialization', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Kế hoạch đưa sản phẩm nghiên cứu vào ứng dụng thực tế, thị trường tiềm năng..." />
                              </div>
                            </div>
                          </div>

                          {/* G. Năng lực tổ chức/cá nhân */}
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                            <h4 className="font-heading font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">G</span>
                              Năng lực của tổ chức/cá nhân thực hiện
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="form-label">Giới thiệu tổ chức/cá nhân</label>
                                <textarea rows={3} value={form.org_description} onChange={e => set('org_description', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Lịch sử hình thành, lĩnh vực hoạt động, năng lực cốt lõi..." />
                              </div>
                              <div>
                                <label className="form-label">Kinh nghiệm liên quan đến nhiệm vụ</label>
                                <textarea rows={3} value={form.org_experience} onChange={e => set('org_experience', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Các dự án, nhiệm vụ KH&CN đã thực hiện; kết quả đạt được; công bố khoa học..." />
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-sm text-green-800">
                            <strong>Lưu ý:</strong> Theo Nghị định 68/2025/NĐ-CP (Phụ lục I), tài trợ không hoàn lại tối đa <strong>2 tỷ VNĐ</strong>, tối thiểu <strong>50 triệu VNĐ</strong>. Quỹ NATIF hỗ trợ tối đa <strong>80%</strong> tổng kinh phi nhiệm vụ. Nhiệm vụ phải có chủ nhiệm và cam kết thực hiện theo tiến độ.
                          </div>
                        </div>
                      )}

                      {/* Voucher */}
                      {form.program_type === 'voucher' && (
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Tên dự án/dịch vụ <span className="text-red-500">*</span></label>
                            <input type="text" value={form.project_name} onChange={e => set('project_name', e.target.value)}
                              className="form-input" placeholder="Đào tạo chuyển đổi số cho doanh nghiệp" />
                          </div>
                          <div>
                            <label className="form-label">Loại dịch vụ <span className="text-red-500">*</span></label>
                            <select value={form.service_type} onChange={e => set('service_type', e.target.value)} className="form-input">
                              <option value="">-- Chọn loại dịch vụ --</option>
                              <option value="tech_service">Dịch vụ công nghệ</option>
                              <option value="training">Đào tạo, tập huấn</option>
                              <option value="consulting">Tư vấn chuyên gia</option>
                              <option value="ip_service">Dịch vụ sở hữu trí tuệ</option>
                              <option value="other">Khác</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Đơn vị cung cấp dịch vụ <span className="text-red-500">*</span></label>
                            <input type="text" value={form.service_provider} onChange={e => set('service_provider', e.target.value)}
                              className="form-input" placeholder="Công ty TNHH Dịch vụ Công nghệ ABC" />
                          </div>
                          <div>
                            <label className="form-label">Thông tin liên hệ đơn vị cung cấp</label>
                            <input type="text" value={form.provider_contact} onChange={e => set('provider_contact', e.target.value)}
                              className="form-input" placeholder="Địa chỉ, điện thoại, email" />
                          </div>
                          <div>
                            <label className="form-label">Chi phí dịch vụ (VNĐ)</label>
                            <input type="number" value={form.service_cost} onChange={e => set('service_cost', e.target.value)}
                              className="form-input" placeholder="50000000" min="0" step="1000000" />
                          </div>
                          <div>
                            <label className="form-label">Mục tiêu dự án</label>
                            <textarea rows={3} value={form.project_objectives} onChange={e => set('project_objectives', e.target.value)}
                              className="form-input resize-none" placeholder="Mục tiêu của việc sử dụng voucher..." />
                          </div>
                          <div>
                            <label className="form-label">Cam kết sử dụng voucher</label>
                            <textarea rows={3} value={form.commitment_use} onChange={e => set('commitment_use', e.target.value)}
                              className="form-input resize-none" placeholder="Cam kết sử dụng đúng mục đích, hoàn thành báo cáo..." />
                          </div>
                        </div>
                      )}

                      {/* Ecosystem */}
                      {form.program_type === 'ecosystem' && (
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Tên tổ chức/hoạt động <span className="text-red-500">*</span></label>
                            <input type="text" value={form.project_name} onChange={e => set('project_name', e.target.value)}
                              className="form-input" placeholder="Trung tâm ươm tạo khởi nghiệp sáng tạo ABC" />
                          </div>
                          <div>
                            <label className="form-label">Loại công nhận</label>
                            <select value={form.org_recognition_type} onChange={e => set('org_recognition_type', e.target.value)} className="form-input">
                              <option value="">-- Chọn loại --</option>
                              <option value="incubator">Tổ chức ươm tạo</option>
                              <option value="accelerator">Tổ chức gia tốc</option>
                              <option value="coworking">Không gian làm việc chung</option>
                              <option value="investor">Tổ chức đầu tư mạo hiểm</option>
                              <option value="supporter">Tổ chức hỗ trợ khởi nghiệp khác</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Mô tả hoạt động <span className="text-red-500">*</span></label>
                            <textarea rows={4} value={form.activities_description} onChange={e => set('activities_description', e.target.value)}
                              className="form-input resize-none"
                              placeholder="Mô tả các hoạt động hỗ trợ khởi nghiệp sáng tạo..." />
                          </div>
                          <div>
                            <label className="form-label">Kết quả hoạt động</label>
                            <textarea rows={3} value={form.activities_results} onChange={e => set('activities_results', e.target.value)}
                              className="form-input resize-none"
                              placeholder="Số startup hỗ trợ, số việc làm, tác động xã hội..." />
                          </div>
                          <div>
                            <label className="form-label">Mục tiêu dự án</label>
                            <textarea rows={3} value={form.project_objectives} onChange={e => set('project_objectives', e.target.value)}
                              className="form-input resize-none" placeholder="Mục tiêu phát triển hệ sinh thái..." />
                          </div>
                          <div>
                            <label className="form-label">Số tiền yêu cầu (VNĐ)</label>
                            <input type="number" value={form.total_investment} onChange={e => set('total_investment', e.target.value)}
                              className="form-input" placeholder="1000000000" min="0" step="1000000" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="btn-secondary">← Quay lại</button>
                    <button type="button" onClick={handleNext} className="btn-primary">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Project info (all programs) */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">
                          {isInterestSubsidy ? 'Phần C: Thông tin dự án ĐMCT' : 'Thông tin dự án / nhiệm vụ'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {isInterestSubsidy ? 'Phần C: Nội dung và hiệu quả dự án đổi mới công nghệ' : selectedProgram?.legal}
                        </p>
                      </div>
                      <button type="button" onClick={handleBack} className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-6">
                      {/* Dự án */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          {isInterestSubsidy ? 'C.1. Thông tin dự án đổi mới công nghệ' : 'Thông tin dự án / nhiệm vụ'}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Tên dự án đổi mới công nghệ <span className="text-red-500">*</span></label>
                            <input type="text" value={form.project_name} onChange={e => set('project_name', e.target.value)}
                              className={`form-input ${errors.project_name ? 'border-red-400' : ''}`}
                              placeholder="Dự án đổi mới công nghệ dây chuyền sản xuất thông minh" />
                            {errors.project_name && <p className="form-error">{errors.project_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Địa điểm thực hiện dự án</label>
                            <input type="text" value={form.project_address} onChange={e => set('project_address', e.target.value)}
                              className="form-input" placeholder="Khu công nghiệp ABC, TP. Hồ Chí Minh" />
                          </div>
                          <div>
                            <label className="form-label">Mục tiêu dự án <span className="text-red-500">*</span></label>
                            <textarea rows={3} value={form.project_objectives} onChange={e => set('project_objectives', e.target.value)}
                              className={`form-input resize-none ${errors.project_objectives ? 'border-red-400' : ''}`}
                              placeholder="- Mục tiêu tổng quát: ...&#10;- Mục tiêu cụ thể: ..." />
                            {errors.project_objectives && <p className="form-error">{errors.project_objectives}</p>}
                          </div>
                          <div>
                            <label className="form-label">Nội dung chính của dự án <span className="text-red-500">*</span></label>
                            <textarea rows={4} value={form.project_content} onChange={e => set('project_content', e.target.value)}
                              className={`form-input resize-none ${errors.project_content ? 'border-red-400' : ''}`}
                              placeholder="Mô tả chi tiết các nội dung chính, phạm vi thực hiện..." />
                            {errors.project_content && <p className="form-error">{errors.project_content}</p>}
                          </div>
                          {isInterestSubsidy && (
                            <>
                              <div>
                                <label className="form-label">Công nghệ sử dụng / mục tiêu chuyển giao</label>
                                <textarea rows={3} value={form.technology_description} onChange={e => set('technology_description', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Mô tả công nghệ mới, thiết bị, quy trình sản xuất..." />
                              </div>
                              <div>
                                <label className="form-label">Lý do lựa chọn công nghệ</label>
                                <textarea rows={2} value={form.technology_reason} onChange={e => set('technology_reason', e.target.value)}
                                  className="form-input resize-none"
                                  placeholder="Phân tích các yếu tố: phù hợp, hiệu quả, khả thi..." />
                              </div>
                            </>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="form-label">Thời gian thực hiện</label>
                              <input type="text" value={form.project_duration} onChange={e => set('project_duration', e.target.value)}
                                className="form-input" placeholder="18 tháng (01/2026 - 06/2027)" />
                            </div>
                            <div>
                              <label className="form-label">Tổng mức đầu tư / dự toán (VNĐ) <span className="text-red-500">*</span></label>
                              <input type="number" value={form.total_investment} onChange={e => set('total_investment', e.target.value)}
                                className={`form-input ${errors.total_investment ? 'border-red-400' : ''}`}
                                placeholder="5000000000" min="0" step="1000000" />
                              {errors.total_investment && <p className="form-error">{errors.total_investment}</p>}
                            </div>
                          </div>
                          {isInterestSubsidy && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="form-label">Vốn tự có (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" value={form.equity_contribution} onChange={e => set('equity_contribution', e.target.value)}
                                  className={`form-input ${errors.equity_contribution ? 'border-red-400' : ''}`}
                                  placeholder="2500000000" min="0" step="1000000" />
                                {errors.equity_contribution && <p className="form-error">{errors.equity_contribution}</p>}
                              </div>
                              <div>
                                <label className="form-label">Vốn vay cần hỗ trợ lãi suất (VNĐ)</label>
                                <input type="number" value={form.loan_portion} onChange={e => set('loan_portion', e.target.value)}
                                  className="form-input"
                                  placeholder="2500000000" min="0" step="1000000" />
                              </div>
                              <div>
                                <label className="form-label">Nguồn khác (VNĐ)</label>
                                <input type="number" value={form.other_funding} onChange={e => set('other_funding', e.target.value)}
                                  className="form-input" placeholder="0" min="0" step="1000000" />
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="form-label">Dự toán chi phí chi tiết <span className="text-red-500">*</span></label>
                            <textarea rows={4} value={form.budget_breakdown} onChange={e => set('budget_breakdown', e.target.value)}
                              className={`form-input resize-none ${errors.budget_breakdown ? 'border-red-400' : ''}`}
                              placeholder="- Chi phí máy móc, thiết bị: ... VNĐ&#10;- Chi phí nhân công: ... VNĐ&#10;- Chi phí vật liệu, nguyên liệu: ... VNĐ&#10;- Chi phí quản lý và khác: ... VNĐ&#10;- Tổng cộng: ... VNĐ" />
                            {errors.budget_breakdown && <p className="form-error">{errors.budget_breakdown}</p>}
                          </div>
                          <div>
                            <label className="form-label">Tiến độ thực hiện (các mốc chính) <span className="text-red-500">*</span></label>
                            <textarea rows={3} value={form.implementation_milestones} onChange={e => set('implementation_milestones', e.target.value)}
                              className={`form-input resize-none ${errors.implementation_milestones ? 'border-red-400' : ''}`}
                              placeholder="Q1/2026: Hoàn tất thiết kế, đặt hàng thiết bị&#10;Q2/2026: Lắp đặt, vận hành thử nghiệm&#10;Q3/2026: Chạy thử, đào tạo nhân sự&#10;Q4/2026: Nghiệm thu, bàn giao" />
                            {errors.implementation_milestones && <p className="form-error">{errors.implementation_milestones}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Hiệu quả */}
                      {isInterestSubsidy && (
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                            C.2. Hiệu quả dự kiến
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">Dự kiến doanh thu (VNĐ)</label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <span className="text-xs text-gray-500">Năm 1</span>
                                  <input type="number" value={form.expected_revenue_y1} onChange={e => set('expected_revenue_y1', e.target.value)}
                                    className={`form-input ${errors.expected_revenue_y1 ? 'border-red-400' : ''}`}
                                    placeholder="5.000.000.000" min="0" step="1000000" />
                                  {errors.expected_revenue_y1 && <p className="form-error">{errors.expected_revenue_y1}</p>}
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Năm 2</span>
                                  <input type="number" value={form.expected_revenue_y2} onChange={e => set('expected_revenue_y2', e.target.value)}
                                    className="form-input" placeholder="7.000.000.000" min="0" step="1000000" />
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Năm 3</span>
                                  <input type="number" value={form.expected_revenue_y3} onChange={e => set('expected_revenue_y3', e.target.value)}
                                    className="form-input" placeholder="9.000.000.000" min="0" step="1000000" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="form-label">Dự kiến lợi nhuận sau thuế (VNĐ)</label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <span className="text-xs text-gray-500">Năm 1</span>
                                  <input type="number" value={form.expected_profit_y1} onChange={e => set('expected_profit_y1', e.target.value)}
                                    className="form-input" placeholder="500.000.000" min="0" step="1000000" />
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Năm 2</span>
                                  <input type="number" value={form.expected_profit_y2} onChange={e => set('expected_profit_y2', e.target.value)}
                                    className="form-input" placeholder="800.000.000" min="0" step="1000000" />
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Năm 3</span>
                                  <input type="number" value={form.expected_profit_y3} onChange={e => set('expected_profit_y3', e.target.value)}
                                    className="form-input" placeholder="1.200.000.000" min="0" step="1000000" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="form-label">Thời gian hoàn vốn dự kiến <span className="text-red-500">*</span></label>
                                <input type="text" value={form.payback_period} onChange={e => set('payback_period', e.target.value)}
                                  className={`form-input ${errors.payback_period ? 'border-red-400' : ''}`}
                                  placeholder="36 tháng (3 năm)" />
                                {errors.payback_period && <p className="form-error">{errors.payback_period}</p>}
                              </div>
                              <div>
                                <label className="form-label">Năng lực kỹ thuật của doanh nghiệp</label>
                                <input type="text" value={form.technical_capacity} onChange={e => set('technical_capacity', e.target.value)}
                                  className="form-input"
                                  placeholder="15 kỹ sư, 3 chuyên gia, 5 năm kinh nghiệm..." />
                              </div>
                            </div>
                            <div>
                              <label className="form-label">Hiệu quả kinh tế dự kiến</label>
                              <textarea rows={2} value={form.economic_impact} onChange={e => set('economic_impact', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Tăng năng suất 30%, giảm chi phí sản xuất 15%, mở rộng thị trường..." />
                            </div>
                            <div>
                              <label className="form-label">Hiệu quả xã hội dự kiến</label>
                              <textarea rows={2} value={form.social_impact} onChange={e => set('social_impact', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Tạo thêm 20 việc làm, đào tạo nhân lực công nghệ cao, giảm ô nhiễm môi trường..." />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cam kết */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Cam kết của doanh nghiệp
                        </h3>
                        <div>
                          <label className="form-label">Nội dung cam kết <span className="text-red-500">*</span></label>
                          <textarea rows={4} value={form.commitment_content} onChange={e => set('commitment_content', e.target.value)}
                            className={`form-input resize-none ${errors.commitment_content ? 'border-red-400' : ''}`}
                            placeholder={`Doanh nghiệp cam kết:&#10;1. Sử dụng vốn vay đúng mục đích đổi mới công nghệ&#10;2. Hoàn trả nợ gốc và lãi đúng hạn theo quy định&#10;3. Thực hiện báo cáo tiến độ theo yêu cầu của Quỹ NATIF&#10;4. Chịu trách nhiệm trước pháp luật về tính chính xác của hồ sơ`} />
                          {errors.commitment_content && <p className="form-error">{errors.commitment_content}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-sm text-red-700">{errorMsg}</div>
                  )}

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="btn-secondary">← Quay lại</button>
                    <button type="button" onClick={handleNext} className="btn-primary">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Documents (interest_subsidy only) */}
              {step === 5 && isInterestSubsidy && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">
                          Phần E: Tài liệu đính kèm
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          Đánh dấu các tài liệu đã chuẩn bị. Bản sao phải có công chứng theo quy định.
                        </p>
                      </div>
                      <button type="button" onClick={handleBack} className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Đánh dấu <strong className="text-red-500">*</strong> = bắt buộc theo Nghị định 268/2025/NĐ-CP (Phụ lục II).
                        Các tài liệu cần nộp bản có công chứng hoặc chứng thực.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { key: 'doc_dkkd' as keyof FormData, label: 'Đơn đăng ký kinh doanh (bản sao công chứng)', required: true, note: 'ĐKKD còn hiệu lực' },
                          { key: 'doc_id_copy' as keyof FormData, label: 'Bản sao CCCD/CMND người đại diện', required: true, note: 'Công chứng trong vòng 6 tháng' },
                          { key: 'doc_financial_report' as keyof FormData, label: 'Báo cáo tài chính 2 năm gần nhất', required: true, note: 'Có xác nhận của cơ quan thuế' },
                          { key: 'doc_credit_contract' as keyof FormData, label: 'Hợp đồng tín dụng (bản sao công chứng)', required: false, note: 'Bản gốc để đối chiếu khi cần' },
                          { key: 'doc_no_bad_debt' as keyof FormData, label: 'Giấy xác nhận không nợ xấu', required: false, note: 'Xác nhận từ ngân hàng cho vay' },
                          { key: 'doc_business_plan' as keyof FormData, label: 'Phương án sản xuất kinh doanh / ĐMCT', required: false, note: 'Chi tiết theo mẫu Quỹ' },
                          { key: 'doc_collateral' as keyof FormData, label: 'Hồ sơ pháp lý tài sản bảo đảm', required: false, note: 'Sổ đỏ, giấy tờ xe, hợp đồng...' },
                          { key: 'doc_budget_approved' as keyof FormData, label: 'Bảng dự toán chi phí dự án', required: false, note: 'Đã phê duyệt nội bộ' },
                          { key: 'doc_commitment' as keyof FormData, label: 'Cam kết hoàn vốn (theo mẫu Quỹ)', required: true, note: 'Có chữ ký và đóng dấu' },
                          { key: 'doc_board_resolution' as keyof FormData, label: 'Biên bản họp HĐQT/HĐTV', required: false, note: 'Đối với công ty cổ phần' },
                          { key: 'doc_other' as keyof FormData, label: 'Tài liệu khác (nếu có)', required: false, note: 'Theo yêu cầu của Quỹ' },
                        ].map((doc) => (
                          <div key={doc.key}
                            className={`flex items-start gap-3 rounded-lg p-3 border transition-colors
                              ${errors[doc.key] ? 'border-red-300 bg-red-50' : form[doc.key] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            <input type="checkbox" id={doc.key} checked={!!form[doc.key]}
                              onChange={e => set(doc.key, e.target.checked)}
                              className="w-4 h-4 text-natif-blue rounded border-gray-300 mt-0.5 shrink-0" />
                            <label htmlFor={doc.key} className="text-sm cursor-pointer flex-1">
                              <span className={`font-medium ${doc.required ? 'text-gray-900' : 'text-gray-700'}`}>
                                {doc.label}
                                {doc.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                              <span className="text-xs text-gray-400 block mt-0.5">{doc.note}</span>
                            </label>
                          </div>
                        ))}
                      </div>

                      {form.doc_other && (
                        <div>
                          <label className="form-label">Mô tả tài liệu khác</label>
                          <input type="text" value={form.doc_other_note} onChange={e => set('doc_other_note', e.target.value)}
                            className="form-input" placeholder="VD: Giấy phép kinh doanh đặc biệt, chứng nhận chất lượng..." />
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-sm text-amber-800">
                        <strong>Lưu ý quan trọng:</strong> Hồ sơ xin hỗ trợ lãi suất cần gửi kèm bản gốc hoặc bản sao có công chứng các tài liệu trên.
                        Quỹ NATIF có quyền yêu cầu bổ sung tài liệu trong quá trình thẩm định. Thời gian xử lý: <strong>5 ngày làm việc</strong> kể từ khi hồ sơ đầy đủ.
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-sm text-red-700">{errorMsg}</div>
                  )}

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={handleBack} className="btn-secondary">← Quay lại</button>
                    <button type="submit" disabled={status === 'submitting'}
                      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                      {status === 'submitting' ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang gửi...
                        </>
                      ) : 'Gửi hồ sơ'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
