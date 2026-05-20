import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const programs = [
  {
    slug: 'interest_subsidy',
    name: 'Hỗ trợ lãi suất vay',
    shortDesc: 'Hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ.',
    fullDesc: `Quỹ Đổi mới công nghệ quốc gia (NATIF) hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ, chuyển giao công nghệ theo quy định tại Khoản 2, Điều 64 Luật Khoa học công nghệ và Đổi mới sáng tạo năm 2025.

Hỗ trợ lãi suất vay nhằm giảm gánh nặng tài chính cho doanh nghiệp trong quá triển khai dự án đổi mới công nghệ, giúp doanh nghiệp tiếp cận nguồn vốn ưu đãi từ các ngân hàng thương mại.`,
    requirements: [
      'Doanh nghiệp được thành lập và hoạt động theo pháp luật Việt Nam',
      'Có dự án đổi mới công nghệ được phê duyệt hoặc đang triển khai',
      'Khoản vay tại ngân hàng thương mại được phép theo quy định',
      'Không có nợ xấu tại các tổ chức tín dụng',
      'Đảm bảo hoàn vốn và có phương án trả nợ khả thi',
    ],
    maxBudget: '5 tỷ VNĐ',
    minBudget: '100 triệu VNĐ',
    duration: 'Theo thời hạn khoản vay',
    eligibleEntities: 'Doanh nghiệp tư nhân, công ty TNHH, công ty cổ phần',
    legalBasis: 'Nghị định 268/2025/NĐ-CP (Phụ lục II)',
    iconBg: 'bg-blue-100',
    iconColor: 'text-natif-blue',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    badge: 'badge-blue',
    colorAccent: '#1f3892',
  },
  {
    slug: 'sponsorship',
    name: 'Tài trợ, đặt hàng',
    shortDesc: 'Tài trợ không hoàn lại cho nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo.',
    fullDesc: `Tài trợ một phần hoặc toàn bộ kinh phí không hoàn lại cho doanh nghiệp và tổ chức thực hiện các nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo theo quy định của pháp luật.

Chương trình tài trợ nhằm khuyến khích các doanh nghiệp đầu tư vào nghiên cứu và phát triển, chuyển giao công nghệ, đổi mới công nghệ và đổi mới sáng tạo, góp phần nâng cao năng lực cạnh tranh.`,
    requirements: [
      'Nhiệm vụ phù hợp với định hướng phát triển khoa học và công nghệ quốc gia',
      'Đội ngũ kỹ thuật đủ năng lực thực hiện nhiệm vụ',
      'Cam kết kết quả và tiến độ rõ ràng, có đánh giá khả thi',
      'Có khả năng huy động nguồn lực đối ứng (nếu có)',
      'Sản phẩm đầu ra phải được thương mại hóa hoặc ứng dụng thực tiễn',
    ],
    maxBudget: '2 tỷ VNĐ',
    minBudget: '200 triệu VNĐ',
    duration: '12 - 36 tháng',
    eligibleEntities: 'Doanh nghiệp, viện nghiên cứu, trường đại học, tổ chức trung gian',
    legalBasis: 'Nghị định 68/2025/NĐ-CP (Phụ lục I)',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    badge: 'badge-green',
    colorAccent: '#059669',
  },
  {
    slug: 'voucher',
    name: 'Hỗ trợ voucher',
    shortDesc: 'Voucher tiếp cận dịch vụ công nghệ, đào tạo và tư vấn chuyên gia.',
    fullDesc: `Chương trình hỗ trợ voucher cho doanh nghiệp tiếp cận dịch vụ công nghệ, đào tạo và tư vấn chuyên gia trong lĩnh vực đổi mới sáng tạo.

Voucher giúp các doanh nghiệp vừa và nhỏ (SME) tiếp cận các dịch vụ chuyên nghiệp với chi phí hợp lý, từ đó nâng cao năng lực công nghệ và quản trị doanh nghiệp.`,
    requirements: [
      'Doanh nghiệp SME theo quy định pháp luật Việt Nam',
      'Chưa từng được hỗ trợ voucher trong năm tài chính hiện tại',
      'Cam kết sử dụng voucher đúng mục đích',
      'Đơn vị cung cấp dịch vụ phải nằm trong danh sách được NATIF công nhận',
      'Hoàn thành báo cáo sử dụng voucher sau khi kết thúc',
    ],
    maxBudget: '100 triệu VNĐ',
    minBudget: '10 triệu VNĐ',
    duration: 'Trong năm tài chính',
    eligibleEntities: 'Doanh nghiệp SME theo Nghị định 80/2024/NĐ-CP',
    legalBasis: 'Nghị định 268/2025/NĐ-CP (Phụ lục III)',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    badge: 'badge-cyan',
    colorAccent: '#0891B2',
  },
  {
    slug: 'ecosystem',
    name: 'Thúc đẩy hệ sinh thái khởi nghiệp sáng tạo',
    shortDesc: 'Hỗ trợ phát triển hệ sinh thái đổi mới sáng tạo và khởi nghiệp sáng tạo.',
    fullDesc: `Hỗ trợ hoạt động phát triển hệ sinh thái đổi mới sáng tạo, hệ sinh thái khởi nghiệp sáng tạo, thúc đẩy văn hóa đổi mới sáng tạo và khởi nghiệp sáng tạo theo quy định tại Điều 64 Luật Khoa học công nghệ và Đổi mới sáng tạo năm 2025.

Chương trình nhằm xây dựng và phát triển hệ sinh thái đổi mới sáng tạo quốc gia, kết nối các chủ thể trong hệ sinh thái bao gồm startup, nhà đầu tư, quỹ đầu tư, không gian sáng tạo, và các tổ chức hỗ trợ khởi nghiệp.`,
    requirements: [
      'Tổ chức, cá nhân hoạt động trong hệ sinh thái đổi mới sáng tạo',
      'Có kế hoạch hoạt động cụ thể với mục tiêu và chỉ tiêu đo lường rõ ràng',
      'Có tác động xã hội tích cực và lâu dài',
      'Có khả năng tạo việc làm và phát triển nhân lực',
      'Cam kết chia sẻ kết quả và dữ liệu với NATIF',
    ],
    maxBudget: '3 tỷ VNĐ',
    minBudget: '50 triệu VNĐ',
    duration: '6 - 24 tháng',
    eligibleEntities: 'Tổ chức hỗ trợ khởi nghiệp, không gian sáng tạo, quỹ đầu tư, startup',
    legalBasis: 'Nghị định 268/2025/NĐ-CP (Phụ lục IV)',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    badge: 'badge-amber',
    colorAccent: '#D97706',
  },
];

