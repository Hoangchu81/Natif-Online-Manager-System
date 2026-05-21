'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatCurrency, PROGRAM_LABELS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { ApplicationRow } from '@/components/ApplicationsTable';
import ReviewModal from '@/components/ReviewModal';

const navItems = [
  {
    label: 'Hồ sơ cần duyệt',
    href: '/director',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

export default function DirectorPage() {
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
    if (!isLoading && user?.role !== 'director' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'director' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const pending = applications.filter((a: ApplicationRow) => a.status === 'dept_approved');
  const approved = applications.filter((a: ApplicationRow) => a.status === 'approved');
  const rejected = applications.filter((a: ApplicationRow) => a.status === 'rejected');

  const approvedBudget = approved.reduce((s: number, a: ApplicationRow) => s + (a.budget_requested || 0), 0);

  // Program breakdown for approved
  const programBreakdown = approved.reduce<Record<string, number>>((acc, a: ApplicationRow) => {
    acc[a.program_type] = (acc[a.program_type] || 0) + 1;
    return acc;
  }, {});

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
      title="Lãnh đạo Quỹ — Phê duyệt Cuối cùng"
      role="director"
      navItems={navItems}
      activeHref="/director"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-cyan-600">{pending.length}</div>
            <div className="text-sm text-gray-500 mt-1">Chờ phê duyệt</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{approved.length}</div>
            <div className="text-sm text-gray-500 mt-1">Đã phê duyệt</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-red-600">{rejected.length}</div>
            <div className="text-sm text-gray-500 mt-1">Từ chối</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
            <div className="text-2xl font-bold text-natif-blue">{formatCurrency(approvedBudget)}đ</div>
            <div className="text-sm text-gray-500 mt-1">Tổng kinh phí đã duyệt</div>
          </div>
        </div>

        {/* Program breakdown */}
        {Object.keys(programBreakdown).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3">Phân bổ theo chương trình (đã duyệt)</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(programBreakdown).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{PROGRAM_LABELS[type] || type}</span>
                  <span className="bg-natif-blue text-white text-xs px-2 py-0.5 rounded-full font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <ApplicationsTable
          applications={filtered}
          loading={loading}
          emptyMessage="Không có hồ sơ chờ phê duyệt"
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
              { label: 'Phê duyệt', status: 'approved', color: 'bg-green-600 text-white hover:bg-green-700' },
              { label: 'Từ chối', status: 'rejected', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              { label: 'Trả lại bổ sung', status: 'returned', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
            ]}
          />
        )}
      </div>
    </DashboardShell>
  );
}
