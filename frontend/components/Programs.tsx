import Link from 'next/link';

const programs = [
  {
    slug: 'interest_subsidy',
    title: 'Hỗ trợ lãi suất vay',
    description: 'Quỹ hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ, chuyển giao công nghệ. Tối đa 5 tỷ VNĐ/dự án.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    color: 'blue',
    maxBudget: '5 tỷ VNĐ',
    tag: 'Đang mở',
    tagClass: 'badge-green',
    href: '/programs/interest_subsidy',
  },
  {
    slug: 'sponsorship',
    title: 'Tài trợ, đặt hàng',
    description: 'Tài trợ không hoàn lại cho doanh nghiệp và tổ chức thực hiện nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    color: 'green',
    maxBudget: '2 tỷ VNĐ',
    tag: 'Đang mở',
    tagClass: 'badge-green',
    href: '/programs/sponsorship',
  },
  {
    slug: 'voucher',
    title: 'Hỗ trợ voucher',
    description: 'Hỗ trợ voucher cho doanh nghiệp tiếp cận dịch vụ công nghệ, đào tạo, tư vấn chuyên gia trong lĩnh vực đổi mới sáng tạo.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    ),
    color: 'cyan',
    maxBudget: '100 triệu VNĐ',
    tag: 'Đang mở',
    tagClass: 'badge-cyan',
    href: '/programs/voucher',
  },
  {
    slug: 'ecosystem',
    title: 'Hệ sinh thái khởi nghiệp',
    description: 'Hỗ trợ hoạt động phát triển hệ sinh thái đổi mới sáng tạo, thúc đẩy văn hóa đổi mới và khởi nghiệp sáng tạo.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    color: 'amber',
    maxBudget: '3 tỷ VNĐ',
    tag: 'Đang mở',
    tagClass: 'badge-amber',
    href: '/programs/ecosystem',
  },
];

export default function Programs() {
  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="badge badge-blue inline-flex mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Chương trình hỗ trợ
          </div>
          <h2 className="section-title">Gói hỗ trợ dành cho doanh nghiệp</h2>
          <p className="section-subtitle mx-auto">
            Các chương trình tài trợ và hỗ trợ toàn diện theo Khoản 2, Điều 64 Luật Khoa học công nghệ
            và Đổi mới sáng tạo năm 2025.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div key={program.slug} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                  ${program.color === 'blue' ? 'bg-blue-100 text-natif-blue' : ''}
                  ${program.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                  ${program.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' : ''}
                  ${program.color === 'amber' ? 'bg-amber-100 text-amber-600' : ''}
                `}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {program.icon}
                  </svg>
                </div>
                <span className={`badge ${program.tagClass}`}>{program.tag}</span>
              </div>

              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-natif-blue transition-colors">
                {program.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {program.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Ngân sách tối đa</div>
                  <div className="font-heading font-semibold text-sm text-gray-900">{program.maxBudget}</div>
                </div>
                <Link href={program.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-natif-blue hover:gap-2.5 transition-all">
                  Chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/programs" className="btn-secondary">
            Xem tất cả chương trình
          </Link>
        </div>
      </div>
    </section>
  );
}
