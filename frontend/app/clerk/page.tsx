'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { ApplicationRow } from '@/components/ApplicationsTable';
import ReviewModal from '@/components/ReviewModal';

const CLERK_STATUSES = ['submitted', 'received'];

const navItems = [
  {
    label: 'Hồ sơ tiếp nhận',
    href: '/clerk',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function ClerkPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [filterStatus, setFilterStatus] = useState('submitted');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const apps: ApplicationRow[] = (data.data || []).filter((a: ApplicationRow) =>
          CLERK_STATUSES.includes(a.status)
        );
        setApplications(apps);
        const s: Record<string, number> = {};
        for (const st of CLERK_STATUSES) {
          s[st] = apps.filter((a: ApplicationRow) => a.status === st).length;
        }
        setStats(s);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'clerk' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'clerk' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const filtered = applications.filter(app => {
    if (filterStatus && app.status !== filterStatus) return false;
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
      title="Văn thư — Tiếp nhận Hồ sơ"
      role="clerk"
      navItems={navItems}
      activeHref="/clerk"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'submitted'
                ? 'border-natif-blue ring-2 ring-natif-blue/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-blue-600">{stats['submitted'] || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Đã nộp, chờ tiếp nhận</div>
          </button>
          <button
            onClick={() => setFilterStatus('received')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'received'
                ? 'border-natif-blue ring-2 ring-natif-blue/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-indigo-600">{stats['received'] || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Đã tiếp nhận, chờ phân công</div>
          </button>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">{(stats['submitted'] || 0) + (stats['received'] || 0)}</div>
            <div className="text-sm text-gray-500 mt-1">Tổng hồ sơ</div>
          </div>
        </div>

        <ApplicationsTable
          applications={filtered}
          loading={loading}
          emptyMessage="Không có hồ sơ"
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={setSelectedApp}
        />

        {selectedApp && (
          <ReviewModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            onAction={fetchData}
            showWorkflowHistory
            actions={(() => {
              if (selectedApp.status === 'submitted') {
                return [{ label: 'Tiếp nhận', status: 'received', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' }];
              }
              if (selectedApp.status === 'received') {
                return [{ label: 'Phân công chuyên viên', status: 'assigned', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }];
              }
              return [];
            })()}
          />
        )}
      </div>
    </DashboardShell>
  );
}
