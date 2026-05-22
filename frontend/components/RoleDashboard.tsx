'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

interface RoleDashboardProps {
  title: string;
  description: string;
  role: string;
  actions: string[];
}

export default function RoleDashboard({ title, description, role, actions }: RoleDashboardProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== role && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, role, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  if (user?.role !== role && user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-natif-warm-bg">
      <header className="h-16 bg-natif-dark text-white flex items-center justify-between px-6 shadow-header">
        <div>
          <div className="text-lg font-heading font-bold">HỆ THỐNG QUẢN LÝ TRỰC TUYẾN NATIF</div>
          <div className="text-xs text-white/60">{title}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.full_name}</div>
            <div className="text-xs text-white/75">{user?.email}</div>
          </div>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="border border-white/30 rounded-lg px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {actions.map(action => (
            <div key={action} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-10 h-10 rounded-xl bg-natif-blue/10 text-natif-blue flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 text-sm">{action}</div>
              <div className="text-xs text-gray-500 mt-1">Đang phát triển</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Giao diện cơ bản đã sẵn sàng. Các chức năng chi tiết sẽ được triển khai theo luồng xử lý hồ sơ.
          </p>
        </div>
      </main>
    </div>
  );
}
