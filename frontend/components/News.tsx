import Link from 'next/link';

const news = [
  {
    slug: 'thu-tuong-khoa-hoc-cong-nghe-la-yeu-to-so-cuong',
    title: 'Thủ tướng: Khoa học, công nghệ, đổi mới sáng tạo là yếu tố sống còn để hiện thực hóa khát vọng Việt Nam 2045',
    excerpt: 'Nhấn mạnh tầm quan trọng của khoa học, công nghệ và đổi mới sáng tạo trong phát triển kinh tế - xã hội, Thủ tướng Chính phủ Lê Minh Hưng khẳng định đây là yếu tố then chốt.',
    category: 'Tin hoạt động',
    categoryClass: 'badge-blue',
    date: '19/05/2026',
    author: 'Le Tuyet',
    readTime: '4 phút',
    featured: true,
  },
  {
    slug: 'natif-khao-sat-nhu-cau-ho-tro-2026',
    title: 'NATIF khảo sát nhu cầu tài trợ, hỗ trợ lãi suất vay và hỗ trợ voucher năm 2026',
    excerpt: 'Quỹ Đổi mới công nghệ quốc gia thông báo tiến hành khảo sát nhu cầu tài trợ, hỗ trợ lãi suất vay và voucher của doanh nghiệp trong năm 2026.',
    category: 'Thông báo',
    categoryClass: 'badge-amber',
    date: '10/04/2026',
    author: 'Le Tuyet',
    readTime: '2 phút',
    featured: false,
  },
  {
    slug: 'bo-truong-vu-hai-quan-uy-vien-ban-chi-dao',
    title: 'Bộ trưởng Vũ Hải Quân là Ủy viên Ban Chỉ đạo TW về phát triển KH&CN, ĐMST và chuyển đổi số',
    excerpt: 'Bộ trưởng Bộ Khoa học và Công nghệ Vũ Hải Quân được bổ nhiệm làm Ủy viên Ban Chỉ đạo Trung ương về phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số.',
    category: 'Tin hoạt động',
    categoryClass: 'badge-blue',
    date: '15/05/2026',
    author: 'Le Tuyet',
    readTime: '3 phút',
    featured: false,
  },
];

export default function News() {
  const featured = news.find(n => n.featured);
  const rest = news.filter(n => !n.featured);

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="badge badge-blue inline-flex mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Tin tức
            </div>
            <h2 className="section-title mb-0">Tin tức & Sự kiện</h2>
          </div>
          <Link href="/news" className="hidden sm:inline-flex items-center gap-2 text-natif-blue hover:text-natif-blue-light font-medium text-sm transition-colors">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured article */}
          {featured && (
            <Link href={`/news/${featured.slug}`} className="card group lg:row-span-1">
              <div className="h-48 rounded-lg bg-gradient-to-br from-natif-blue/10 to-natif-cyan/10 mb-5 flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-natif-blue/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge ${featured.categoryClass}`}>{featured.category}</span>
                <span className="text-xs text-gray-400">{featured.date}</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-natif-blue transition-colors leading-snug">
                {featured.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span>{featured.author}</span>
                <span>{featured.readTime} đọc</span>
              </div>
            </Link>
          )}

          {/* Side articles */}
          <div className="space-y-4">
            {rest.map((item) => (
              <Link key={item.slug} href={`/news/${item.slug}`} className="card group flex gap-4">
                <div className="w-24 h-24 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-natif-blue/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${item.categoryClass}`}>{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-gray-900 group-hover:text-natif-blue transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/news" className="btn-secondary text-sm">
            Xem tất cả tin tức
          </Link>
        </div>
      </div>
    </section>
  );
}
