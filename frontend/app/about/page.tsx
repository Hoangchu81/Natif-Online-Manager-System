import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// ─── SVG Illustration Components ─────────────────────────────────────────────

function TechCircuit() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="4" fill="#00C9FF" />
      <circle cx="350" cy="30" r="4" fill="#00C9FF" />
      <circle cx="200" cy="150" r="6" fill="#6FD33D" />
      <circle cx="80" cy="200" r="4" fill="#00C9FF" />
      <circle cx="320" cy="220" r="4" fill="#6FD33D" />
      <circle cx="150" cy="80" r="3" fill="#ffffff" />
      <circle cx="280" cy="120" r="3" fill="#ffffff" />
      <circle cx="100" cy="250" r="3" fill="#00C9FF" />
      <circle cx="300" cy="270" r="3" fill="#6FD33D" />
      <line x1="50" y1="50" x2="150" y2="80" stroke="#00C9FF" strokeWidth="1" />
      <line x1="350" y1="30" x2="280" y2="120" stroke="#00C9FF" strokeWidth="1" />
      <line x1="200" y1="150" x2="280" y2="120" stroke="#6FD33D" strokeWidth="1" />
      <line x1="200" y1="150" x2="150" y2="80" stroke="#ffffff" strokeWidth="1" />
      <line x1="80" y1="200" x2="150" y2="80" stroke="#00C9FF" strokeWidth="1" />
      <line x1="320" y1="220" x2="280" y2="120" stroke="#6FD33D" strokeWidth="1" />
      <line x1="200" y1="150" x2="80" y2="200" stroke="#ffffff" strokeWidth="1" />
      <line x1="200" y1="150" x2="320" y2="220" stroke="#ffffff" strokeWidth="1" />
      <line x1="80" y1="200" x2="100" y2="250" stroke="#00C9FF" strokeWidth="1" />
      <line x1="320" y1="220" x2="300" y2="270" stroke="#6FD33D" strokeWidth="1" />
      <line x1="100" y1="250" x2="300" y2="270" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
      <circle cx="200" cy="150" r="40" stroke="#00C9FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <circle cx="200" cy="150" r="70" stroke="#6FD33D" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
    </svg>
  );
}

function DigitalBlocks() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="60" height="45" rx="4" fill="#1f3892" fillOpacity="0.15" stroke="#1f3892" strokeWidth="1.5" />
      <rect x="80" y="5" width="55" height="35" rx="4" fill="#00C9FF" fillOpacity="0.1" stroke="#00C9FF" strokeWidth="1.5" />
      <rect x="145" y="15" width="45" height="50" rx="4" fill="#6FD33D" fillOpacity="0.1" stroke="#6FD33D" strokeWidth="1.5" />
      <rect x="20" y="65" width="80" height="45" rx="4" fill="#00C9FF" fillOpacity="0.1" stroke="#00C9FF" strokeWidth="1.5" />
      <rect x="110" y="72" width="70" height="38" rx="4" fill="#1f3892" fillOpacity="0.15" stroke="#1f3892" strokeWidth="1.5" />
      <line x1="40" y1="32" x2="80" y2="22" stroke="#00C9FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="135" y1="40" x2="145" y2="65" stroke="#6FD33D" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="100" y1="87" x2="110" y2="72" stroke="#1f3892" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <circle cx="130" cy="22" r="3" fill="#00C9FF" />
      <circle cx="70" cy="87" r="3" fill="#6FD33D" />
      <circle cx="160" cy="87" r="3" fill="#00C9FF" />
    </svg>
  );
}

// ─── Department Icons ─────────────────────────────────────────────────────────

function IconOffice() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="14" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14V10a2 2 0 012-2h16a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 26h36" stroke="currentColor" strokeWidth="2" />
      <path d="M18 26v16M30 26v16" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="20" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconFinance() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
      <path d="M24 14v20M18 19c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6 2.686-6 6 2.686 4 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconStartup() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <path d="M24 6L6 18v18l18 6 18-6V18L24 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 18l18 6 18-6M24 24v18" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconInnovation() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <path d="M24 6v6M42 24h-6M24 42v-6M6 24h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
      <path d="M36 12l-4 4M12 12l4 4M36 36l-4-4M12 36l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconInterest() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="18" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M40 22l-6 6v8l6-6V22z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 18V14a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28h8M24 24v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLegal() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <path d="M12 8h16l8 8v24a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 8v8h12" stroke="currentColor" strokeWidth="2" />
      <path d="M18 24h12M18 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDigital() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="8" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 16h40" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
      <path d="M10 40v4M38 40v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 40h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="20" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 20l4 5-4 5M34 30h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Timeline Milestone Icons ───────────────────────────────────────────────

