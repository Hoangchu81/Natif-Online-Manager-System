'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatDate, formatCurrency, PROGRAM_LABELS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { SimpleWorkflowBadge } from '@/components/WorkflowTimeline';

interface App {
  id: string;
  title: string;
  company_name: string;
  tax_code: string;
  program_type: string;
  budget_requested: number;
  status: string;
  created_at: string;
  submitted_at?: string;
  user_name?: string;
  user_email?: string;
}

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
  const [applications, setApplications] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [filterStatus, setFilterStatus] = useState('submitted');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const apps: App[] = (data.data || []).filter((a: App) =>
          ['submitted', 'received', 'director_review'].includes(a.status)
        );
        setApplications(apps);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'clerk' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'clerk' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const transition = async (appId: string, toStatus: string, extra: Record<string, unknown> = {}) => {
    setActionLoading(appId);
    try {
      const res = await authFetch(`${API_BASE}/api/workflow/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, to_status: toStatus, ...extra }),
      });
      if (res.ok) {
        fetchData();
        setSelectedApp(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally { setActionLoading(null); }
  };

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

  const stats = {
    submitted: applications.filter(a => a.status === 'submitted').length,
    received: applications.filter(a => a.status === 'received').length,
    director_review: applications.filter(a => a.status === 'director_review').length,
  };

  return (
    <DashboardShell
      title="Văn thư — Tiếp nhận Hồ sơ"
      role="clerk"
      navItems={navItems}
      activeHref="/clerk"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'submitted' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-500 mt-1">Đã nộp, chờ tiếp nhận</div>
          </button>
          <button
            onClick={() => setFilterStatus('received')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'received' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-indigo-600">{stats.received}</div>
            <div className="text-sm text-gray-500 mt-1">Đã tiếp nhận, chờ giao Lãnh đạo</div>
          </button>
          <button
            onClick={() => setFilterStatus('director_review')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'director_review' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-purple-600">{stats.director_review}</div>
            <div className="text-sm text-gray-500 mt-1">Đã giao Lãnh đạo</div>
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên công ty, MST, tiêu đề..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input flex-1"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hồ sơ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Doanh nghiệp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Chương trình</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Ngân sách</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngày nộp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có hồ sơ</td></tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <div>{app.company_name}</div>
                      <div className="text-xs text-gray-400">{app.tax_code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{PROGRAM_LABELS[app.program_type] || app.program_type}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">
                      {formatCurrency(app.budget_requested)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      {app.status === 'submitted' && (
                        <button
                          onClick={() => transition(app.id, 'received')}
                          disabled={actionLoading === app.id}
                          className="btn-primary py-1 px-3 text-xs disabled:opacity-50"
                        >
                          {actionLoading === app.id ? '...' : 'Tiếp nhận'}
                        </button>
                      )}
                      {app.status === 'received' && (
                        <button
                          onClick={() => transition(app.id, 'director_review')}
                          disabled={actionLoading === app.id}
                          className="btn-primary py-1 px-3 text-xs disabled:opacity-50"
                        >
                          {actionLoading === app.id ? '...' : 'Giao Lãnh đạo'}
                        </button>
                      )}
                      {app.status === 'director_review' && (
                        <span className="text-xs text-gray-400">Đã giao</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedApp(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">Chi tiết hồ sơ</h3>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Tiêu đề hồ sơ</div>
                  <div className="font-semibold text-gray-900">{selectedApp.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Doanh nghiệp</div>
                    <div className="font-medium">{selectedApp.company_name}</div>
                    <div className="text-xs text-gray-400">MST: {selectedApp.tax_code}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Chương trình</div>
                    <div>{PROGRAM_LABELS[selectedApp.program_type] || selectedApp.program_type}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Ngân sách đề nghị</div>
                    <div className="font-semibold">{formatCurrency(selectedApp.budget_requested)}đ</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ngày nộp</div>
                    <div>{formatDate(selectedApp.submitted_at || selectedApp.created_at)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">Tiến độ</div>
                  <SimpleWorkflowBadge currentStatus={selectedApp.status} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Trạng thái hiện tại</div>
                  <StatusBadge status={selectedApp.status} className="mt-1" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                {selectedApp.status === 'submitted' && (
                  <button
                    onClick={() => transition(selectedApp.id, 'received')}
                    disabled={actionLoading === selectedApp.id}
                    className="btn-primary disabled:opacity-50"
                  >
                    Tiếp nhận
                  </button>
                )}
                {selectedApp.status === 'received' && (
                  <button
                    onClick={() => transition(selectedApp.id, 'director_review')}
                    disabled={actionLoading === selectedApp.id}
                    className="btn-primary disabled:opacity-50"
                  >
                    Giao Lãnh đạo xem xét
                  </button>
                )}
                {selectedApp.status === 'director_review' && (
                  <span className="text-sm text-gray-500">Đã giao cho Lãnh đạo. Đang chờ phân phòng.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
