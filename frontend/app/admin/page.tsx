'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Stats {
  total_applications: number;
  pending_review: number;
  approved: number;
  rejected: number;
  total_approved_budget: number;
  total_disbursed_estimate: number;
}

interface Application {
  id: string;
  user_id: string;
  program_type: string;
  company_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  title: string;
  description: string;
  budget_requested: number;
  status: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const PROGRAM_LABELS: Record<string, string> = {
  interest_subsidy: 'Hỗ trợ lãi suất',
  sponsorship: 'Tài trợ, đặt hàng',
  voucher: 'Hỗ trợ voucher',
  ecosystem: 'Hệ sinh thái',
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Nháp', badge: 'badge-gray' },
  submitted: { label: 'Đã nộp', badge: 'badge-blue' },
  reviewing: { label: 'Đang xét duyệt', badge: 'badge-amber' },
  approved: { label: 'Đã phê duyệt', badge: 'badge-green' },
  rejected: { label: 'Từ chối', badge: 'badge-red' },
};

function formatCurrency(num: number) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + ' triệu';
  return num.toLocaleString('vi-VN');
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminPage() {
  const { isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterProgram) params.set('program_type', filterProgram);
      params.set('limit', '50');

      const [statsRes, appsRes] = await Promise.all([
        authFetch(`${API_BASE}/api/dashboard/stats`),
        authFetch(`${API_BASE}/api/applications?${params}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || data);
      }
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProgram]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isLoading, isAdmin, router]);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin, fetchData]);

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

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, reviewer_notes: reviewNotes }),
      });
      if (res.ok) {
        setSelectedApp(null);
        setReviewNotes('');
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const programBadgeColor = (type: string) => {
    switch (type) {
      case 'interest_subsidy': return 'badge-blue';
      case 'sponsorship': return 'badge-green';
      case 'voucher': return 'badge-cyan';
      case 'ecosystem': return 'badge-amber';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-natif-blue flex items-center justify-center">
                <span className="font-heading font-extrabold text-white text-sm">NT</span>
              </div>
              <div>
                <h1 className="font-heading font-bold text-gray-900">Quản trị NATIF</h1>
                <p className="text-xs text-gray-500">Hệ thống Quản lý Trực tuyến</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Xem trang chủ</Link>
              <button onClick={() => { logout(); router.push('/login'); }} className="text-sm text-red-600 hover:text-red-700">Đăng xuất</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Tổng hồ sơ</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_applications}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Chờ xét duyệt</div>
              <div className="text-3xl font-bold text-amber-600">{stats.pending_review}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Đã phê duyệt</div>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Đã từ chối</div>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, MST, dự án..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input flex-1 min-w-[200px]"
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input w-auto">
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="submitted">Đã nộp</option>
              <option value="reviewing">Đang xét duyệt</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="form-input w-auto">
              <option value="">Tất cả chương trình</option>
              <option value="interest_subsidy">Hỗ trợ lãi suất</option>
              <option value="sponsorship">Tài trợ, đặt hàng</option>
              <option value="voucher">Hỗ trợ voucher</option>
              <option value="ecosystem">Hệ sinh thái</option>
            </select>
            <button onClick={() => fetchData()} className="btn-secondary py-2">
              Làm mới
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">STT</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Doanh nghiệp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Chương trình</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dự án</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày nộp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      Không có hồ sơ nào
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{app.company_name}</div>
                        <div className="text-xs text-gray-500">{app.tax_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${programBadgeColor(app.program_type)}`}>
                          {PROGRAM_LABELS[app.program_type] || app.program_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-[200px] truncate">{app.title}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(app.budget_requested)}đ
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_LABELS[app.status]?.badge || 'badge-gray'}`}>
                          {STATUS_LABELS[app.status]?.label || app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(app.submitted_at || app.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setSelectedApp(app); setReviewNotes(app.reviewer_notes || ''); }}
                          className="text-sm text-natif-blue hover:underline">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
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
              {/* Status bar */}
              <div className="flex items-center justify-between">
                <span className={`badge ${STATUS_LABELS[selectedApp.status]?.badge || 'badge-gray'}`}>
                  {STATUS_LABELS[selectedApp.status]?.label || selectedApp.status}
                </span>
                <span className="text-sm text-gray-500">
                  Mã hồ sơ: <span className="font-mono text-gray-700">#{selectedApp.id.slice(0, 8)}</span>
                </span>
              </div>

              {/* Company info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Thông tin doanh nghiệp</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Tên:</span> <span className="font-medium text-gray-900">{selectedApp.company_name}</span></div>
                  <div><span className="text-gray-500">MST:</span> <span className="font-medium text-gray-900">{selectedApp.tax_code}</span></div>
                  <div><span className="text-gray-500">Người liên hệ:</span> <span className="font-medium text-gray-900">{selectedApp.contact_name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{selectedApp.contact_email}</span></div>
                  {selectedApp.contact_phone && <div><span className="text-gray-500">Điện thoại:</span> <span className="font-medium text-gray-900">{selectedApp.contact_phone}</span></div>}
                </div>
              </div>

              {/* Program info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Thông tin chương trình</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Chương trình:</span> <span className="font-medium text-gray-900">{PROGRAM_LABELS[selectedApp.program_type]}</span></div>
                  <div><span className="text-gray-500">Số tiền yêu cầu:</span> <span className="font-semibold text-natif-blue">{formatCurrency(selectedApp.budget_requested)} VNĐ</span></div>
                  <div><span className="text-gray-500">Ngày nộp:</span> <span className="font-medium text-gray-900">{formatDate(selectedApp.submitted_at || selectedApp.created_at)}</span></div>
                  {selectedApp.reviewed_at && <div><span className="text-gray-500">Ngày xét duyệt:</span> <span className="font-medium text-gray-900">{formatDate(selectedApp.reviewed_at)}</span></div>}
                </div>
              </div>

              {/* Project info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Dự án / Nhiệm vụ</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-500">Tên dự án:</span> <span className="font-medium text-gray-900">{selectedApp.title}</span></div>
                  {selectedApp.description && (() => {
                    try {
                      const desc = JSON.parse(selectedApp.description);
                      return (
                        <>
                          {desc.project_objectives && (
                            <div><span className="text-gray-500">Mục tiêu:</span>
                              <p className="text-gray-900 mt-0.5 whitespace-pre-line">{desc.project_objectives}</p>
                            </div>
                          )}
                          {desc.project_content && (
                            <div><span className="text-gray-500">Nội dung:</span>
                              <p className="text-gray-900 mt-0.5 whitespace-pre-line">{desc.project_content}</p>
                            </div>
                          )}
                          {desc.expected_results && (
                            <div><span className="text-gray-500">Kết quả dự kiến:</span>
                              <p className="text-gray-900 mt-0.5 whitespace-pre-line">{desc.expected_results}</p>
                            </div>
                          )}
                          {desc.budget_breakdown && (
                            <div><span className="text-gray-500">Dự toán:</span>
                              <p className="text-gray-900 mt-0.5 whitespace-pre-line">{desc.budget_breakdown}</p>
                            </div>
                          )}
                          {desc.loan_amount && (
                            <div><span className="text-gray-500">Số tiền vay:</span> <span className="font-medium text-gray-900">{formatCurrency(Number(desc.loan_amount))} VNĐ</span></div>
                          )}
                          {desc.bank_name && (
                            <div><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium text-gray-900">{desc.bank_name} {desc.bank_branch ? `(${desc.bank_branch})` : ''}</span></div>
                          )}
                        </>
                      );
                    } catch {
                      return <div><span className="text-gray-500">Mô tả:</span> <span className="text-gray-900">{selectedApp.description}</span></div>;
                    }
                  })()}
                </div>
              </div>

              {/* Reviewer notes */}
              {selectedApp.reviewer_notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-amber-800 mb-1">Ghi chú xét duyệt</div>
                  <p className="text-sm text-amber-900 whitespace-pre-line">{selectedApp.reviewer_notes}</p>
                </div>
              )}

              {/* Reviewer actions */}
              {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-heading font-semibold text-sm text-gray-700">Xét duyệt hồ sơ</h3>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    className="form-input resize-none text-sm"
                    placeholder="Nhập ghi chú xét duyệt (không bắt buộc)..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selectedApp.id, 'reviewing')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-4 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm hover:bg-amber-100 disabled:opacity-50 transition-colors">
                      Đang xét duyệt
                    </button>
                    <button
                      onClick={() => handleAction(selectedApp.id, 'approved')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-4 bg-green-50 text-green-700 rounded-lg font-medium text-sm hover:bg-green-100 disabled:opacity-50 transition-colors">
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleAction(selectedApp.id, 'rejected')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-4 bg-red-50 text-red-700 rounded-lg font-medium text-sm hover:bg-red-100 disabled:opacity-50 transition-colors">
                      Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
