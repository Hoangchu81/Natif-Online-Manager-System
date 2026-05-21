import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật thông tin của Hệ thống Quản lý Trực tuyến NATIF',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <div className="bg-gov-gradient text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
                <span>/</span>
                <span>Chính sách bảo mật</span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl">Chính sách bảo mật</h1>
              <p className="text-white/80 mt-3 text-sm">
                Cập nhật: Ngày 20 tháng 5 năm 2026
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card-flat border border-gray-200 space-y-8">

            {/* 1. Giới thiệu */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                1. Giới thiệu
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>
                  Hệ thống Quản lý Trực tuyến NATIF (&ldquo;Hệ thống&rdquo;) được vận hành bởi
                  Cơ quan điều hành Quỹ Đổi mới công nghệ quốc gia (NATIF), thuộc Bộ Khoa học
                  và Công nghệ Việt Nam.
                </p>
                <p>
                  Chính sách bảo mật này (&ldquo;Chính sách&rdquo;) mô tả cách chúng tôi thu thập,
                  sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng Hệ thống,
                  phù hợp với:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Luật An ninh mạng số 24/2018/QH14</li>
                  <li>Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân</li>
                  <li>Luật Khoa học công nghệ và Đổi mới sáng tạo năm 2025</li>
                  <li>Nghị định 77/2026/NĐ-CP về tổ chức và hoạt động của Quỹ NATIF</li>
                </ul>
              </div>
            </section>

            {/* 2. Thu thập thong tin */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                2. Thông tin chúng tôi thu thập
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Hệ thống thu thập các thông tin sau:</p>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">a) Thông tin bắt buộc (để xử lý hồ sơ)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Họ và tên người đại diện pháp lý</li>
                      <li>Địa chỉ email</li>
                      <li>Mã số thuế doanh nghiệp</li>
                      <li>Tên doanh nghiệp/tổ chức</li>
                      <li>Nội dung hồ sơ xin hỗ trợ (mục tiêu, dự toán, kết quả dự kiến)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">b) Thông tin tùy chọn</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Số điện thoại liên hệ</li>
                      <li>Địa chỉ trụ sở doanh nghiệp</li>
                      <li>Thông tin tài khoản ngân hàng (đối với chương trình hỗ trợ lãi suất)</li>
                      <li>Các tài liệu đính kèm theo hồ sơ</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">c) Thông tin tự động</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Địa chỉ IP khi truy cập</li>
                      <li>Loại trình duyệt và hệ điều hành</li>
                      <li>Nhật ký truy cập (timestamp, trang đã xem)</li>
                      <li>Cookie phiên làm việc (session cookie) — không dùng cookie theo dõi quảng cáo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Muc dich su dung */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                3. Mục đích sử dụng thông tin
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Thông tin cá nhân được thu thập nhằm các mục đích:</p>
                <ul className="space-y-2">
                  {[
                    ['Tiếp nhận và xử lý hồ sơ', 'Đánh giá, thẩm định hồ sơ xin hỗ trợ theo quy trình của Hội đồng KHCN&ĐMST'],
                    ['Liên hệ phản hồi', 'Gửi thông báo về trạng thái hồ sơ, yêu cầu bổ sung hồ sơ, thông báo kết quả xét duyệt'],
                    ['Thống kê báo cáo', 'Tổng hợp dữ liệu phục vụ công tác quản lý, báo cáo tổng kết hoạt động Quỹ'],
                    ['Cải thiện Hệ thống', 'Phân tích lưu lượng truy cập để nâng cao chất lượng dịch vụ'],
                    ['Tuân thủ pháp luật', 'Cung cấp thông tin khi được cơ quan nhà nước có thẩm quyền yêu cầu theo quy định'],
                  ].map(([title, desc]) => (
                    <li key={title as string} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-natif-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <strong className="text-gray-800">{title}:</strong>{' '}
                        <span>{desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 4. Co so phap ly xu ly */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                4. Cơ sở pháp lý xử lý dữ liệu
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Việc xử lý dữ liệu cá nhân được thực hiện trên các cơ sở pháp lý sau:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Đồng ý của chủ thể dữ liệu</strong> — khi bạn chủ động nộp hồ sơ và đồng ý
                    với điều khoản sử dụng
                  </li>
                  <li>
                    <strong>Thực hiện hợp đồng</strong> — xử lý hồ sơ là bước cần thiết để thực hiện
                    quy trình tài trợ, hỗ trợ theo quy định của Quỹ
                  </li>
                  <li>
                    <strong>Nhiệm vụ công vụ</strong> — NATIF là đơn vị thuộc Bộ KH&CN, việc xử lý
                    dữ liệu phục vụ nhiệm vụ quản lý nhà nước về KH&CN và ĐMST
                  </li>
                  <li>
                    <strong>Pháp luật quy định</strong> — cung cấp thông tin khi có yêu cầu từ cơ
                    quan nhà nước có thẩm quyền theo Điều 22, Nghị định 13/2023/NĐ-CP
                  </li>
                </ul>
              </div>
            </section>

            {/* 5. Bao mat du lieu */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                5. Bảo mật dữ liệu
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Chúng tôi áp dụng các biện pháp bảo mật phù hợp bao gồm:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4m8 0v10m-8-10v10', label: 'Mã hóa dữ liệu', desc: 'SSL/TLS cho truyền tải, AES-256 cho dữ liệu lưu trữ' },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Kiểm soát truy cập', desc: 'Phân quyền theo vai trò, chỉ nhân viên được ủy quyền mới truy cập' },
                    { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H3m15 0h.582m0 0a8.001 8.001 0 01-7.418-7.418M3 9h1.582m0 0L3 12m0 0l.582.001M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Sao lưu định kỳ', desc: 'Backup hàng ngày, lưu trữ tại trung tâm dữ liệu đạt chuẩn' },
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Giám sát liên tục', desc: 'Hệ thống giám sát 24/7, phát hiện xâm nhập và bất thường' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-4 flex gap-3">
                      <svg className="w-6 h-6 text-natif-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Thoi gian luu tru */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                6. Thời gian lưu trữ
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Thông tin cá nhân được lưu trữ trong thời gian:</p>
                <div className="space-y-2">
                  {[
                    ['Hồ sơ xin hỗ trợ (cả nháp và đã nộp)', '10 năm kể từ ngày kết thúc hợp đồng tài trợ/hỗ trợ, theo quy định về lưu trữ tài liệu'],
                    ['Thông tin tài khoản người dùng', '5 năm kể từ lần đăng nhập cuối cùng hoặc khi tài khoản bị xóa'],
                    ['Nhật ký truy cập hệ thống', '2 năm theo quy định của Luật An ninh mạng'],
                    ['Cookie phiên làm việc', 'Chỉ trong phiên trình duyệt, tự động xóa khi đóng trình duyệt'],
                  ].map(([label, desc]) => (
                    <div key={label as string} className="flex items-start gap-2">
                      <span className="badge badge-blue text-xs shrink-0 mt-0.5">{label.split('(')[0].trim()}</span>
                      <span className="text-gray-600">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Quyen cua chu the */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                7. Quyền của chủ thể dữ liệu
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Theo Nghị định 13/2023/NĐ-CP, bạn có các quyền:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Quyền biết', desc: 'Được thông báo về việc thu thập và xử lý dữ liệu cá nhân' },
                    { title: 'Quyền đồng ý', desc: 'Đồng ý hoặc rút lại đồng ý xử lý dữ liệu bất kỳ lúc nào (đối với dữ liệu không bắt buộc)' },
                    { title: 'Quyền truy cập', desc: 'Xem, tải về thông tin cá nhân đã cung cấp cho Hệ thống' },
                    { title: 'Quyền chỉnh sửa', desc: 'Yêu cầu sửa đổi thông tin không chính xác hoặc lỗi thời' },
                    { title: 'Quyền xóa', desc: 'Yêu cầu xóa dữ liệu cá nhân (trong phạm vi pháp luật cho phép)' },
                    { title: 'Quyền khiếu nại', desc: 'Khiếu nại đến cơ quan nhà nước có thẩm quyền về việc xử lý dữ liệu' },
                  ].map((item) => (
                    <div key={item.title} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-800 text-sm mb-1">{item.title}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 rounded-xl p-4 flex gap-3 mt-4">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Để thực hiện quyền của bạn, vui lòng liên hệ qua email{' '}
                    <a href="mailto:info@natif.vn" className="font-medium underline">info@natif.vn</a>{' '}
                    hoặc gọi <strong>0913.060.581</strong>. Chúng tôi sẽ phản hồi trong vòng{' '}
                    <strong>72 giờ</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Chia se du lieu */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                8. Chia sẻ dữ liệu
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Chúng tôi <strong>không bán</strong> thông tin cá nhân cho bên thứ ba. Dữ liệu chỉ được chia sẻ trong các trường hợp:</p>
                <ul className="space-y-2">
                  {[
                    ['Hội đồng KHCN&ĐMST', 'Hồ sơ được chuyển đến Hội đồng để đánh giá, thẩm định theo quy trình'],
                    ['Cơ quan nhà nước có thẩm quyền', 'Theo yêu cầu bằng văn bản của cơ quan quản lý, điều tra theo Luật An ninh mạng'],
                    ['Đơn vị cung cấp dịch vụ', 'Nhà thầu công nghệ hỗ trợ vận hành Hệ thống (theo hợp đồng có cam kết bảo mật)'],
                  ].map(([title, desc]) => (
                    <li key={title as string} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <strong className="text-gray-800">{title}:</strong>{' '}
                        <span>{desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 9. Cookies */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                9. Cookie và công nghệ tương tự
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Hệ thống chỉ sử dụng các loại cookie sau:</p>
                <div className="space-y-2">
                  {[
                    { type: 'Cookie cần thiết', desc: 'Session cookie để duy trì đăng nhập và xử lý biểu mẫu. Không thể tắt.', essential: true },
                    { type: 'Cookie phân tích', desc: 'Sử dụng công cụ phân tích ẩn danh (không thu thập dữ liệu cá nhân) để cải thiện Hệ thống.', essential: false },
                  ].map((c) => (
                    <div key={c.type} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${c.essential ? 'bg-natif-blue border-natif-blue' : 'bg-white border-gray-300'}`}>
                        {c.essential && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{c.type}</div>
                        <div className="text-gray-500 text-xs">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 10. Thay doi chinh sach */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                10. Thay đổi Chính sách
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>
                  Chính sách này có thể được cập nhật định kỳ khi có thay đổi về pháp luật hoặc
                  quy trình hoạt động của Quỹ. Phiên bản mới sẽ được đăng tải trên trang này
                  với thông báo rõ ràng về ngày cập nhật.
                </p>
                <p>
                  Nếu có thay đổi quan trọng ảnh hưởng đến quyền lợi của bạn, chúng tôi sẽ
                  thông báo qua email đã đăng ký ít nhất <strong>30 ngày trước</strong> khi
                  áp dụng.
                </p>
              </div>
            </section>

            {/* 11. Lien he */}
            <section>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 pb-2 border-b border-gray-200">
                11. Liên hệ
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                <p>Mọi thắc mắc về Chính sách bảo mật này, vui lòng liên hệ:</p>
                <div className="bg-natif-blue/5 rounded-xl p-5 space-y-2">
                  <p className="font-semibold text-gray-900">Cơ quan điều hành Quỹ Đổi mới công nghệ quốc gia (NATIF)</p>
                  <p>📍 Tầng 5, 113 Trần Duy Hưng, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội</p>
                  <p>📧 <a href="mailto:info@natif.vn" className="text-natif-blue hover:underline">info@natif.vn</a></p>
                  <p>📞 0913.060.581</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-amber-800 text-xs">
                  <strong>Lưu ý:</strong> Nếu bạn cho rằng Quỹ xử lý dữ liệu cá nhân không đúng
                  pháp luật, bạn có quyền khiếu nại đến Cục An ninh mạng, Bộ Công an hoặc
                  Cơ quan quản lý về bảo vệ dữ liệu cá nhân theo quy định tại Điều 62,
                  Nghị định 13/2023/NĐ-CP.
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
