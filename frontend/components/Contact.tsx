'use client';

import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Họ và tên là bắt buộc';
    if (!form.email.trim()) e.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.message.trim()) e.message = 'Nội dung là bắt buộc';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');
    // Simulate API call
    setTimeout(() => { setStatus('success'); setTimeout(() => setStatus('idle'), 5000); }, 1200);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Left - Info */}
          <div className="lg:col-span-2">
            <div className="badge badge-blue inline-flex mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Liên hệ
            </div>
            <h2 className="section-title">Đăng ký tư vấn miễn phí</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Điền thông tin, đội ngũ chuyên gia của NATIF sẽ liên hệ và tư vấn gói hỗ trợ
              phù hợp nhất cho doanh nghiệp trong vòng 24 giờ làm việc.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
                  label: 'Địa chỉ',
                  value: 'Tầng 5, 113 Trần Duy Hưng, Yên Hòa, Cầu Giấy, Hà Nội',
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                  label: 'Email',
                  value: 'info@natif.vn',
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                  label: 'Hotline',
                  value: '0913.060.581',
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                  label: 'Giờ làm việc',
                  value: 'Thứ 2 - Thứ 6, 8:00 - 17:30',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className="text-gray-700 text-sm font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-heading font-semibold text-gray-900 text-sm mb-3">Liên kết nhanh</h4>
              <div className="space-y-2">
                {[
                  { label: 'Nộp hồ sơ xin hỗ trợ', href: '/apply' },
                  { label: 'Hướng dẫn nộp hồ sơ', href: '/help' },
                  { label: 'Câu hỏi thường gặp', href: '/faq' },
                ].map((link) => (
                  <a key={link.label} href={link.href}
                    className="flex items-center justify-between text-sm text-natif-blue hover:text-natif-blue-light transition-colors py-1">
                    <span>{link.label}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="lg:col-span-3">
            <div className="card-flat border border-gray-200">
              {status === 'success' ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Gửi yêu cầu thành công!</h3>
                  <p className="text-gray-500 text-sm mb-6">Đội ngũ NATIF sẽ liên hệ với bạn trong 24 giờ làm việc.</p>
                  <button onClick={() => setStatus('idle')} className="btn-secondary text-sm">
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`form-input ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                        placeholder="Nguyễn Văn A" />
                      {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="form-label">Email <span className="text-red-500">*</span></label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`form-input ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
                        placeholder="contact@doanhnghiep.vn" />
                      {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Số điện thoại</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="form-input" placeholder="0912 345 678" />
                    </div>
                    <div>
                      <label className="form-label">Tên doanh nghiệp</label>
                      <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="form-input" placeholder="Công ty ABC" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Nội dung tư vấn <span className="text-red-500">*</span></label>
                    <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`form-input resize-none ${errors.message ? 'border-red-400 focus:ring-red-300' : ''}`}
                      placeholder="Mô tả ngắn về dự án hoặc nhu cầu tư vấn của bạn..." />
                    {errors.message && <p className="form-error">{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={status === 'loading'}
                    className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed">
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi yêu cầu tư vấn
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="text-gray-400 text-xs text-center">
                    Thông tin của bạn được bảo mật theo chính sách của NATIF. Không chia sẻ cho bên thứ ba.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
