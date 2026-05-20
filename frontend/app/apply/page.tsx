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
  },
];

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1
  program_type: string;
  // Step 2 - Company info
  company_name: string;
  tax_code: string;
  company_address: string;
  representative_name: string;
  representative_position: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  // Step 3 - Program-specific
  project_name: string;
  project_address: string;
  project_objectives: string;
  project_content: string;
  project_duration: string;
  budget_requested: string;
  budget_breakdown: string;
  expected_results: string;
  // Interest subsidy specific
  bank_name: string;
  bank_branch: string;
  loan_amount: string;
  loan_account: string;
  interest_rate: string;
  loan_contract_no: string;
  contract_date: string;
  commitment_content: string;
  // Sponsorship specific
  task_location: string;
  task_methodology: string;
  org_description: string;
  org_experience: string;
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
}

const initialForm: FormData = {
  program_type: '',
  company_name: '', tax_code: '', company_address: '', representative_name: '', representative_position: '',
  contact_name: '', contact_email: '', contact_phone: '',
  project_name: '', project_address: '', project_objectives: '', project_content: '', project_duration: '',
  budget_requested: '', budget_breakdown: '', expected_results: '',
  bank_name: '', bank_branch: '', loan_amount: '', loan_account: '', interest_rate: '',
  loan_contract_no: '', contract_date: '', commitment_content: '',
  task_location: '', task_methodology: '', org_description: '', org_experience: '',
  service_type: '', service_provider: '', provider_contact: '', service_cost: '', commitment_use: '',
  activities_description: '', activities_results: '', org_recognition_type: '',
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

  const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.company_name.trim()) e.company_name = 'Tên doanh nghiệp là bắt buộc';
    if (!form.tax_code.trim()) e.tax_code = 'Mã số thuế là bắt buộc';
    if (!form.representative_name.trim()) e.representative_name = 'Người đại diện là bắt buộc';
    if (!form.contact_name.trim()) e.contact_name = 'Người liên hệ là bắt buộc';
    if (!form.contact_email.trim()) e.contact_email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'Email không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.project_name.trim()) e.project_name = 'Tên dự án/nhiệm vụ là bắt buộc';
    if (!form.budget_requested.trim()) e.budget_requested = 'Số tiền yêu cầu là bắt buộc';
    else if (isNaN(Number(form.budget_requested)) || Number(form.budget_requested) <= 0) e.budget_requested = 'Số tiền không hợp lệ';
    if (!form.project_objectives.trim()) e.project_objectives = 'Mục tiêu dự án là bắt buộc';
    if (!form.project_content.trim()) e.project_content = 'Nội dung dự án là bắt buộc';
    if (!form.expected_results.trim()) e.expected_results = 'Kết quả dự kiến là bắt buộc';

    if (form.program_type === 'interest_subsidy') {
      if (!form.loan_amount.trim()) e.loan_amount = 'Số tiền vay là bắt buộc';
      if (!form.bank_name.trim()) e.bank_name = 'Tên ngân hàng là bắt buộc';
    }
    if (form.program_type === 'voucher') {
      if (!form.service_type.trim()) e.service_type = 'Loại dịch vụ là bắt buộc';
      if (!form.service_provider.trim()) e.service_provider = 'Đơn vị cung cấp là bắt buộc';
    }
    if (form.program_type === 'ecosystem') {
      if (!form.activities_description.trim()) e.activities_description = 'Mô tả hoạt động là bắt buộc';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && form.program_type) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

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
        company_address: form.company_address,
        representative_name: form.representative_name,
        representative_position: form.representative_position,
        project_address: form.project_address,
        project_objectives: form.project_objectives,
        project_content: form.project_content,
        project_duration: form.project_duration,
        budget_breakdown: form.budget_breakdown,
        expected_results: form.expected_results,
        bank_name: form.bank_name,
        bank_branch: form.bank_branch,
        loan_amount: form.loan_amount,
        loan_account: form.loan_account,
        interest_rate: form.interest_rate,
        loan_contract_no: form.loan_contract_no,
        contract_date: form.contract_date,
        commitment_content: form.commitment_content,
        task_location: form.task_location,
        task_methodology: form.task_methodology,
        org_description: form.org_description,
        org_experience: form.org_experience,
        service_type: form.service_type,
        service_provider: form.service_provider,
        provider_contact: form.provider_contact,
        service_cost: form.service_cost,
        commitment_use: form.commitment_use,
        activities_description: form.activities_description,
        activities_results: form.activities_results,
        org_recognition_type: form.org_recognition_type,
      }),
      budget_requested: Number(form.budget_requested),
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
              Hồ sơ của bạn đã được ghi nhận và đang ở trạng thái <strong>nháp</strong>.
              Đội ngũ NATIF sẽ xem xét sau khi bạn xác nhận gửi. Thông tin phản hồi sẽ được gửi qua email đã cung cấp.
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
                <span className="text-gray-500">Số tiền đề xuất</span>
                <span className="font-semibold text-natif-blue">
                  {formatCurrency(Number(form.budget_requested))} VNĐ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Căn cứ pháp lý</span>
                <span className="font-medium text-gray-900 text-right">{selectedProgram?.legal}</span>
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
                Hoàn tất hồ sơ theo các bước bên dưới để được xem xét hỗ trợ theo quy định pháp luật hiện hành.
              </p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-5">
              {[
                { n: 1 as Step, label: 'Chọn chương trình' },
                { n: 2 as Step, label: 'Thông tin doanh nghiệp' },
                { n: 3 as Step, label: 'Thông tin dự án' },
              ].map((s, i, arr) => (
                <div key={s.n} className="flex items-center">
                  <div className={`flex items-center gap-2.5 ${step >= s.n ? 'text-natif-blue' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                      ${step >= s.n ? 'bg-natif-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step > s.n ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s.n}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-12 sm:w-24 h-0.5 mx-3 ${step > s.n ? 'bg-natif-blue' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                              <div className="text-xs font-medium text-gray-700 mt-1">Tối đa: {p.maxBudget}</div>
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
                          Thông tin pháp lý và người đại diện của tổ chức/doanh nghiệp
                        </p>
                      </div>
                      <button type="button" onClick={handleBack}
                        className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Thông tin pháp lý
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Tên doanh nghiệp <span className="text-red-500">*</span></label>
                            <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)}
                              className={`form-input ${errors.company_name ? 'border-red-400' : ''}`}
                              placeholder="Công ty TNHH ABC" />
                            {errors.company_name && <p className="form-error">{errors.company_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Mã số thuế <span className="text-red-500">*</span></label>
                            <input type="text" value={form.tax_code} onChange={e => set('tax_code', e.target.value)}
                              className={`form-input ${errors.tax_code ? 'border-red-400' : ''}`}
                              placeholder="0123456789" maxLength={14} />
                            {errors.tax_code && <p className="form-error">{errors.tax_code}</p>}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="form-label">Địa chỉ trụ sở</label>
                            <input type="text" value={form.company_address} onChange={e => set('company_address', e.target.value)}
                              className="form-input" placeholder="Số X, đường Y, phường Z, quận Hồ Chí Minh" />
                          </div>
                          <div>
                            <label className="form-label">Người đại diện <span className="text-red-500">*</span></label>
                            <input type="text" value={form.representative_name} onChange={e => set('representative_name', e.target.value)}
                              className={`form-input ${errors.representative_name ? 'border-red-400' : ''}`}
                              placeholder="Nguyễn Văn A" />
                            {errors.representative_name && <p className="form-error">{errors.representative_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Chức vụ người đại diện</label>
                            <input type="text" value={form.representative_position} onChange={e => set('representative_position', e.target.value)}
                              className="form-input" placeholder="Giám đốc" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Người liên hệ
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                            <input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)}
                              className={`form-input ${errors.contact_name ? 'border-red-400' : ''}`}
                              placeholder="Nguyễn Văn A" />
                            {errors.contact_name && <p className="form-error">{errors.contact_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Email <span className="text-red-500">*</span></label>
                            <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                              className={`form-input ${errors.contact_email ? 'border-red-400' : ''}`}
                              placeholder="contact@doanhnghiep.vn" />
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

              {/* Step 3: Project info */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">
                          Thông tin dự án / nhiệm vụ
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {selectedProgram?.legal}
                        </p>
                      </div>
                      <button type="button" onClick={handleBack}
                        className="text-sm text-natif-blue hover:underline">← Quay lại</button>
                    </div>

                    <div className="space-y-5">
                      {/* Common fields */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Thông tin dự án / nhiệm vụ
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Tên dự án / nhiệm vụ <span className="text-red-500">*</span></label>
                            <input type="text" value={form.project_name} onChange={e => set('project_name', e.target.value)}
                              className={`form-input ${errors.project_name ? 'border-red-400' : ''}`}
                              placeholder="Dự án nghiên cứu và phát triển công nghệ AI" />
                            {errors.project_name && <p className="form-error">{errors.project_name}</p>}
                          </div>
                          <div>
                            <label className="form-label">Địa điểm thực hiện</label>
                            <input type="text" value={form.project_address} onChange={e => set('project_address', e.target.value)}
                              className="form-input" placeholder="Thành phố Hồ Chí Minh" />
                          </div>
                          <div>
                            <label className="form-label">Mục tiêu dự án <span className="text-red-500">*</span></label>
                            <textarea rows={3} value={form.project_objectives} onChange={e => set('project_objectives', e.target.value)}
                              className={`form-input resize-none ${errors.project_objectives ? 'border-red-400' : ''}`}
                              placeholder="Mô tả các mục tiêu chính của dự án..." />
                            {errors.project_objectives && <p className="form-error">{errors.project_objectives}</p>}
                          </div>
                          <div>
                            <label className="form-label">Nội dung dự án <span className="text-red-500">*</span></label>
                            <textarea rows={4} value={form.project_content} onChange={e => set('project_content', e.target.value)}
                              className={`form-input resize-none ${errors.project_content ? 'border-red-400' : ''}`}
                              placeholder="Mô tả chi tiết nội dung và phạm vi thực hiện..." />
                            {errors.project_content && <p className="form-error">{errors.project_content}</p>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="form-label">Thời gian thực hiện</label>
                              <input type="text" value={form.project_duration} onChange={e => set('project_duration', e.target.value)}
                                className="form-input" placeholder="12 tháng (01/2026 - 12/2026)" />
                            </div>
                            <div>
                              <label className="form-label">Số tiền yêu cầu (VNĐ) <span className="text-red-500">*</span></label>
                              <input type="number" value={form.budget_requested} onChange={e => set('budget_requested', e.target.value)}
                                className={`form-input ${errors.budget_requested ? 'border-red-400' : ''}`}
                                placeholder="500000000" min="0" step="1000000" />
                              {errors.budget_requested && <p className="form-error">{errors.budget_requested}</p>}
                              {form.budget_requested && !isNaN(Number(form.budget_requested)) && Number(form.budget_requested) > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Tương đương: {formatCurrency(Number(form.budget_requested))} VNĐ
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="form-label">Dự toán kinh phí chi tiết</label>
                            <textarea rows={3} value={form.budget_breakdown} onChange={e => set('budget_breakdown', e.target.value)}
                              className="form-input resize-none"
                              placeholder="- Chi phí nhân công: ...&#10;- Chi phí thiết bị: ...&#10;- Chi phí khác: ..." />
                          </div>
                          <div>
                            <label className="form-label">Kết quả dự kiến <span className="text-red-500">*</span></label>
                            <textarea rows={3} value={form.expected_results} onChange={e => set('expected_results', e.target.value)}
                              className={`form-input resize-none ${errors.expected_results ? 'border-red-400' : ''}`}
                              placeholder="Sản phẩm đầu ra, chỉ tiêu kinh tế-xã hội dự kiến..." />
                            {errors.expected_results && <p className="form-error">{errors.expected_results}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Interest Subsidy specific */}
                      {form.program_type === 'interest_subsidy' && (
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                            Thông tin khoản vay
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="form-label">Tên ngân hàng <span className="text-red-500">*</span></label>
                              <input type="text" value={form.bank_name} onChange={e => set('bank_name', e.target.value)}
                                className={`form-input ${errors.bank_name ? 'border-red-400' : ''}`}
                                placeholder="Ngân hàng TMCP Ngoại Thương Việt Nam" />
                              {errors.bank_name && <p className="form-error">{errors.bank_name}</p>}
                            </div>
                            <div>
                              <label className="form-label">Chi nhánh</label>
                              <input type="text" value={form.bank_branch} onChange={e => set('bank_branch', e.target.value)}
                                className="form-input" placeholder="Chi nhánh TP.HCM" />
                            </div>
                            <div>
                              <label className="form-label">Số hợp đồng tín dụng</label>
                              <input type="text" value={form.loan_contract_no} onChange={e => set('loan_contract_no', e.target.value)}
                                className="form-input" placeholder="001/HDTD/2026" />
                            </div>
                            <div>
                              <label className="form-label">Ngày ký hợp đồng</label>
                              <input type="date" value={form.contract_date} onChange={e => set('contract_date', e.target.value)}
                                className="form-input" />
                            </div>
                            <div>
                              <label className="form-label">Số tiền vay (VNĐ) <span className="text-red-500">*</span></label>
                              <input type="number" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)}
                                className={`form-input ${errors.loan_amount ? 'border-red-400' : ''}`}
                                placeholder="3000000000" min="0" step="1000000" />
                              {errors.loan_amount && <p className="form-error">{errors.loan_amount}</p>}
                            </div>
                            <div>
                              <label className="form-label">Số tài khoản vay</label>
                              <input type="text" value={form.loan_account} onChange={e => set('loan_account', e.target.value)}
                                className="form-input" placeholder="1234567890123" />
                            </div>
                            <div>
                              <label className="form-label">Lãi suất vay (%/năm)</label>
                              <input type="text" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)}
                                className="form-input" placeholder="8.5" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="form-label">Cam kết của doanh nghiệp</label>
                            <textarea rows={3} value={form.commitment_content} onChange={e => set('commitment_content', e.target.value)}
                              className="form-input resize-none"
                              placeholder="Doanh nghiệp cam kết sử dụng vốn vay đúng mục đích, hoàn trả nợ đúng hạn và chịu trách nhiệm trước pháp luật..." />
                          </div>
                        </div>
                      )}

                      {/* Sponsorship specific */}
                      {form.program_type === 'sponsorship' && (
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                            Thông tin nhiệm vụ
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">Địa điểm thực hiện nhiệm vụ</label>
                              <input type="text" value={form.task_location} onChange={e => set('task_location', e.target.value)}
                                className="form-input" placeholder="TP. Hồ Chí Minh" />
                            </div>
                            <div>
                              <label className="form-label">Phương pháp thực hiện</label>
                              <textarea rows={3} value={form.task_methodology} onChange={e => set('task_methodology', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Mô tả phương pháp và cách thức thực hiện nhiệm vụ..." />
                            </div>
                            <div>
                              <label className="form-label">Giới thiệu về tổ chức/cá nhân</label>
                              <textarea rows={3} value={form.org_description} onChange={e => set('org_description', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Lịch sử, năng lực và kinh nghiệm của tổ chức/cá nhân đăng ký..." />
                            </div>
                            <div>
                              <label className="form-label">Kinh nghiệm liên quan</label>
                              <textarea rows={3} value={form.org_experience} onChange={e => set('org_experience', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Các dự án, nhiệm vụ đã thực hiện liên quan..." />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Voucher specific */}
                      {form.program_type === 'voucher' && (
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                            Thông tin dịch vụ
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">Loại dịch vụ cần hỗ trợ <span className="text-red-500">*</span></label>
                              <select value={form.service_type} onChange={e => set('service_type', e.target.value)}
                                className={`form-input ${errors.service_type ? 'border-red-400' : ''}`}>
                                <option value="">-- Chọn loại dịch vụ --</option>
                                <option value="tech_service">Dịch vụ công nghệ</option>
                                <option value="training">Đào tạo, tập huấn</option>
                                <option value="consulting">Tư vấn chuyên gia</option>
                                <option value="ip_service">Dịch vụ sở hữu trí tuệ</option>
                                <option value="other">Khác</option>
                              </select>
                              {errors.service_type && <p className="form-error">{errors.service_type}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="form-label">Đơn vị cung cấp dịch vụ <span className="text-red-500">*</span></label>
                                <input type="text" value={form.service_provider} onChange={e => set('service_provider', e.target.value)}
                                  className={`form-input ${errors.service_provider ? 'border-red-400' : ''}`}
                                  placeholder="Công ty TNHH Dịch vụ ABC" />
                                {errors.service_provider && <p className="form-error">{errors.service_provider}</p>}
                              </div>
                              <div>
                                <label className="form-label">Chi phí dịch vụ (VNĐ)</label>
                                <input type="number" value={form.service_cost} onChange={e => set('service_cost', e.target.value)}
                                  className="form-input" placeholder="50000000" min="0" step="1000000" />
                              </div>
                            </div>
                            <div>
                              <label className="form-label">Thông tin liên hệ đơn vị cung cấp</label>
                              <input type="text" value={form.provider_contact} onChange={e => set('provider_contact', e.target.value)}
                                className="form-input" placeholder="Địa chỉ, điện thoại, email đơn vị cung cấp" />
                            </div>
                            <div>
                              <label className="form-label">Cam kết sử dụng voucher</label>
                              <textarea rows={3} value={form.commitment_use} onChange={e => set('commitment_use', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Cam kết sử dụng voucher đúng mục đích, hoàn thành báo cáo sử dụng..." />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ecosystem specific */}
                      {form.program_type === 'ecosystem' && (
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                            Thông tin tổ chức hỗ trợ khởi nghiệp
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">Loại công nhận</label>
                              <select value={form.org_recognition_type} onChange={e => set('org_recognition_type', e.target.value)}
                                className="form-input">
                                <option value="">-- Chọn loại công nhận --</option>
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
                                className={`form-input resize-none ${errors.activities_description ? 'border-red-400' : ''}`}
                                placeholder="Mô tả các hoạt động hỗ trợ khởi nghiệp sáng tạo đã và đang thực hiện..." />
                              {errors.activities_description && <p className="form-error">{errors.activities_description}</p>}
                            </div>
                            <div>
                              <label className="form-label">Kết quả hoạt động</label>
                              <textarea rows={3} value={form.activities_results} onChange={e => set('activities_results', e.target.value)}
                                className="form-input resize-none"
                                placeholder="Các kết quả đã đạt được: số startup hỗ trợ, số việc làm tạo ra, tác động xã hội..." />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <strong>Căn cứ pháp lý:</strong> Hồ sơ được xem xét theo quy định tại{' '}
                        {selectedProgram?.legal}. Sau khi gửi, hồ sơ sẽ được xem xét trong vòng{' '}
                        <strong>5 ngày làm việc</strong>. Đội ngũ NATIF sẽ liên hệ qua email đã cung cấp.
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-sm text-red-700">
                      {errorMsg}
                    </div>
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
