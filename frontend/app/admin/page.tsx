'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import DashboardShell from '@/components/DashboardShell';
import ApplicationsTable, { type ApplicationRow } from '@/components/ApplicationsTable';
import { authFetch } from '@/lib/auth';
import { formatCurrency, formatDate, PROGRAM_LABELS, STATUS_LABELS } from '@/lib/dashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Stats {
  total_applications: number;
  pending_review: number;
  approved: number;
  rejected: number;
  total_approved_budget?: number;
  total_disbursed_estimate?: number;
}

interface Application extends ApplicationRow {
  user_id: string;
  contact_phone: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

const navItems = [
  {
    label: 'Tổng quan',
    href: '/admin',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    label: 'Người dùng',
    href: '/admin/users',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm6 4a3 3 0 100-6" />
      </svg>
    ),
  },
  {
    label: 'Tin tức',
    href: '/admin/news',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Báo cáo',
    href: '/admin/reports',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6m4 6V7m4 10v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Menu',
    href: '/admin/menu',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

const WORKFLOW_FILTERS = [
  ['draft', 'Nháp'],
  ['submitted', 'Đã nộp'],
  ['received', 'Đã tiếp nhận'],
  ['director_review', 'Lãnh đạo xem xét'],
  ['dept_assigned', 'Đã phân phòng'],
  ['preliminary_review', 'Xét sơ bộ'],
  ['action_taken', 'Đã quyết định'],
  ['supplementary_requested', 'Yêu cầu bổ sung'],
  ['survey_conducted', 'Đã khảo sát'],
  ['council_evaluation', 'Hội đồng đánh giá'],
  ['summarized', 'Đã tổng hợp'],
  ['dept_approved', 'Phòng duyệt'],
  ['approved', 'Đã phê duyệt'],
  ['rejected', 'Từ chối'],
  ['returned', 'Trả lại'],
];

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterProgram) params.set('program_type', filterProgram);
      params.set('limit', '100');

      const [statsRes, appsRes] = await Promise.all([
        authFetch(`${API_BASE}/api/dashboard/stats`),
        authFetch(`${API_BASE}/api/applications?${params}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || data.data || data);
      }
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProgram]);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/login');
  }, [isLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const filteredApps = applications.filter(app => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.company_name?.toLowerCase().includes(q) ||
      app.contact_name?.toLowerCase().includes(q) ||
      app.title?.toLowerCase().includes(q) ||
      app.tax_code?.toLowerCase().includes(q)
    );
  });

  if (isLoading || !isAdmin) return null;

  return (
    <DashboardShell title="Quản trị NATIF" role="admin" navItems={navItems} activeHref="/admin">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Tổng hồ sơ</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_applications}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Chờ xử lý</div>
              <div className="text-3xl font-bold text-amber-600">{stats.pending_review}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Đã phê duyệt</div>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Từ chối/Trả lại</div>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </div>
          </div>
        )}

        <ApplicationsTable
          applications={filteredApps}
          loading={loading}
          showWorkflowProgress
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={app => setSelectedApp(app as Application)}
          emptyMessage="Không có hồ sơ nào"
          extraFilters={(
            <>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input w-auto">
                <option value="">Tất cả trạng thái</option>
                {WORKFLOW_FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="form-input w-auto">
                <option value="">Tất cả chương trình</option>
                <option value="interest_subsidy">Hỗ trợ lãi suất</option>
                <option value="sponsorship">Tài trợ, đặt hàng</option>
                <option value="voucher">Hỗ trợ voucher</option>
                <option value="ecosystem">Hệ sinh thái</option>
              </select>
              <button onClick={() => fetchData()} className="btn-secondary py-2">Làm mới</button>
            </>
          )}
        />
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-heading font-bold text-lg text-gray-900">Chi tiết hồ sơ</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="badge badge-admin">{STATUS_LABELS[selectedApp.status] || selectedApp.status}</span>
                <span className="text-sm text-gray-500">Mã hồ sơ: <span className="font-mono text-gray-700">#{selectedApp.id.slice(0, 8)}</span></span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Thông tin doanh nghiệp</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Tên:</span> <span className="font-medium text-gray-900">{selectedApp.company_name}</span></div>
                  <div><span className="text-gray-500">MST:</span> <span className="font-medium text-gray-900">{selectedApp.tax_code}</span></div>
                  <div><span className="text-gray-500">Người liên hệ:</span> <span className="font-medium text-gray-900">{selectedApp.contact_name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{selectedApp.contact_email}</span></div>
                  {selectedApp.contact_phone && <div><span className="text-gray-500">Điện thoại:</span> <span className="font-medium text-gray-900">{selectedApp.contact_phone}</span></div>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Thông tin chương trình</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Chương trình:</span> <span className="font-medium text-gray-900">{PROGRAM_LABELS[selectedApp.program_type] || selectedApp.program_type}</span></div>
                  <div><span className="text-gray-500">Số tiền yêu cầu:</span> <span className="font-semibold text-natif-blue">{formatCurrency(selectedApp.budget_requested)} VNĐ</span></div>
                  <div><span className="text-gray-500">Ngày nộp:</span> <span className="font-medium text-gray-900">{formatDate(selectedApp.submitted_at || selectedApp.created_at)}</span></div>
                  {selectedApp.reviewed_at && <div><span className="text-gray-500">Ngày xét duyệt:</span> <span className="font-medium text-gray-900">{formatDate(selectedApp.reviewed_at)}</span></div>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-heading font-semibold text-sm text-gray-700">Dự án / Nhiệm vụ</h3>
                <div className="text-sm"><span className="text-gray-500">Tên dự án:</span> <span className="font-medium text-gray-900">{selectedApp.title}</span></div>
                {selectedApp.description && <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-6">{selectedApp.description}</p>}
              </div>

              {selectedApp.reviewer_notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-amber-800 mb-1">Ghi chú xét duyệt</div>
                  <p className="text-sm text-amber-900 whitespace-pre-line">{selectedApp.reviewer_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
