import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Page header */}
        <div className="bg-gov-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
                <span>/</span>
                <span>Giới thiệu</span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">Về NATIF</h1>
              <p className="text-white/80 text-lg">
                Quỹ Đổi mới công nghệ quốc gia - Thông tin tổ chức, sứ mệnh và tầm nhìn.
              </p>
            </div>
          </div>
        </div>

        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Legal basis */}
            <section id="council">
              <div className="card-flat border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-gray-900">Cơ sở pháp lý</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Theo <strong>Khoản 2, Điều 64 Luật Khoa học công nghệ và Đổi mới sáng tạo năm 2025</strong>,
                    Quỹ Đổi mới công nghệ quốc gia (NATIF) thực hiện các chức năng:
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    {[
                      'Tài trợ, đặt hàng thực hiện chương trình, nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo',
                      'Hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ',
                      'Hỗ trợ kinh phí để ứng dụng công nghệ, chuyển giao công nghệ, đổi mới công nghệ và đổi mới sáng tạo',
                      'Hỗ trợ hoạt động phát triển hệ sinh thái đổi mới sáng tạo và khởi nghiệp sáng tạo',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Organization structure */}
            <section id="structure">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Cơ cấu tổ chức</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Hội đồng quản lý Quỹ',
                    desc: 'Cơ quan quản lý cao nhất của Quỹ, có chức năng quyết định các vấn đề quan trọng về hoạt động và tài chính của Quỹ.',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
                    color: 'bg-blue-100 text-natif-blue',
                  },
                  {
                    title: 'Cơ quan điều hành',
                    desc: 'Thực hiện các nhiệm vụ hàng ngày, quản lý chương trình hỗ trợ, xử lý hồ sơ và giải ngân vốn.',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
                    color: 'bg-green-100 text-green-600',
                  },
                  {
                    title: 'Ban Kiểm soát',
                    desc: 'Giám sát việc thực hiện các quyết định của Hội đồng quản lý và hoạt động tài chính của Quỹ.',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                    color: 'bg-amber-100 text-amber-600',
                  },
                ].map((item) => (
                  <div key={item.title} className="card text-center">
                    <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reports */}
            <section id="reports">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Báo cáo tài chính</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Công khai ngân sách Quý I/2026', date: '10/04/2026', type: 'Công khai' },
                  { title: 'Báo cáo tài chính năm 2025', date: '15/01/2026', type: 'Báo cáo năm' },
                  { title: 'Công khai ngân sách Quý IV/2025', date: '10/01/2026', type: 'Công khai' },
                  { title: 'Công khai ngân sách Quý III/2025', date: '10/10/2025', type: 'Công khai' },
                ].map((report) => (
                  <div key={report.title} className="card-flat border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{report.title}</div>
                        <div className="text-xs text-gray-400">{report.date}</div>
                      </div>
                    </div>
                    <span className="badge badge-blue text-xs shrink-0">{report.type}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Partner links */}
            <section>
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Đơn vị liên kết</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Bộ Khoa học và Công Nghệ',
                  'Quỹ phát triển KH&CN Quốc gia',
                  'Cục Đổi mới sáng tạo',
                  'Cục Công nghiệp CNTT',
                  'Viện Ứng dụng công nghệ',
                  'Trung tâm Truyền thông KH&CN',
                  'Cục Chuyển đổi số quốc gia',
                  'VNPT Technology',
                ].map((partner) => (
                  <div key={partner} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="w-8 h-8 rounded bg-gray-100 mx-auto mb-2" />
                    <div className="text-xs text-gray-600 font-medium leading-tight">{partner}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