export async function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) return {};
  return {
    title: program.name,
    description: program.shortDesc,
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  const otherPrograms = programs.filter((p) => p.slug !== slug);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <div className="bg-gov-gradient text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link href="/programs" className="hover:text-white transition-colors">Chương trình hỗ trợ</Link>
              <span>/</span>
              <span className="text-white">{program.name}</span>
            </div>
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-2xl ${program.iconBg} flex items-center justify-center shrink-0`}>
                <svg className={`w-8 h-8 ${program.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={program.icon} />
                </svg>
              </div>
              <div>
                <span className={`badge ${program.badge} mb-3`}>Đang mở</span>
                <h1 className="font-heading font-extrabold text-3xl md:text-4xl mb-3">{program.name}</h1>
                <p className="text-white/80 text-lg max-w-2xl">{program.shortDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card-flat border border-gray-200">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Mô tả chương trình</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{program.fullDesc}</p>
              </div>

              <div className="card-flat border border-gray-200">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Điều kiện tham gia</h2>
                <ul className="space-y-3">
                  {program.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-flat border border-gray-200">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Căn cứ pháp lý</h2>
                <p className="text-sm text-gray-600">{program.legalBasis}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="card-flat border border-gray-200">
                <h3 className="font-heading font-bold text-gray-900 mb-4">Thông tin hỗ trợ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Ngân sách tối đa</span>
                    <span className="text-sm font-semibold text-gray-900">{program.maxBudget}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Ngân sách tối thiểu</span>
                    <span className="text-sm font-semibold text-gray-900">{program.minBudget}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Thời gian thực hiện</span>
                    <span className="text-sm font-semibold text-gray-900">{program.duration}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Đối tượng</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[160px]">{program.eligibleEntities}</span>
                  </div>
                </div>
                <Link href="/apply" className="btn-primary w-full justify-center mt-5">
                  Nộp hồ sơ ngay
                </Link>
              </div>

              {/* Other programs */}
              <div className="card-flat border border-gray-200">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Chương trình khác</h3>
                <div className="space-y-2">
                  {otherPrograms.map((p) => (
                    <Link key={p.slug} href={`/programs/${p.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${p.iconBg}`}>
                        <svg className={`w-4 h-4 ${p.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.maxBudget}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/programs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tất cả chương trình
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
