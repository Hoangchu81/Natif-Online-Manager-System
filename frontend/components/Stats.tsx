import { formatCurrency } from '@/lib/dashboard';

const STATS = [
  {
    value: '500+',
    label: 'Dự án đã tài trợ',
    sub: 'Dự án R&D và chuyển giao CN',
    color: 'blue',
  },
  {
    value: '2.500T',
    label: 'Vốn giải ngân',
    sub: 'Tổng vốn đã giải ngân',
    color: 'green',
  },
  {
    value: '320+',
    label: 'Doanh nghiệp',
    sub: 'Doanh nghiệp thụ hưởng',
    color: 'cyan',
  },
  {
    value: '45',
    label: 'Tỉnh thành',
    sub: 'Phạm vi hoạt động toàn quốc',
    color: 'amber',
  },
];

const STAT_ICON_COLORS = {
  blue: 'bg-natif-primary/10 text-natif-primary',
  green: 'bg-green-500/10 text-green-600',
  cyan: 'bg-cyan-500/10 text-cyan-600',
  amber: 'bg-amber-500/10 text-amber-600',
};

export default function Stats() {
  return (
    <section id="about" className="py-20 bg-natif-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="badge badge-blue inline-flex mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Về chúng tôi
          </span>
          <h2 className="section-title">Sứ mệnh & Tầm nhìn</h2>
          <p className="section-subtitle mx-auto">
            NATIF hoạt động theo Quyết định của Thủ tướng Chính phủ, thúc đẩy đổi mới công nghệ
            quốc gia và hỗ trợ doanh nghiệp Việt Nam nâng cao năng lực cạnh tranh.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className={`inline-flex w-11 h-11 rounded-lg items-center justify-center mb-3 ${STAT_ICON_COLORS[stat.color as keyof typeof STAT_ICON_COLORS]}`}>
                {stat.color === 'blue' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {stat.color === 'green' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                )}
                {stat.color === 'cyan' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {stat.color === 'amber' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                )}
              </div>
              <div className="font-heading font-extrabold text-2xl lg:text-3xl text-gray-900 mb-1">{stat.value}</div>
              <div className="font-heading font-semibold text-gray-900 text-sm mb-0.5">{stat.label}</div>
              <div className="text-gray-400 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-flat border-l-4 border-l-natif-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-natif-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-natif-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900">Sứ mệnh</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Thúc đẩy hoạt động đổi mới công nghệ trong doanh nghiệp Việt Nam, tạo động lực
              cho sự phát triển kinh tế - xã hội bền vững và hội nhập quốc tế.
            </p>
          </div>
          <div className="card-flat border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900">Tầm nhìn</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Trở thành tổ chức tài chính hàng đầu trong lĩnh vực hỗ trợ đổi mới công nghệ,
              góp phần xây dựng hệ sinh thái đổi mới sáng tạo quốc gia.
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-10 text-center">
          <div className="card-flat p-8 max-w-3xl mx-auto text-center">
            <svg className="w-8 h-8 text-natif-primary/20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="font-serif-body text-gray-700 text-lg md:text-xl italic leading-relaxed mb-4">
              Khoa học công nghệ mà hưng thịnh thì quốc gia mới hưng thịnh. Khoa học công nghệ mà mạnh thì quốc gia mới mạnh.
            </blockquote>
            <cite className="text-sm font-semibold text-gray-900 not-italic">
              Bộ trưởng Nguyễn Mạnh Hùng
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}
