'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { ApplicationRow } from '@/components/ApplicationsTable';
import ReviewModal from '@/components/ReviewModal';

const navItems = [
  {
    label: 'Hồ sơ của tôi',
    href: '/apply/dashboard',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Nộp hồ sơ mới',
    href: '/apply',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export default function EnterpriseDashboard() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const drafts = applications.filter((a: ApplicationRow) => a.status === 'draft');
  const submitted = applications.filter((a: ApplicationRow) =>
    ['submitted', 'received', 'assigned', 'preliminary_review', 'expert_review', 'summarized', 'dept_approved'].includes(a.status)
  );
  const completed = applications.filter((a: ApplicationRow) =>
    ['approved', 'rejected', 'returned'].includes(a.status)
  );

  const filtered = applications.filter(app => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.company_name?.toLowerCase().includes(q) ||
      app.tax_code?.toLowerCase().includes(q) ||
      app.title?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell
      title="Doanh nghiệp — Theo dõi Hồ sơ"
      role="enterprise"
      navItems={navItems}
      activeHref="/apply/dashboard"
    >
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-500 mt-1">Tổng hồ sơ</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-400">{drafts.length}</div>
            <div className="text-sm text-gray-500 mt-1">Bản nháp</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">{submitted.length}</div>
            <div className="text-sm text-gray-500 mt-1">Đang xét duyệt</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{completed.filter((a: ApplicationRow) => a.status === 'approved').length}</div>
            <div className="text-sm text-gray-500 mt-1">Đã phê duyệt</div>
          </div>
        </div>

        {/* Workflow legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3">Quy trình xử lý hồ sơ</h3>
          <div className="overflow-x-auto">
            <div className="flex items-center gap-0 min-w-[700px]">
              {[
                { step: 'Nháp', color: 'bg-gray-300', textColor: 'text-gray-500' },
                { step: 'Đã nộp', color: 'bg-blue-500', textColor: 'text-blue-600' },
                { step: 'Tiếp nhận', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
                { step: 'Phân công', color: 'bg-purple-400', textColor: 'text-purple-600' },
                { step: 'Sơ bộ', color: 'bg-amber-400', textColor: 'text-amber-600' },
                { step: 'Chuyên gia', color: 'bg-orange-400', textColor: 'text-orange-600' },
                { step: 'Tổng hợp', color: 'bg-teal-400', textColor: 'text-teal-600' },
                { step: 'Phòng duyệt', color: 'bg-cyan-400', textColor: 'text-cyan-600' },
                { step: 'Phê duyệt', color: 'bg-green-500', textColor: 'text-green-600' },
              ].map((item, idx, arr) => (
                <>
                  <div key={item.step} className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} shrink-0`} />
                    <span className={`text-[10px] mt-1.5 whitespace-nowrap font-medium ${item.textColor}`}>{item.step}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="h-0.5 w-6 bg-gray-200 mx-0.5 shrink-0" />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <ApplicationsTable
          applications={filtered}
          loading={loading}
          emptyMessage="Bạn chưa có hồ sơ nào"
          searchValue={search}
          onSearchChange={setSearch}
          showWorkflowProgress
          onRowClick={setSelectedApp}
          searchPlaceholder="Tìm kiếm dự án, MST..."
        />

        {/* Quick actions */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Theo dõi tiến độ xử lý hồ sơ của bạn. Thông tin cập nhật sẽ được gửi qua email.
          </p>
          <Link href="/apply" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nộp hồ sơ mới
          </Link>
        </div>

        {selectedApp && (
          <ReviewModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            showReviewSection
            showWorkflowHistory
          />
        )}
      </div>
    </DashboardShell>
  );
}
