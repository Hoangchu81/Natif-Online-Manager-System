'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ExpertSidebar from '@/components/expert/ExpertSidebar';
import ExpertHeader from '@/components/expert/ExpertHeader';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  const { isExpert, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isExpert) router.push('/login');
  }, [isLoading, isExpert, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  if (!isExpert) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ExpertHeader />
      <div className="flex">
        <ExpertSidebar />
        <main className="flex-1 min-w-0 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
