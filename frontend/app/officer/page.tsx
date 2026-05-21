'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { ApplicationRow } from '@/components/ApplicationsTable';
import ReviewModal from '@/components/ReviewModal';

const OFFICER_STATUSES = ['assigned', 'preliminary_review', 'expert_review', 'summarized'];

const navItems = [
  {
    label: 'Hồ sơ cần xử lý',
    href: '/officer',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export default function OfficerPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const apps: ApplicationRow[] = (data.data || []).filter((a: ApplicationRow) =>
          OFFICER_STATUSES.includes(a.status)
        );
        setApplications(apps);
        const s: Record<string, number> = {};
        for (const st of OFFICER_STATUSES) {
          s[st] = apps.filter((a: ApplicationRow) => a.status === st).length;
        }
        setStats(s);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'officer' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'officer' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

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

  const statCards = [
    { label: 'Chờ sơ bộ', status: 'assigned', color: 'text-purple-600' },
    { label: 'Đang sơ bộ', status: 'preliminary_review', color: 'text-amber-600' },
    { label: 'Chuyên gia đánh giá', status: 'expert_review', color: 'text-orange-600' },
    { label: 'Đã tổng hợp', status: 'summarized', color: 'text-teal-600' },
  ];

  return (
    <DashboardShell
      title="Chuyên viên — Xử lý Hồ sơ"
      role="officer"
      navItems={navItems}
      activeHref="/officer"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(card => (
            <button
              key={card.status}
              onClick={() => setFilterStatus(card.status)}
              className={`bg-white rounded-xl border p-5 text-left transition-all ${
                filterStatus === card.status
                  ? 'border-natif-blue ring-2 ring-natif-blue/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`text-3xl font-bold ${card.color}`}>{stats[card.status] || 0}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </button>
          ))}
        </div>

        <ApplicationsTable
          applications={filtered}
          loading={loading}
          emptyMessage="Không có hồ sơ cần xử lý"
          searchValue={search}
          onSearchChange={setSearch}
          showWorkflowProgress
          onRowClick={setSelectedApp}
          searchPlaceholder="Tìm kiếm doanh nghiệp, MST, dự án..."
        />

        {selectedApp && (
          <ReviewModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            onAction={fetchData}
            showReviewSection
            showWorkflowHistory
            actions={(() => {
              if (selectedApp.status === 'assigned') {
                return [{ label: 'Bắt đầu sơ bộ', status: 'preliminary_review', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' }];
              }
              if (selectedApp.status === 'preliminary_review') {
                return [
                  { label: 'Gửi chuyên gia', status: 'expert_review', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'Trả lại', status: 'returned', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
                ];
              }
              if (selectedApp.status === 'expert_review') {
                return [
                  { label: 'Tổng hợp & Gửi phòng', status: 'summarized', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                  { label: 'Trả lại', status: 'returned', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
                ];
              }
              return [];
            })()}
          />
        )}
      </div>
    </DashboardShell>
  );
}
