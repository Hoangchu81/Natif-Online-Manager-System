'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconPhone() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <path d="M8 8h8l4 10-4 4 8 14 6-4 4 8h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="12" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M4 16l20 14 20-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconLocation() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <path d="M24 6C17.373 6 12 11.373 12 18c0 9.25 12 24 12 24s12-14.75 12-24c0-6.627-5.373-12-12-12zm0 17a5 5 0 110-10 5 5 0 010 10z" fill="currentColor" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 14v10l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M4 24h40M24 6c-6 6-9 10-9 18s3 12 9 18c6-6 9-10 9-18s-3-12-9-18z" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TechGrid() {
  return (
    <svg viewBox="0 0 500 300" className="absolute inset-0 w-full h-full opacity-[0.06]" fill="none">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="500" height="300" fill="url(#grid)" />
      <circle cx="250" cy="150" r="80" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="250" cy="150" r="130" stroke="white" strokeWidth="0.5" strokeDasharray="2 6" />
      <line x1="250" y1="20" x2="250" y2="280" stroke="white" strokeWidth="0.5" />
      <line x1="20" y1="150" x2="480" y2="150" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const contactMethods = [
  {
    icon: <IconPhone />,
    label: 'Điện thoại',
    value: '0913.060.581',
    sub: 'Giờ hành chính, T2–T6',
    color: '#1f3892',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
  },
  {
    icon: <IconMail />,
    label: 'Email',
    value: 'info@natif.vn',
    sub: 'Phản hồi trong 24 giờ',
    color: '#00C9FF',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-100',
  },
  {
    icon: <IconLocation />,
    label: 'Địa chỉ',
    value: 'Tầng 15, Center Building',
    sub: '1 Nguyễn Trung Trực, Q.1, TP.HCM',
    color: '#6FD33D',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
  },
  {
    icon: <IconClock />,
    label: 'Giờ làm việc',
    value: 'Thứ 2 – Thứ 6',
    sub: '08:00 – 17:30 (giờ hành chính)',
    color: '#8B5CF6',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
  },
];

const departments = [
  { name: 'Văn phòng', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Kế hoạch – Tài chính', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Hỗ trợ Khởi nghiệp Sáng tạo', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Đổi mới Công nghệ', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Hỗ trợ Lãi suất Vay', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Pháp chế', contact: '0913.060.581', email: 'info@natif.vn' },
  { name: 'Chuyển đổi Số', contact: '0913.060.581', email: 'info@natif.vn' },
];

const faqs = [
  {
    q: 'Thời gian xử lý hồ sơ tài trợ là bao lâu?',
    a: 'Hồ sơ được xem xét trong vòng 15–30 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ. Đội ngũ chuyên viên sẽ liên hệ bổ sung nếu cần.',
  },
  {
    q: 'Doanh nghiệp cần đáp ứng điều kiện gì để được hỗ trợ?',
    a: 'Doanh nghiệp cần có Giấy chứng nhận đăng ký kinh doanh, hoạt động trong lĩnh vực phù hợp chương trình, và đảm bảo nguồn vốn tự có tối thiểu 30%.',
  },
  {
    q: 'Tôi có thể nộp hồ sơ trực tuyến không?',
    a: 'Có. Bạn có thể đăng ký tài khoản và nộp hồ sơ trực tuyến qua hệ thống quản lý của NATIF tại oms.natif.vn/apply.',
  },
  {
    q: 'Hạn mức tài trợ tối đa là bao nhiêu?',
    a: 'Hạn mức tùy thuộc chương trình: Hỗ trợ lãi suất tối đa 8 tỷ đồng, Tài trợ đặt hàng tối đa 2 tỷ đồng, Voucher công nghệ tối đa 500 triệu đồng.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gov-gradient">
          <TechGrid />
          <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-natif-cyan animate-pulse" />
              Liên hệ với chúng tôi
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-black text-white mb-5">
              Sẵn sàng đồng hành<br />
              <span className="text-natif-cyan">cùng bạn</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
              Đội ngũ chuyên viên của NATIF luôn sẵn sàng hỗ trợ bạn. Dù bạn có câu hỏi về chương trình tài trợ,
              quy trình nộp hồ sơ hay cần tư vấn — chúng tôi ở đây để giúp đỡ.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" className="w-full h-14">
              <path d="M0 60V30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* ── CONTACT METHODS ────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map((item, i) => (
                <div key={i}
                  className={`${item.bg} ${item.border} border rounded-2xl p-5 text-center transition-all duration-300 cursor-default animate-fade-in-up ${item.hover}`}
                  style={{ animationDelay: `${i * 80}ms`, borderColor: item.color }}>
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: item.color + '20', color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: item.color }}>{item.label}</div>
                  <div className="font-heading font-bold text-base text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT FORM + INFO ─────────────────────────────────────── */}
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8">

              {/* Left: Form */}
              <div className="lg:col-span-3">
                <div className="card p-8">
                  <h2 className="font-heading text-2xl font-black text-gray-900 mb-1">Gửi tin nhắn</h2>
                  <p className="text-sm text-gray-500 mb-6">Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong 24 giờ làm việc.</p>
                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconUser /></div>
                          <input type="text" placeholder="Nguyễn Văn A" className="form-input pl-10" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Số điện thoại <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconPhone /></div>
                          <input type="tel" placeholder="0912 345 678" className="form-input pl-10" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Email <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconMail /></div>
                        <input type="email" placeholder="contact@doanhnghiep.vn" className="form-input pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Chủ đề</label>
                      <select className="form-input">
                        <option value="">-- Chọn chủ đề --</option>
                        <option>Tư vấn chương trình hỗ trợ lãi suất</option>
                        <option>Tư vấn tài trợ đặt hàng</option>
                        <option>Tư vấn voucher công nghệ</option>
                        <option>Tư vấn hỗ trợ hệ sinh thái</option>
                        <option>Hợp tác & đối tác</option>
                        <option>Phản ánh & kiến nghị</option>
                        <option>Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Nội dung <span className="text-red-500">*</span></label>
                      <textarea rows={5} placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu của bạn..." className="form-input resize-none" />
                    </div>
                    <button type="submit"
                      className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                      <IconSend />
                      Gửi tin nhắn
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Bằng cách gửi, bạn đồng ý với{' '}
                      <a href="/privacy" className="text-natif-blue hover:underline">chính sách bảo mật</a>{' '}
                      của NATIF.
                    </p>
                  </form>
                </div>
              </div>

              {/* Right: Departments + Social */}
              <div className="lg:col-span-2 space-y-6">
                {/* Department contacts */}
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-natif-blue" />
                    Liên hệ theo phòng ban
                  </h3>
                  <div className="space-y-3">
                    {departments.map((dept, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{dept.name}</div>
                          <div className="text-xs text-gray-400">{dept.email}</div>
                        </div>
                        <div className="text-sm font-semibold text-natif-blue">{dept.contact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-natif-cyan" />
                    Kết nối với NATIF
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Website',
                        value: 'natif.gov.vn',
                        href: 'https://natif.gov.vn',
                        icon: <IconGlobe />,
                        color: 'bg-blue-50 text-blue-600',
                      },
                      {
                        name: 'Facebook',
                        value: '@NATIF.Vietnam',
                        href: 'https://facebook.com/natif.gov.vn',
                        icon: (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        ),
                        color: 'bg-blue-50 text-blue-600',
                      },
                      {
                        name: 'LinkedIn',
                        value: 'NATIF Vietnam',
                        href: '#',
                        icon: (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        ),
                        color: 'bg-sky-50 text-sky-700',
                      },
                    ].map((social, i) => (
                      <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-xl ${social.color} hover:opacity-80 transition-opacity group`}>
                        <div className="w-9 h-9 rounded-lg bg-white/50 flex items-center justify-center flex-shrink-0">
                          {social.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{social.name}</div>
                          <div className="text-sm font-medium group-hover:underline">{social.value}</div>
                        </div>
                        <div className="ml-auto">
                          <svg className="w-4 h-4 opacity-50 group-hover:opacity-80" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick response */}
                <div className="bg-natif-blue/5 rounded-2xl border border-natif-blue/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-natif-blue/10 flex items-center justify-center text-natif-blue">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-heading font-bold text-sm text-gray-900">Phản hồi nhanh</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Chúng tôi cam kết phản hồi mọi yêu cầu trong vòng <strong className="text-gray-700">24 giờ</strong> làm việc.
                    Với câu hỏi thường gặp, hãy xem mục FAQ bên dưới.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="badge bg-amber-100 text-amber-700 text-xs">CÂU HỎI THƯỜNG GẶP</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mt-3">
                Câu hỏi thường gặp
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((item, i) => (
                <details key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-natif-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-natif-blue text-xs font-bold">{i + 1}</span>
                      </div>
                      <span className="font-heading font-semibold text-sm text-gray-800 group-hover:text-natif-blue transition-colors">
                        {item.q}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 ml-9">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAP ─────────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-black text-gray-900">Vị trí văn phòng</h2>
              <p className="text-sm text-gray-500 mt-1">Tầng 15, Tòa nhà Center Building, 1 Nguyễn Trung Trực, Quận 1, TP. Hồ Chí Minh</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-5">
                <svg viewBox="0 0 800 300" className="w-full h-full">
                  <defs>
                    <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f3892" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="300" fill="url(#mapGrid)"/>
                  <circle cx="400" cy="150" r="60" stroke="#1f3892" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5"/>
                  <circle cx="400" cy="150" r="30" stroke="#00C9FF" strokeWidth="1.5" opacity="0.5"/>
                  <circle cx="400" cy="150" r="8" fill="#00C9FF" opacity="0.8"/>
                </svg>
              </div>
              <div className="relative text-center">
                <div className="w-14 h-14 rounded-full bg-natif-blue flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                </div>
                <div className="font-heading font-bold text-base text-gray-800">Quỹ NATIF</div>
                <div className="text-sm text-gray-500">Center Building, Q.1, TP.HCM</div>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-natif-blue hover:underline">
                  Mở trên Google Maps
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
