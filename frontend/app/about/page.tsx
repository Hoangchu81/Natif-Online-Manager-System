import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const stats = [
  { value: '13', label: 'Năm hoạt động', suffix: '+' },
  { value: '2.847', label: 'Dự án tài trợ', suffix: '' },
  { value: '1.500', label: 'Doanh nghiệp hỗ trợ', suffix: '+' },
  { value: '12.500', label: 'Tỷ đồng kinh phí', suffix: ' tỷ' },
];

const missionCards = [
  {
    icon: (
      <svg className="w-8 h-8 text-natif-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'Sứ mệnh',
    text: 'Thúc đẩy hoạt động đổi mới công nghệ và chuyển giao nguồn lực cho doanh nghiệp Việt Nam, góp phần nâng cao năng lực cạnh tranh quốc gia trong kỷ nguyên số.',
    color: 'border-cyan-500',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-natif-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="Claude Opus 4.6 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Tầm nhìn',
    text: 'Trở thành Quỹ tài chính hoạt động hiệu quả cao, đi đầu trong hệ sinh thái đổi mới sáng tạo quốc gia, hỗ trợ doanh nghiệp tiếp cận nguồn lực tài chính và công nghệ tiên tiến.',
    color: 'border-natif-blue',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-natif-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Giá trị cốt lõi',
    text: 'Minh bạch — Hiệu quả — Đổi mới — Hợp tác. Mọi hoạt động của Quỹ đều hướng đến sự phát triển bền vững của hệ sinh thái khởi nghiệp và đổi mới công nghệ Việt Nam.',
    color: 'border-green-500',
  },
];

const timeline = [
  {
    year: '2013',
    title: 'Thành lập Quỹ NATIF',
    desc: 'Được thành lập theo Nghị định của Chính phủ, trực thuộc Bộ Khoa học và Công nghệ. Giai đoạn đầu tập trung vào hỗ trợ nghiên cứu ứng dụng và chuyển giao công nghệ.',
    color: 'bg-natif-blue',
  },
  {
    year: '2017',
    title: 'Mở rộng chương trình tài trợ',
    desc: 'Bổ sung các chương trình hỗ trợ lãi suất vay, tài trợ đặt hàng và hỗ trợ hệ sinh thái. Quỹ bắt đầu hợp tác với các ngân hàng thương mại và tổ chức tài chính.',
    color: 'bg-natif-cyan',
  },
  {
    year: '2019',
    title: 'Khởi động đề án tự chủ',
    desc: 'Quỹ chính thức triển khai đề án tự chủ về tài chính, nhân lực và hoạt động. Mục tiêu xây dựng mô hình quỹ tự chủ, hoạt động hiệu quả và bền vững.',
    color: 'bg-cyan-500',
  },
  {
    year: '2025',
    title: 'Luật Khoa học và Công nghệ sửa đổi',
    desc: 'Luật sửa đổi, bổ sung một số điều của Luật Khoa học và Công nghệ có hiệu lực, tạo hành lang pháp lý mới cho hoạt động của các quỹ tài chính công.',
    color: 'bg-teal-500',
  },
  {
    year: '2026',
    title: 'Nghị định 77/2026/NĐ-CP — Mô hình tự chủ',
    desc: 'Chính phủ ban hành Nghị định quy định về tổ chức và hoạt động của Quỹ. Quỹ NATIF chuyển đổi sang mô hình tự chủ toàn diện, khẳng định vị thế tiên phong trong hệ thống quỹ đổi mới quốc gia.',
    color: 'bg-natif-green',
  },
];

const programs = [
  {
    title: 'Hỗ trợ lãi suất vay',
    shortTitle: 'Lãi suất ưu đãi',
    desc: 'Hỗ trợ до 100% lãi suất vay cho doanh nghiệp đầu tư máy móc, thiết bị và công nghệ mới. Tối đa 8 tỷ đồng/dự án.',
    icon: (
      <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'blue',
    href: '/programs/interest_subsidy',
    stats: '8 tỷ/dự án',
  },
  {
    title: 'Tài trợ đặt hàng',
    shortTitle: 'Nghiên cứu & Phát triển',
    desc: 'Tài trợ không hoàn lại cho các nhiệm vụ khoa học và công nghệ. Áp dụng Nghị định 68/2025/NĐ-CP. Tối đa 2 tỷ đồng.',
    icon: (
      <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0l-.341.341a2.25 2.25 0 01-.659.591V17.5" />
      </svg>
    ),
    color: 'green',
    href: '/programs/sponsorship',
    stats: '2 tỷ/nhiệm vụ',
  },
  {
    title: 'Hỗ trợ hệ sinh thái',
    shortTitle: 'Khởi nghiệp ĐMST',
    desc: 'Hỗ trợ toàn diện cho các trung tâm ươm tạo, vườn ươm công nghệ, startup và tổ chức trung gian hỗ trợ đổi mới sáng tạo trên toàn quốc.',
    icon: (
      <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    color: 'amber',
    href: '/programs/ecosystem',
    stats: '50+ tổ chức',
  },
  {
    title: 'Phiếu mua hàng công nghệ',
    shortTitle: 'Voucher công nghệ',
    desc: 'Hỗ trợ doanh nghiệp nhỏ và vừa tiếp cận dịch vụ công nghệ với phiếu mua hàng giảm giá. Tối đa 500 triệu đồng/doanh nghiệp.',
    icon: (
      <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="Claude Opus 4.6 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    color: 'cyan',
    href: '/programs/voucher',
    stats: '500 triệu/DN',
  },
];

const leadership = [
  {
    name: 'GS.TS. Nguyễn Văn Minh',
    role: 'Giám đốc Quỹ',
    area: 'Điều hành tổng thể, Chiến lược phát triển',
    initials: 'NVM',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    name: 'TS. Trần Thị Lan Hương',
    role: 'Phó Giám đốc',
    area: 'Khoa học, Công nghệ & Đào tạo',
    initials: 'TTLH',
    gradient: 'from-teal-500 to-green-400',
  },
  {
    name: 'PGS.TS. Lê Hoàng Nam',
    role: 'Phó Giám đốc',
    area: 'Tài chính, Tự chủ & Hợp tác quốc tế',
    initials: 'LHN',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const partners = [
  'Bộ Khoa học và Công nghệ',
  'Bộ Tài chính',
  'Đại học Quốc gia Hà Nội',
  'Đại học Quốc gia TP.HCM',
  'Viện Hàn lâm KH&CN Việt Nam',
  'Hội Tin học Việt Nam',
  'Cục Sở hữu trí tuệ',
  'VCCI',
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gov-gradient">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-natif-cyan animate-pulse" />
              Quỹ Đổi mới Công nghệ Quốc gia — NATIF
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
              Hành trình<br />
              <span className="text-natif-cyan">Tự chủ</span> & Phát triển
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/80 mb-10 leading-relaxed">
              Quỹ Đổi mới Công nghệ Quốc gia (NATIF) — Đơn vị tiên phong trong hệ thống quỹ tài chính công,
              khẳng định vị thế qua mô hình tự chủ toàn diện theo Nghị định 77/2026/NĐ-CP.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/programs" className="btn-accent text-sm px-6 py-2.5">
                Xem chương trình tài trợ
              </Link>
              <Link href="/apply" className="px-6 py-2.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors text-sm font-medium">
                Nộp hồ sơ ngay
              </Link>
            </div>
          </div>
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 sm:h-16">
              <path d="M0 60V30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="font-heading text-3xl sm:text-4xl font-black text-natif-blue mb-1">
                    {stat.value}<span className="text-natif-cyan text-xl">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-natif-blue/10 text-natif-blue text-xs">GIỚI THIỆU</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                Chúng tôi là ai?
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500 leading-relaxed">
                Quỹ Đổi mới Công nghệ Quốc gia (NATIF) là tổ chức tài chính công trực thuộc Bộ Khoa học
                và Công nghệ, có chức năng hỗ trợ tài chính cho hoạt động đổi mới công nghệ và chuyển giao nguồn lực.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {missionCards.map((card, i) => (
                <div key={i} className={`card border-t-4 ${card.color} animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-slate-50 flex-shrink-0">{card.icon}</div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{card.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <svg className="w-10 h-10 text-natif-cyan/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="font-serif-body text-xl sm:text-2xl text-gray-700 italic leading-relaxed mb-4">
              &ldquo;Đổi mới công nghệ là động lực quan trọng nhất cho sự phát triển bền vững của doanh nghiệp
              Việt Nam trong kỷ nguyên số hóa.&rdquo;
            </blockquote>
            <cite className="text-sm text-gray-500 not-italic">— GS.TS. Nguyễn Văn Minh, Giám đốc Quỹ NATIF</cite>
          </div>
        </section>

        {/* Timeline — Hành trình Tự chủ */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-natif-green/10 text-natif-green text-xs">HÀNH TRÌNH</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                Hành trình Tự chủ của NATIF
              </h2>
              <p className="text-gray-500">
                Từ giai đoạn thành lập đến mô hình tự chủ toàn diện — hành trình 13 năm kiến tạo hệ sinh thái đổi mới quốc gia.
              </p>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[21px] sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-natif-blue via-natif-cyan to-natif-green" />
              <div className="space-y-10">
                {timeline.map((item, i) => (
                  <div key={i} className={`relative flex gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    {/* Dot */}
                    <div className="absolute left-[13px] sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: item.color }} />
                    {/* Content */}
                    <div className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] animate-fade-in-up ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`} style={{ animationDelay: `${i * 80}ms` }}>
                      <span className="inline-block font-heading font-black text-2xl" style={{ color: item.color }}>{item.year}</span>
                      <h3 className="font-heading font-bold text-lg text-gray-900 mt-1 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Programs Highlight */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-natif-cyan/10 text-natif-cyan text-xs">CHƯƠNG TRÌNH</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                4 Chương trình hỗ trợ toàn diện
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                NATIF cung cấp hệ thống hỗ trợ tài chính đa dạng, đáp ứng mọi nhu cầu từ vay vốn ưu đãi đến tài trợ nghiên cứu và phát triển công nghệ.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((p, i) => (
                <Link
                  key={i}
                  href={p.href}
                  className="card group hover:shadow-lg transition-all duration-300 animate-fade-in-up border-t-4"
                  style={{ animationDelay: `${i * 80}ms`, borderTopColor: p.color === 'blue' ? '#3b82f6' : p.color === 'green' ? '#22c55e' : p.color === 'amber' ? '#f59e0b' : '#06b6d4' }}
                >
                  <div className="mb-4">{p.icon}</div>
                  <h3 className="font-heading font-bold text-base text-gray-900 mb-1 group-hover:text-natif-blue transition-colors">{p.title}</h3>
                  <p className="text-xs font-medium text-gray-400 mb-3">{p.shortTitle}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-natif-blue bg-natif-blue/5 px-2.5 py-1 rounded-full">{p.stats}</span>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-natif-blue transition-colors flex items-center gap-1">
                      Chi tiết
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Đề án Tự chủ — Key Feature */}
        <section className="py-20 bg-gov-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-natif-cyan text-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-natif-cyan animate-pulse" />
                Nghị định 77/2026/NĐ-CP
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-white mb-4">
                Mô hình Tự chủ Toàn diện
              </h2>
              <p className="max-w-2xl mx-auto text-white/70 leading-relaxed">
                Từ năm 2026, NATIF vận hành theo mô hình tự chủ — kết hợp nguồn ngân sách nhà nước cấp
                với thu nhập từ hoạt động sự nghiệp, đảm bảo hiệu quả và bền vững lâu dài.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: '💰',
                  title: 'Tự chủ tài chính',
                  desc: 'Nguồn thu từ hoạt động sự nghiệp, đầu tư và hợp tác quốc tế bổ sung ngân sách nhà nước.',
                  color: 'from-blue-500/20 to-cyan-500/20',
                },
                {
                  icon: '👥',
                  title: 'Tự chủ nhân lực',
                  desc: 'Tự chủ trong tuyển dụng, đào tạo và phát triển đội ngũ chuyên gia và cán bộ quản lý.',
                  color: 'from-green-500/20 to-teal-500/20',
                },
                {
                  icon: '⚙️',
                  title: 'Tự chủ hoạt động',
                  desc: 'Linh hoạt trong thiết kế chương trình, quy trình đánh giá và tiêu chí tài trợ phù hợp thực tiễn.',
                  color: 'from-purple-500/20 to-pink-500/20',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-heading font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-natif-blue/10 text-natif-blue text-xs">LÃNH ĐẠO</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                Ban Lãnh đạo Quỹ
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {leadership.map((person, i) => (
                <div key={i} className="card text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${person.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-white font-heading font-black text-lg">{person.initials}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-gray-900">{person.name}</h3>
                  <p className="text-sm font-medium text-natif-blue mt-1">{person.role}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{person.area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organizational Structure */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="badge bg-purple-100 text-purple-700 text-xs">CƠ CẤU</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mt-3">
                Sơ đồ tổ chức
              </h2>
            </div>
            <div className="flex flex-col items-center gap-3">
              {/* Director */}
              <div className="px-8 py-4 bg-natif-blue text-white rounded-xl font-heading font-bold text-center shadow-md min-w-[240px]">
                <div className="text-xs font-normal opacity-70 mb-0.5">Quản lý cao nhất</div>
                Giám đốc Quỹ
              </div>
              {/* Connector */}
              <div className="w-px h-6 bg-slate-300" />
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 -translate-x-1/2" />
                <div className="px-6 py-3 bg-white border-2 border-natif-cyan rounded-xl text-center shadow-sm">
                  <div className="text-xs text-gray-400 mb-0.5">Phụ trách</div>
                  <span className="font-heading font-semibold text-sm text-gray-800">Khoa học & Đào tạo</span>
                </div>
                <div className="px-6 py-3 bg-white border-2 border-natif-cyan rounded-xl text-center shadow-sm">
                  <div className="text-xs text-gray-400 mb-0.5">Phụ trách</div>
                  <span className="font-heading font-semibold text-sm text-gray-800">Tài chính & Hợp tác</span>
                </div>
              </div>
              {/* Connector */}
              <div className="w-px h-6 bg-slate-300" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Phòng Hành chính', 'Phòng Tài vụ', 'Phòng KH&CN', 'Phòng HTDN'].map((dept, i) => (
                  <div key={i} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                    <span className="font-heading text-xs font-semibold text-gray-700">{dept}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="badge bg-slate-100 text-slate-600 text-xs">ĐỐI TÁC</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mt-3">
                Đơn vị liên kết
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {partners.map((p, i) => (
                <div key={i} className="px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 text-center hover:border-natif-cyan/40 hover:bg-natif-cyan/5 transition-all cursor-default group">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-natif-blue transition-colors">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact & CTA */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="badge bg-natif-blue/10 text-natif-blue text-xs">LIÊN HỆ</span>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-6">
                  Sẵn sàng hỗ trợ bạn
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: '📍', label: 'Địa chỉ', value: 'Tầng 15, Tòa nhà Center Building, 1 Nguyễn Trung Trực, Quận 1, TP. Hồ Chí Minh' },
                    { icon: '📞', label: 'Điện thoại', value: '(028) 3829 1234' },
                    { icon: '📧', label: 'Email', value: 'contact@natif.vn' },
                    { icon: '🌐', label: 'Website', value: 'natif.gov.vn' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                        <div className="text-sm text-gray-700">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-flat bg-natif-blue p-8 text-center">
                <h3 className="font-heading text-xl font-bold text-white mb-3">
                  Bắt đầu nộp hồ sơ ngay
                </h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  Đăng ký tài khoản và nộp hồ sơ trực tuyến qua hệ thống quản lý của NATIF.
                  Đội ngũ chuyên viên hỗ trợ xuyên suốt quá trình.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/register" className="btn-accent bg-white !text-natif-blue hover:!bg-natif-cyan hover:!text-white">
                    Đăng ký tài khoản
                  </Link>
                  <Link href="/programs" className="px-6 py-2.5 rounded-lg border-2 border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                    Tìm hiểu chương trình
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
