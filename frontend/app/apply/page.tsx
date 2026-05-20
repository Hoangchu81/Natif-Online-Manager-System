'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PROGRAM_TYPES = [
  {
    value: 'interest_subsidy',
    label: 'Hỗ trợ lãi suất vay',
    desc: 'Cho doanh nghiệp thực hiện dự án đổi mới công nghệ',
    color: 'blue',
  },
  {
    value: 'sponsorship',
    label: 'Tài trợ, đặt hàng',
    desc: 'Tài trợ không hoàn lại cho nhiệm vụ KH&CN và ĐMST',
    color: 'green',
  },
  {
    value: 'voucher',
    label: 'Hỗ trợ voucher',
    desc: 'Dịch vụ công nghệ, đào tạo và tư vấn chuyên gia',
    color: 'cyan',
  },
  {
    value: 'ecosystem',
    label: 'Hệ sinh thái khởi nghiệp',
    desc: 'Phát triển hệ sinh thái đổi mới sáng tạo',
    color: 'amber',
  },
];

function formatCurrency(num: number) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + ' triệu';
  return num.toLocaleString('vi-VN');
}

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [form, setForm] = useState({
    company_name: '', tax_code: '', contact_name: '', contact_email: '', contact_phone: '',
    title: '', description: '', budget_requested: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company_name.trim()) e.company_name = 'Tên doanh nghiệp là bắt buộc';
    if (!form.tax_code.trim()) e.tax_code = 'Mã số thuế là bắt buộc';
    if (!form.contact_name.trim()) e.contact_name = 'Người liên hệ là bắt buộc';
    if (!form.contact_email.trim()) e.contact_email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'Email không hợp lệ';
    if (!form.title.trim()) e.title = 'Tên dự án là bắt buộc';
    if (!form.budget_requested) e.budget_requested = 'Số tiền yêu cầu là bắt buộc';
    else if (isNaN(Number(form.budget_requested)) || Number(form.budget_requested) <= 0) e.budget_requested = 'Số tiền không hợp lệ';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
  };

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  if (status === 'success') {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 bg-gray-50">
          <div className="max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading font-bold text-2xl text-gray-900 mb-3">Nộp hồ sơ thành công!</h1>
            <p className="text-gray-500 mb-8">
              Hồ sơ của bạn đã được ghi nhận. Đội ngũ NATIF sẽ xem xét và phản hồi trong vòng 5 ngày làm việc.
            </p>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Chương trình</span>
                <span className="font-medium text-gray-900">{PROGRAM_TYPES.find(p => p.value === selectedProgram)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dự án</span>
                <span className="font-medium text-gray-900">{form.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số tiền đề xuất</span>
                <span className="font-semibold text-natif-blue">{formatCurrency(Number(form.budget_requested))} VNĐ</span>
              </div>
            </div>
            <a href="/" className="btn-secondary">Quay về trang chủ</a>
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
              <p className="text-white/80 text-sm">Hoàn tất hồ sơ theo các bước bên dưới để được xem xét hỗ trợ.</p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-5">
              {[
                { n: 1, label: 'Chọn chương trình' },
                { n: 2, label: 'Thông tin hồ sơ' },
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
                      {PROGRAM_TYPES.map((p) => (
                        <button key={p.value} type="button" onClick={() => setSelectedProgram(p.value)}
                          className={`text-left p-4 rounded-xl border-2 transition-all
                            ${selectedProgram === p.value
                              ? 'border-natif-blue bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center
                            ${p.color === 'blue' ? 'bg-blue-100 text-natif-blue' : ''}
                            ${p.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                            ${p.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' : ''}
                            ${p.color === 'amber' ? 'bg-amber-100 text-amber-600' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d={p.value === 'interest_subsidy' ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' :
                                 p.value === 'sponsorship' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' :
                                 p.value === 'voucher' ? 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' :
                                 'M13 10V3L4 14h7v7l9-11h-7z'} />
                            </svg>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{p.label}</div>
                          <div className="text-xs text-gray-500 leading-relaxed">{p.desc}</div>
                          {selectedProgram === p.value && (
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
                    <button type="submit" disabled={!selectedProgram}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      Tiếp tục
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Form */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="card-flat border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-lg text-gray-900">Thông tin hồ sơ</h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          Điền đầy đủ thông tin dự án xin hỗ trợ
                        </p>
                      </div>
                      <button type="button" onClick={() => setStep(1)}
                        className="text-sm text-natif-blue hover:underline">
                        ← Quay lại
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* Company info */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Thông tin doanh nghiệp
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
                              placeholder="0123456789" />
                            {errors.tax_code && <p className="form-error">{errors.tax_code}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Contact info */}
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

                      {/* Project info */}
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3 pb-2 border-b border-gray-100">
                          Thông tin dự án
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Tên dự án / đề tài <span className="text-red-500">*</span></label>
                            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                              className={`form-input ${errors.title ? 'border-red-400' : ''}`}
                              placeholder="Dự án nghiên cứu và phát triển công nghệ AI" />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                          </div>
                          <div>
                            <label className="form-label">Mô tả dự án</label>
                            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                              className="form-input resize-none"
                              placeholder="Mô tả chi tiết mục tiêu, phạm vi và kết quả dự kiến của dự án..." />
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
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-amber-800">
                        <strong>Lưu ý:</strong> Sau khi gửi, hồ sơ sẽ được xem xét trong vòng 5 ngày làm việc.
                        Đội ngũ NATIF sẽ liên hệ qua email đã cung cấp.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={() => setStep(1)}
                      className="btn-secondary">
                      ← Quay lại
                    </button>
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
