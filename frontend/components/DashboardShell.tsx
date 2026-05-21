'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/dashboard';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  role: string;
  navItems: NavItem[];
  activeHref?: string;
}

export default function DashboardShell({
  children,
  title,
  role,
  navItems,
  activeHref,
}: DashboardShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const roleColor = ROLE_COLORS[role] || 'bg-gray-100 text-gray-700';
  const roleLabel = ROLE_LABELS[role] || role;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-200">
          <div className="w-11 h-11 rounded-xl bg-natif-blue flex items-center justify-center shrink-0">
            <span className="font-heading font-extrabold text-white text-sm">NT</span>
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-sm text-gray-900 truncate">NATIF OMS</div>
            <div className="text-[10px] text-gray-500">Quỹ ĐMCCNQG</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColor}`}>
            {roleLabel}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-4 space-y-1">
          {navItems.map(item => {
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-natif-blue text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="shrink-0 w-5 h-5">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 mb-3 px-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Xem trang chủ
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="font-heading font-bold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">Hệ thống Quản lý Trực tuyến NATIF</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{user?.full_name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