function IconBuilding() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v15h20V7L12 2zm0 2.5L19 8H5l7-3.5zM4 21V9.5l8-4 8 4V21H4z" /></svg>;
}
function IconExpand() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v2H4zm10 0h6v2h-6zM4 18h6v-2H4zm10 0h6v-2h-6zM9 9h6v6H9z" /></svg>;
}
function IconRocket() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 4-6 8-6 11a6 6 0 0012 0c0-3-2-7-6-11zm0 15a3 3 0 01-3-3c0-1.5 1-3.5 3-5.5 2 2 3 4 3 5.5a3 3 0 01-3 3z" /></svg>;
}
function IconLaw() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 2.18l6 3v5.82c0 4.17-2.67 8.18-6 9.5-3.33-1.32-6-5.33-6-9.5V7.18l6-3z" /><path d="M12 8v8M9 12h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconTrophy() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5a2 2 0 00-2 2v2c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H8v2h8v-2h-3v-2.1c1.63-.33 2.98-1.46 3.61-2.96C17.08 13.63 19 11.55 19 9V7a2 2 0 00-2-2zM5 9V7h2v3.82C5.84 10.4 5 9.3 5 9zm14 0c0 1.3-.84 2.4-2 2.82V7h2v2z" /></svg>;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const stats = [
  { value: '13', suffix: '+', label: 'Năm hoạt động', color: '#1f3892' },
  { value: '4', suffix: '', label: 'Chương trình tài trợ', color: '#00C9FF' },
  { value: '382', suffix: ' tỷ', label: 'Ngân sách 2026', color: '#6FD33D' },
  { value: '70', suffix: ' tỷ', label: 'Đầu tư chuyển đổi số', color: '#8B5CF6' },
];

const departments = [
  {
    name: 'Văn phòng',
    tagline: 'Hành chính & Đối ngoại',
    desc: 'Quản trị hành chính, công tác đối ngoại, Đảng ủy và các đoàn thể. Đảm bảo vận hành hiệu quả mọi hoạt động của Quỹ.',
    icon: <IconOffice />,
    color: '#1f3892',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Kế hoạch – Tài chính',
    tagline: 'Ngân sách & Kế toán',
    desc: 'Xây dựng kế hoạch tài chính, quản lý ngân sách, hạch toán kế toán và công tác thống kê. Giám sát hiệu quả sử dụng nguồn lực.',
    icon: <IconFinance />,
    color: '#00C9FF',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    iconColor: 'text-cyan-600',
  },
  {
    name: 'Hỗ trợ Khởi nghiệp Sáng tạo',
    tagline: 'Hệ sinh thái Startup',
    desc: 'Phát triển và vận hành hệ sinh thái khởi nghiệp đổi mới sáng tạo. Kết nối startup, ươm tạo công nghệ và truyền thông chương trình.',
    icon: <IconStartup />,
    color: '#6FD33D',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
  },
  {
    name: 'Đổi mới Công nghệ',
    tagline: 'Tài trợ & Đặt hàng',
    desc: 'Quản lý chương trình tài trợ đặt hàng nhiệm vụ KH&CN. Triển khai voucher công nghệ, thẩm định và nghiệm thu kết quả nghiên cứu.',
    icon: <IconInnovation />,
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Hỗ trợ Lãi suất Vay',
    tagline: 'Tài chính ưu đãi',
    desc: 'Điều phối chương trình hỗ trợ lãi suất vay cho doanh nghiệp. Liên kết ngân hàng thương mại, thẩm định và giám sát hồ sơ vay.',
    icon: <IconInterest />,
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Pháp chế',
    tagline: 'Tuân thủ & Quản trị',
    desc: 'Công tác pháp chế, kiểm tra nội bộ, quản trị rủi ro và tuân thủ pháp luật. Đảm bảo mọi hoạt động đúng quy định.',
    icon: <IconLegal />,
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
  },
  {
    name: 'Chuyển đổi Số',
    tagline: 'AI & Hạ tầng Công nghệ',
    desc: 'Xây dựng hạ tầng số, triển khai AI và HPC phục vụ nghiên cứu. Vận hành nền tảng quản lý trực tuyến và kết nối cơ sở dữ liệu.',
    icon: <IconDigital />,
    color: '#06B6D4',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    iconColor: 'text-sky-600',
  },
];

