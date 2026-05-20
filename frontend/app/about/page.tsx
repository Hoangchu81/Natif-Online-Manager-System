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
                Quỹ Đổi mới công nghệ quốc gia — Đơn vị thuộc Bộ Khoa học và Công nghệ,
                thực hiện chức năng tài trợ, đặt hàng và hỗ trợ theo Luật Khoa học công nghệ
                và Đổi mới sáng tạo năm 2025.
              </p>
            </div>
          </div>
        </div>

        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

            {/* Legal basis */}
            <section>
              <div className="card-flat border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-gray-900">Cơ sở pháp lý</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Quỹ Đổi mới công nghệ quốc gia (NATIF) được thành lập và hoạt động theo{' '}
                    <strong>Luật Khoa học công nghệ và Đổi mới sáng tạo năm 2025</strong>,{' '}
                    <strong>Nghị định số 77/2026/NĐ-CP</strong> của Chính phủ quy định về tổ chức
                    và hoạt động của Quỹ, và các văn bản hướng dẫn thi hành.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-5">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      Theo Khoản 2, Điều 64 Luật KHCN và ĐMST năm 2025, Quỹ thực hiện:
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Tài trợ, đặt hàng thực hiện chương trình, nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo',
                        'Hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ',
                        'Hỗ trợ kinh phí để ứng dụng công nghệ, chuyển giao công nghệ, đổi mới công nghệ và đổi mới sáng tạo',
                        'Hỗ trợ hoạt động phát triển hệ sinh thái đổi mới sáng tạo và khởi nghiệp sáng tạo',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                          <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Organization structure - NĐ 77/2026 */}
            <section id="structure">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Cơ cấu tổ chức</h2>
              <p className="text-gray-500 text-sm mb-8 -mt-4">
                Theo Nghị định 77/2026/NĐ-CP, Quỹ không còn có Hội đồng quản lý. Các cơ quan tư vấn
                bao gồm Hội đồng tư vấn và Hội đồng Khoa học, công nghệ và đổi mới sáng tạo.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Hội đồng tư vấn */}
                <div className="card text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-2">Hội đồng tư vấn</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Cơ quan tư vấn có tính chất chính sách, hỗ trợ lãnh đạo Bộ trong việc xác định
                    định hướng, mục tiêu hoạt động của Quỹ phù hợp với chiến lược phát triển
                    khoa học, công nghệ và đổi mới sáng tạo quốc gia.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Chủ tịch: Lãnh đạo Bộ KH&CN</span>
                  </div>
                </div>

                {/* Hội đồng KHCN&ĐMST */}
                <div className="card text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-2">Hội đồng KHCN&amp;ĐMST</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Cơ quan tư vấn chuyên môn trực thuộc Quỹ, có nhiệm vụ đánh giá, xét duyệt
                    các nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo, đảm bảo chất lượng
                    và tính khả thi của các đề xuất được tài trợ.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Thẩm định hồ sơ xin tài trợ</span>
                  </div>
                </div>

                {/* Cơ quan điều hành */}
                <div className="card text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-2">Cơ quan điều hành</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Đơn vị trực thuộc Bộ Khoa học và Công nghệ, thực hiện các nhiệm vụ hàng ngày
                    của Quỹ: quản lý chương trình, tiếp nhận và xử lý hồ sơ, giải ngân vốn,
                    theo dõi và đánh giá kết quả thực hiện.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Trực thuộc Bộ KH&amp;CN</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Org chart */}
            <section id="council">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Sơ đồ tổ chức</h2>
              <div className="card-flat border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6">
                  <div className="flex flex-col items-center gap-4">
                    {/* Bộ KH&CN */}
                    <div className="bg-natif-blue text-white rounded-xl px-8 py-3 font-heading font-bold text-sm text-center shadow-md">
                      BỘ KHOA HỌC VÀ CÔNG NGHỆ
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m-6-6l6 6 6-6" />
                    </svg>
                    <div className="bg-white border-2 border-natif-blue rounded-xl px-8 py-3 font-heading font-bold text-sm text-center shadow-sm">
                      CƠ QUAN ĐIỀU HÀNH QUỸ NATIF
                    </div>
                    {/* Sub units */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Ban Quản lý Chương trình</p>
                        <p className="text-xs text-gray-400 mt-1">Tiếp nhận & xét duyệt hồ sơ</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Ban Tài chính - Kế toán</p>
                        <p className="text-xs text-gray-400 mt-1">Giải ngân & quyết toán</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Ban Hành chính - Pháp chế</p>
                        <p className="text-xs text-gray-400 mt-1">Pháp lý & hành chính</p>
                      </div>
                    </div>
                    {/* Advisory bodies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-blue-800 mb-1">HỘI ĐỒNG TƯ VẤN</p>
                        <p className="text-xs text-blue-600">Tư vấn chính sách & định hướng chiến lược</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-green-800 mb-1">HỘI ĐỒNG KHCN&amp;ĐMST</p>
                        <p className="text-xs text-green-600">Đánh giá, thẩm định nhiệm vụ tài trợ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reports */}
            <section id="reports">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-6">Báo cáo tài chính</h2>
              <div className="grid md:grid-cols-2 gap-4">
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
                  'Bộ Khoa học và Công nghệ',
                  'Cục Đổi mới sáng tạo',
                  'Quỹ Phát triển KH&CN Quốc gia',
                  'Viện Ứng dụng công nghệ',
                  'Cục Chuyển đổi số quốc gia',
                  'Trung tâm Truyền thông KH&CN',
                  'Cục Công nghiệp CNTT',
                  'VNPT Technology',
                ].map((partner) => (
                  <div key={partner} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-natif-blue transition-colors">
                    <div className="w-8 h-8 rounded bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
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
