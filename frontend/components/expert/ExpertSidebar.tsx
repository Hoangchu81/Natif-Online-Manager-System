'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/expert/profile', label: 'Thông tin cá nhân' },
  { href: '/expert/education', label: 'Quá trình đào tạo' },
  { href: '/expert/work-history', label: 'Quá trình công tác' },
  { href: '/expert/research', label: 'Đề tài nghiên cứu' },
  { href: '/expert/publications', label: 'Công bố khoa học' },
  { href: '/expert/patents', label: 'Bằng sáng chế/giải pháp hữu ích' },
  { href: '/expert/awards', label: 'Giải thưởng' },
  { href: '/expert/books', label: 'Sách chuyên khảo đã xuất bản' },
  { href: '/expert/complete', label: 'Hoàn thành và xuất lý lịch' },
];

export default function ExpertSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/expert" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-natif-blue flex items-center justify-center">
            <span className="font-heading font-extrabold text-white text-xs">NT</span>
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-gray-900">Lý lịch khoa học</div>
            <div className="text-xs text-gray-500">NATIF OMS</div>
          </div>
        </Link>
      </div>
      <nav className="p-3 space-y-1">
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-natif-blue/10 text-natif-blue font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