const timeline = [
  {
    year: '2013',
    title: 'Thành lập Quỹ NATIF',
    desc: 'Được thành lập theo quy định của Chính phủ, trực thuộc Bộ Khoa học và Công nghệ. Khởi đầu hành trình đồng hành cùng doanh nghiệp Việt.',
    icon: <IconBuilding />,
    color: '#1f3892',
  },
  {
    year: '2017',
    title: 'Mở rộng chương trình tài trợ',
    desc: 'Bổ sung hỗ trợ lãi suất vay, tài trợ đặt hàng và hệ sinh thái. Hợp tác chiến lược với ngân hàng và tổ chức tài chính.',
    icon: <IconExpand />,
    color: '#00C9FF',
  },
  {
    year: '2019',
    title: 'Khởi động đề án tự chủ',
    desc: 'Chính thức triển khai đề án tự chủ về tài chính, nhân lực và hoạt động. Xây dựng nền tảng cho mô hình hoạt động bền vững.',
    icon: <IconRocket />,
    color: '#6FD33D',
  },
  {
    year: '2025',
    title: 'Luật KH&CN sửa đổi có hiệu lực',
    desc: 'Tạo hành lang pháp lý mới cho các quỹ tài chính công. NATIF sẵn sàng bước vào giai đoạn chuyển đổi mô hình toàn diện.',
    icon: <IconLaw />,
    color: '#8B5CF6',
  },
  {
    year: '2026',
    title: 'Nghị định 77/2026 — Mô hình tự chủ',
    desc: 'Chuyển đổi sang mô hình tự chủ toàn diện. Khẳng định vị thế tiên phong trong hệ thống quỹ đổi mới quốc gia.',
    icon: <IconTrophy />,
    color: '#F59E0B',
  },
];

const programs = [
  {
    title: 'Hỗ trợ lãi suất vay',
    short: 'Lãi suất ưu đãi',
    desc: 'Hỗ trợ đến 100% lãi suất vay cho doanh nghiệp đầu tư công nghệ mới.',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'blue',
    href: '/programs/interest_subsidy',
  },
  {
    title: 'Tài trợ đặt hàng',
    short: 'Nghiên cứu & Phát triển',
    desc: 'Tài trợ không hoàn lại cho nhiệm vụ khoa học công nghệ theo Nghị định 68/2025.',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0l-.341.341a2.25 2.25 0 01-.659.591V17.5" />
      </svg>
    ),
    color: 'green',
    href: '/programs/sponsorship',
  },
  {
    title: 'Phiếu mua hàng công nghệ',
    short: 'Voucher công nghệ',
    desc: 'Hỗ trợ doanh nghiệp nhỏ và vừa tiếp cận dịch vụ công nghệ với phiếu giảm giá.',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    color: 'cyan',
    href: '/programs/voucher',
  },
  {
    title: 'Hỗ trợ hệ sinh thái',
    short: 'Khởi nghiệp ĐMST',
    desc: 'Toàn diện cho trung tâm ươm tạo, vườn ươm công nghệ và startup trên toàn quốc.',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    color: 'amber',
    href: '/programs/ecosystem',
  },
];

