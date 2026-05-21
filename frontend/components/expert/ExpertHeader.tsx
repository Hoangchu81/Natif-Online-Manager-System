'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function ExpertHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="h-16 bg-natif-blue text-white flex items-center justify-between px-6 shadow-sm">
      <div>
        <div className="text-lg font-heading font-bold">HỆ THỐNG QUẢN LÝ TRỰC TUYẾN NATIF</div>
        <div className="text-xs text-white/75">Cổng chuyên gia phản biện</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold">{user?.full_name || 'Chuyên gia'}</div>
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
  );
}
