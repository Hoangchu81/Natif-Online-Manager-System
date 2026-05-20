import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: 'Hỗ trợ & Tài trợ',
      links: [
        { label: 'Hỗ trợ lãi suất vay', href: '/programs/interest_subsidy' },
        { label: 'Tài trợ, đặt hàng', href: '/programs/sponsorship' },
        { label: 'Hỗ trợ voucher', href: '/programs/voucher' },
        { label: 'Hệ sinh thái khởi nghiệp', href: '/programs/ecosystem' },
        { label: 'Nộp hồ sơ', href: '/apply' },
      ],
    },
    {
      title: 'Giới thiệu',
      links: [
        { label: 'Về NATIF', href: '/about' },
        { label: 'Hội đồng quản lý Quỹ', href: '/about#council' },
        { label: 'Cơ quan điều hành', href: '/about#team' },
        { label: 'Sơ đồ tổ chức', href: '/about#structure' },
        { label: 'Báo cáo tài chính', href: '/about#reports' },
      ],
    },
    {
      title: 'Tin tức',
      links: [
        { label: 'Tin hoạt động', href: '/news?category=activity' },
        { label: 'Tin đổi mới công nghệ', href: '/news?category=tech' },
        { label: 'Thông báo', href: '/news?category=announcement' },
        { label: 'Sự kiện', href: '/news' },
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Hướng dẫn nộp hồ sơ', href: '/help' },
        { label: 'Câu hỏi thường gặp', href: '/faq' },
        { label: 'Chính sách bảo mật', href: '/privacy' },
        { label: 'Điều khoản sử dụng', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img src="/natif-logo.svg" alt="NATIF" className="w-10 h-10 object-contain" />
              <div>
                <div className="font-heading font-bold text-white text-base">NATIF</div>
                <div className="text-[10px] text-gray-500 tracking-wide">Quỹ ĐMCTQG</div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Quỹ Đổi mới công nghệ quốc gia (NATIF) thực hiện chức năng tài trợ,
              đặt hàng và hỗ trợ doanh nghiệp đổi mới công nghệ theo Luật Khoa học
              công nghệ và Đổi mới sáng tạo năm 2025.
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: 'Facebook', href: 'https://www.facebook.com/natif.vn', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { label: 'LinkedIn', href: '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { label: 'YouTube', href: '#', icon: 'M23 7l-2 4-2-1-3-1v6l3-1 2-4 2 1 2 4 2-4z M17 7v8a3 3 0 003 3 3 3 0 003-3V7a3 3 0 00-6 0v8a3 3 0 003 3 3 3 0 003-3z' },
              ].map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-natif-blue flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-natif-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Tầng 5, 113 Trần Duy Hưng, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-natif-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@natif.vn" className="hover:text-white">contact@natif.vn</a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-natif-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:0913060581" className="hover:text-white">0913-060-581</a>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-center text-xs text-gray-600">
              <p>&copy; {currentYear} Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>
              <p className="mt-1">Hệ thống Quản lý Trực tuyến v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