const autonomyPillars = [
  {
    icon: '💰',
    title: 'Tự chủ tài chính',
    desc: 'Kết hợp ngân sách nhà nước với thu nhập từ hoạt động sự nghiệp, đầu tư và hợp tác quốc tế.',
    stat: 'Nhóm 2 — Tự bảo đảm',
  },
  {
    icon: '👥',
    title: 'Tự chủ nhân lực',
    desc: 'Linh hoạt tuyển dụng, đào tạo và phát triển đội ngũ chuyên gia, cán bộ quản lý chuyên môn.',
    stat: '67 chuyên gia & cán bộ',
  },
  {
    icon: '⚙️',
    title: 'Tự chủ hoạt động',
    desc: 'Thiết kế chương trình, quy trình đánh giá và tiêu chí tài trợ phù hợp thực tiễn đổi mới.',
    stat: '4 chương trình đồng bộ',
  },
  {
    icon: '🔗',
    title: 'Chuyển đổi số',
    desc: 'AI, HPC, hạ tầng số và nền tảng quản lý trực tuyến. Công khai minh bạch qua hệ thống số.',
    stat: '70 tỷ đầu tư 2026–2030',
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gov-gradient">
          <div className="absolute inset-0 opacity-10">
            <TechCircuit />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-natif-cyan animate-pulse" />
                  Quỹ Đổi mới Công nghệ Quốc gia
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  Tự chủ — Đổi mới —<br />
                  <span className="text-natif-cyan">Bền vững</span>
                </h1>
                <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
                  Hành trình 13 năm kiến tạo hệ sinh thái đổi mới công nghệ quốc gia. Từ giai đoạn thành lập đến mô hình tự chủ toàn diện theo Nghị định 77/2026/NĐ-CP.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/programs" className="btn-accent text-sm px-6 py-2.5">
                    Khám phá chương trình
                  </Link>
                  <Link href="/apply" className="px-6 py-2.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors text-sm font-medium">
                    Nộp hồ sơ ngay
                  </Link>
                </div>
              </div>
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="font-heading text-2xl sm:text-3xl font-black text-white mb-1">
                      {s.value}<span className="text-natif-cyan text-base">{s.suffix}</span>
                    </div>
                    <div className="text-xs font-medium text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" className="w-full h-14">
              <path d="M0 60V30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* ── INTRO ────────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="badge bg-natif-blue/10 text-natif-blue text-xs">GIỚI THIỆU</span>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-5">
                  Chúng tôi là ai?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Quỹ Đổi mới Công nghệ Quốc gia (NATIF) là tổ chức tài chính công trực thuộc Bộ Khoa học và Công nghệ, có chức năng hỗ trợ tài chính cho hoạt động đổi mới công nghệ và chuyển giao nguồn lực.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Với 7 phòng ban chuyên môn và đội ngũ cán bộ tận tâm, NATIF đồng hành cùng doanh nghiệp Việt Nam trên hành trình chuyển đổi số và phát triển bền vững.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-natif-blue/5 to-natif-cyan/5 rounded-3xl p-8 border border-natif-blue/10">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Sứ mệnh', icon: '🎯', text: 'Thúc đẩy ĐMST' },
                      { label: 'Tầm nhìn', icon: '🔭', text: 'Hiệu quả bền vững' },
                      { label: 'Giá trị', icon: '⭐', text: 'Minh bạch – Đổi mới' },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="font-heading font-bold text-sm text-gray-800">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.text}</div>
                      </div>
                    ))}
                  </div>
                  <blockquote className="font-serif-body text-sm text-gray-600 italic border-l-4 border-natif-cyan pl-4">
                    &ldquo;Đổi mới công nghệ là động lực quan trọng nhất cho sự phát triển bền vững của doanh nghiệp Việt Nam trong kỷ nguyên số hóa.&rdquo;
                    <cite className="block text-xs text-gray-400 mt-2 not-italic">— GS.TS. Nguyễn Văn Minh, Giám đốc Quỹ</cite>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TIMELINE ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-natif-green/10 text-natif-green text-xs">HÀNH TRÌNH</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                Hành trình Tự chủ của NATIF
              </h2>
              <p className="text-gray-500">13 năm kiến tạo hệ sinh thái đổi mới quốc gia</p>
            </div>
            <div className="relative">
              <div className="absolute left-[18px] sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-natif-blue via-natif-cyan to-natif-green" />
              <div className="space-y-10">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-6 sm:gap-0">
                    <div className="absolute left-[10px] sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow z-10 flex items-center justify-center"
                      style={{ backgroundColor: item.color }}>
                      <div className="text-white" style={{ color: 'white' }}>{item.icon}</div>
                    </div>
                    <div className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] animate-fade-in-up ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}
                      style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="inline-block font-heading font-black text-2xl mb-1" style={{ color: item.color }}>{item.year}</div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DEPARTMENTS ─────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="badge bg-purple-100 text-purple-700 text-xs">CƠ CẤU TỔ CHỨC</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
                7 Phòng ban — Một đội ngũ
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Đội ngũ chuyên môn của NATIF được tổ chức theo mô hình tinh gọn, hiệu quả, phục vụ trực tiếp cho hoạt động hỗ trợ doanh nghiệp và đổi mới công nghệ.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {departments.map((dept, i) => (
                <div key={i}
                  className={`card group ${dept.bgColor} ${dept.borderColor} border-t-4 hover:shadow-lg transition-all duration-300 cursor-default animate-fade-in-up`}
                  style={{ animationDelay: `${i * 60}ms`, borderTopColor: dept.color }}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${dept.bgColor} border ${dept.borderColor} group-hover:scale-110 transition-transform flex-shrink-0`}
                      style={{ borderColor: dept.color }}>
                      <div style={{ color: dept.color }}>{dept.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-gray-900 group-hover:text-gray-700 transition-colors">{dept.name}</h3>
                      <p className="text-xs font-semibold mb-2" style={{ color: dept.color }}>{dept.tagline}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{dept.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUTONOMY MODEL ───────────────────────────────────────────────── */}
        <section className="py-20 bg-gov-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='30' cy='30' r='1' fill='%23ffffff' fill-opacity='0.3'/%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff' fill-opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='1' fill='%23ffffff' fill-opacity='0.2'/%3E%3Ccircle cx='10' cy='50' r='1' fill='%23ffffff' fill-opacity='0.15'/%3E%3Ccircle cx='50' cy='10' r='1' fill='%23ffffff' fill-opacity='0.15'/%3E%3C/svg%3E")`,
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
                Từ 2026, NATIF vận hành theo mô hình tự chủ — kết hợp ngân sách nhà nước cấp với thu nhập từ hoạt động sự nghiệp, đảm bảo hiệu quả và bền vững lâu dài.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {autonomyPillars.map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-heading font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs font-semibold text-natif-cyan mb-3">{item.stat}</p>
                  <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            {/* Financial highlight */}
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Ngân sách 2026', value: '382.16 tỷ đồng', note: 'Quỹ chi quản lý 7%' },
                { label: 'Đầu tư IT 2026–2030', value: '70 tỷ đồng', note: 'HPC, AI, hạ tầng số' },
                { label: 'Nhóm tự chủ', value: 'Nhóm 2', note: 'Tự bảo đảm chi thường xuyên' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <div className="text-xs text-white/50 mb-1">{item.label}</div>
                  <div className="font-heading font-black text-lg text-white">{item.value}</div>
                  <div className="text-xs text-natif-cyan mt-1">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIGITAL TRANSFORMATION ─────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="badge bg-sky-100 text-sky-700 text-xs">CHUYỂN ĐỔI SỐ</span>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-5">
                  Hạ tầng Số — Tương lai Công nghệ
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  NATIF đầu tư 70 tỷ đồng cho chuyển đổi số giai đoạn 2026–2030, hướng tới xây dựng nền tảng công nghệ tiên tiến phục vụ nghiên cứu và quản lý.
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Trung tâm HPC', value: '35 tỷ', desc: 'Máy tính hiệu năng cao phục vụ nghiên cứu' },
                    { label: 'Phần mềm & Nền tảng', value: '25 tỷ', desc: 'Hệ thống quản lý trực tuyến, AI' },
                    { label: 'Hạ tầng & An ninh', value: '10 tỷ', desc: 'Trung tâm dữ liệu, bảo mật thông tin' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-sm text-gray-800">{item.label}</span>
                          <span className="text-xs font-bold text-natif-blue bg-natif-blue/10 px-2 py-0.5 rounded-full">{item.value}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <DigitalBlocks />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-heading font-black text-5xl text-natif-blue mb-1">70<span className="text-3xl"> tỷ</span></div>
                      <div className="text-sm text-gray-500">Đầu tư 2026–2030</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROGRAMS ───────────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="badge bg-natif-cyan/10 text-natif-cyan text-xs">HỖ TRỢ</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mt-3">
                4 Chương trình tài trợ toàn diện
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {programs.map((p, i) => (
                <Link key={i} href={p.href}
                  className="card group border-t-4 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    borderTopColor: p.color === 'blue' ? '#3b82f6' : p.color === 'green' ? '#22c55e' : p.color === 'cyan' ? '#06b6d4' : '#f59e0b',
                  }}>
                  <div className="mb-3" style={{ color: p.color === 'blue' ? '#3b82f6' : p.color === 'green' ? '#22c55e' : p.color === 'cyan' ? '#06b6d4' : '#f59e0b' }}>
                    {p.icon}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-gray-900 mb-0.5 group-hover:text-natif-blue transition-colors">{p.title}</h3>
                  <p className="text-xs font-medium text-gray-400 mb-3">{p.short}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="badge bg-natif-blue/10 text-natif-blue text-xs">LIÊN HỆ</span>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-6">
                  Sẵn sàng đồng hành cùng bạn
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
                  Đăng ký tài khoản và nộp hồ sơ trực tuyến. Đội ngũ chuyên viên hỗ trợ xuyên suốt quá trình.
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
