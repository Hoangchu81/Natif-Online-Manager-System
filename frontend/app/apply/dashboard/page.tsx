'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  scenario?: string;
  created_at: string;
  submitted_at?: string;
  officer_name?: string;
  dept_head_name?: string;
  council_name?: string;
  reviewer_notes?: string;
}

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
  const [applications, setApplications] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [search, setSearch] = useState('');
  const [supplementNote, setSupplementNote] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const submitSupplement = async (appId: string) => {
    setUploading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/workflow/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: appId,
          to_status: 'preliminary_review',
          notes: supplementNote,
        }),
      });
      if (res.ok) {
        fetchData();
        setSelectedApp(null);
        setSupplementNote('');
      } else {
        const err = await res.json();
        alert(err.error || 'Gửi thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally { setUploading(false); }
  };

  const filtered = applications.filter(app => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.company_name?.toLowerCase().includes(q) ||
      app.tax_code?.toLowerCase().includes(q) ||
      app.title.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: applications.length,
    drafts: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => ['submitted', 'received', 'director_review', 'dept_assigned', 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized', 'dept_approved'].includes(a.status)).length,
    supplementary: applications.filter(a => a.status === 'supplementary_requested').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

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
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">Tổng hồ sơ</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-400">{stats.drafts}</div>
            <div className="text-sm text-gray-500 mt-1">Bản nháp</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-500 mt-1">Đang xét duyệt</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500 mt-1">Đã phê duyệt</div>
          </div>
        </div>

        {/* Supplementary alert */}
        {stats.supplementary > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-semibold text-amber-800">Có {stats.supplementary} hồ sơ cần bổ sung!</div>
              <div className="text-sm text-amber-700 mt-0.5">Nhấn vào hồ sơ để xem chi tiết và gửi bổ sung.</div>
            </div>
          </div>
        )}

        {/* Workflow timeline legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-heading font-semibold text-sm text-gray-700 mb-3">Quy trình xử lý hồ sơ</h3>
          <p className="text-xs text-gray-500 mb-3">Theo Nghị định 268/2025/NĐ-CP: Thời hạn xét duyệt 30 ngày, phê duyệt 10 ngày, thẩm định kinh phí 10 ngày.</p>
          <div className="overflow-x-auto">
            <div className="flex items-center gap-0 min-w-[800px]">
              {[
                { step: 'Nháp', color: 'bg-gray-300', textColor: 'text-gray-500' },
                { step: 'Đã nộp', color: 'bg-blue-500', textColor: 'text-blue-600' },
                { step: 'Tiếp nhận', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
                { step: 'Lãnh đạo', color: 'bg-purple-400', textColor: 'text-purple-600' },
                { step: 'Phân phòng', color: 'bg-violet-400', textColor: 'text-violet-600' },
                { step: 'Xét sơ bộ', color: 'bg-amber-400', textColor: 'text-amber-600' },
                { step: 'Quyết định', color: 'bg-orange-400', textColor: 'text-orange-600' },
                { step: 'HĐ đánh giá', color: 'bg-cyan-400', textColor: 'text-cyan-600' },
                { step: 'Tổng hợp', color: 'bg-emerald-400', textColor: 'text-emerald-600' },
                { step: 'Phê duyệt', color: 'bg-green-500', textColor: 'text-green-600' },
              ].map((item, idx, arr) => (
                <div key={item.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                    <span className={`text-[10px] mt-1.5 whitespace-nowrap font-medium ${item.textColor}`}>{item.step}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="h-0.5 w-6 bg-gray-200 mx-0.5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Tìm theo tên dự án, MST..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input w-full"
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dự án</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Chương trình</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngân sách</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngày nộp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  Bạn chưa có hồ sơ nào.{' '}
                  <Link href="/apply" className="text-natif-blue hover:underline">Nộp hồ sơ mới →</Link>
                </td></tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.title}</div>
                      <div className="text-xs text-gray-400">{app.company_name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {PROGRAM_LABELS[app.program_type] || app.program_type}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">
                      {formatCurrency(app.budget_requested)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedApp(app)} className="text-natif-blue hover:underline text-xs">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setSelectedApp(null); setSupplementNote(''); }}>
            <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">Chi tiết hồ sơ</h3>
                <button onClick={() => { setSelectedApp(null); setSupplementNote(''); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Dự án</div>
                  <div className="font-semibold text-gray-900">{selectedApp.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Chương trình</div>
                    <div>{PROGRAM_LABELS[selectedApp.program_type] || selectedApp.program_type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ngân sách</div>
                    <div className="font-semibold">{formatCurrency(selectedApp.budget_requested)}đ</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">Tiến độ</div>
                  <SimpleWorkflowBadge currentStatus={selectedApp.status} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Trạng thái</div>
                  <StatusBadge status={selectedApp.status} className="mt-1" />
                </div>
                {selectedApp.reviewer_notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Phản hồi:</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApp.reviewer_notes}</p>
                  </div>
                )}

                {/* Supplementary upload */}
                {selectedApp.status === 'supplementary_requested' && (
                  <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-200">
                    <h4 className="font-semibold text-amber-800">Yêu cầu bổ sung hồ sơ</h4>
                    <p className="text-sm text-amber-700">Vui lòng bổ sung các giấy tờ theo yêu cầu và gửi lại để tiếp tục xét duyệt.</p>
                    <textarea
                      placeholder="Mô tả các giấy tờ đã bổ sung..."
                      value={supplementNote}
                      onChange={e => setSupplementNote(e.target.value)}
                      rows={3}
                      className="form-input text-sm w-full"
                    />
                    <button
                      onClick={() => submitSupplement(selectedApp.id)}
                      disabled={uploading || !supplementNote.trim()}
                      className="btn-primary disabled:opacity-50"
                    >
                      {uploading ? 'Đang gửi...' : 'Gửi bổ sung'}
                    </button>
                  </div>
                )}

                {selectedApp.status === 'draft' && (
                  <Link href={`/apply?edit=${selectedApp.id}`} className="btn-primary w-full text-center block">
                    Chỉnh sửa hồ sơ
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Theo dõi tiến độ xử lý hồ sơ của bạn.{' '}
            <a href="tel:0913060581" className="text-natif-blue">Liên hệ: 0913.060.581</a>
          </p>
          <Link href="/apply" className="btn-primary">
            Nộp hồ sơ mới
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
