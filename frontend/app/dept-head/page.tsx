'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatCurrency } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { ApplicationRow } from '@/components/ApplicationsTable';
import ReviewModal from '@/components/ReviewModal';

const navItems = [
  {
    label: 'Hồ sơ cần duyệt',
    href: '/dept-head',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DeptHeadPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const apps: ApplicationRow[] = data.data || [];
        setApplications(apps);
        setStats({
          pending: apps.filter((a: ApplicationRow) => a.status === 'summarized').length,
          approved: apps.filter((a: ApplicationRow) => a.status === 'dept_approved').length,
          rejected: apps.filter((a: ApplicationRow) => a.status === 'dept_rejected').length,
        });
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'dept_head' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'dept_head' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const pending = applications.filter((a: ApplicationRow) => a.status === 'summarized');
  const filtered = pending.filter(app => {
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
      title="Trưởng phòng — Phê duyệt Cấp phòng"
      role="dept_head"
      navItems={navItems}
      activeHref="/dept-head"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-teal-600">{stats.pending}</div>
            <div className="text-sm text-gray-500 mt-1">Chờ duyệt cấp phòng</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-cyan-600">{stats.approved}</div>
            <div className="text-sm text-gray-500 mt-1">Đã duyệt cấp phòng</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500 mt-1">Từ chối cấp phòng</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                applications
                  .filter((a: ApplicationRow) => a.status === 'dept_approved')
                  .reduce((sum: number, a: ApplicationRow) => sum + (a.budget_requested || 0), 0)
              )}đ
            </div>
            <div className="text-sm text-gray-500 mt-1">Tổng kinh phí đã duyệt</div>
          </div>
        </div>

        <ApplicationsTable
          applications={filtered}
          loading={loading}
          emptyMessage="Không có hồ sơ chờ duyệt cấp phòng"
          searchValue={search}
          onSearchChange={setSearch}
          showWorkflowProgress
          onRowClick={setSelectedApp}
        />

        {selectedApp && (
          <ReviewModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            onAction={fetchData}
            showReviewSection
            showWorkflowHistory
            actions={[
              { label: 'Duyệt cấp phòng', status: 'dept_approved', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'Từ chối', status: 'dept_rejected', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              { label: 'Trả lại bổ sung', status: 'returned', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
            ]}
          />
        )}
      </div>
    </DashboardShell>
  );
}
