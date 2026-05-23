import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%231f3892' stroke-width='0.5'/%3E%3C/svg%3E")`,
      }} />

      {/* Gradient accent bar */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1f3892 0%, #48C6EF 40%, #6FD33D 70%, #1f3892 100%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 badge badge-blue mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Theo Quyết định của Thủ tướng Chính phủ
            </div>

            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4">
              Quỹ Đổi mới
              <br />
              <span className="text-gradient-blue">công nghệ quốc gia</span>
            </h1>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-3 font-serif-body">
              Thúc đẩy hoạt động đổi mới công nghệ trong doanh nghiệp Việt Nam,
              góp phần xây dựng nền kinh tế tri thức và hội nhập quốc tế.
            </p>

            <div className="text-sm text-gray-500 italic mb-8 border-l-2 border-natif-cyan pl-4">
              "Khoa học công nghệ mà hưng thịnh thì quốc gia mới hưng thịnh."
              <span className="block font-semibold not-italic text-gray-600 mt-1">— Nguyên Bộ trưởng Bộ KH&CN Nguyễn Mạnh Hùng</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/apply" className="btn-primary text-base justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nộp hồ sơ hỗ trợ
              </Link>
              <Link href="/programs" className="btn-secondary text-base justify-center">
                Tìm hiểu chương trình
              </Link>
            </div>
          </div>

          {/* Right - Key figures */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: '500+',
                label: 'Dự án đã tài trợ',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                color: 'blue',
              },
              {
                value: '2.500T',
                label: 'Vốn giải ngân',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                color: 'green',
              },
              {
                value: '320+',
                label: 'Doanh nghiệp thụ hưởng',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                color: 'cyan',
              },
              {
                value: '45',
                label: 'Tỉnh thành',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                ),
                color: 'amber',
              },
            ].map((stat) => (
              <div key={stat.label} className="card text-center group">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center
                  ${stat.color === 'blue' ? 'bg-blue-100 text-natif-blue' : ''}
                  ${stat.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                  ${stat.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' : ''}
                  ${stat.color === 'amber' ? 'bg-amber-100 text-amber-600' : ''}
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon}
                  </svg>
                </div>
                <div className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900 mb-1 group-hover:text-natif-blue transition-colors">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="h-12 w-full" style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      }} />
    </section>
  );
}
