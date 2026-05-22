'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatDate, formatCurrency, PROGRAM_LABELS, STATUS_LABELS } from '@/lib/dashboard';
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
  scenario?: string;
  proposal_notes?: string;
  officer_name?: string;
  dept_head_name?: string;
  user_name?: string;
}

const navItems = [
  {
    label: 'Hồ sơ cần xử lý',
    href: '/officer',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function OfficerPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [filterStatus, setFilterStatus] = useState('preliminary_review');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [proposalNotes, setProposalNotes] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [synthesizeNotes, setSynthesizeNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/applications?my_assignments=true&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'officer' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'officer' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const transition = async (appId: string, toStatus: string, extra: Record<string, unknown> = {}) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/workflow/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, to_status: toStatus, ...extra }),
      });
      if (res.ok) {
        fetchData();
        setSelectedApp(null);
        setSelectedScenario('');
        setProposalNotes('');
        setSynthesizeNotes('');
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally { setActionLoading(false); }
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
    preliminary_review: applications.filter(a => a.status === 'preliminary_review').length,
    action_taken: applications.filter(a => a.status === 'action_taken').length,
    council_evaluation: applications.filter(a => a.status === 'council_evaluation').length,
    summarized: applications.filter(a => a.status === 'summarized').length,
  };

  return (
    <DashboardShell
      title="Chuyên viên — Xét Sơ bộ Hồ sơ"
      role="officer"
      navItems={navItems}
      activeHref="/officer"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setFilterStatus('preliminary_review')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'preliminary_review' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-amber-600">{stats.preliminary_review}</div>
            <div className="text-sm text-gray-500 mt-1">Chờ xét sơ bộ</div>
          </button>
          <button
            onClick={() => setFilterStatus('action_taken')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'action_taken' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-orange-600">{stats.action_taken}</div>
            <div className="text-sm text-gray-500 mt-1">Đã đề xuất</div>
          </button>
          <button
            onClick={() => setFilterStatus('council_evaluation')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'council_evaluation' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-cyan-600">{stats.council_evaluation}</div>
            <div className="text-sm text-gray-500 mt-1">HĐ đánh giá</div>
          </button>
          <button
            onClick={() => setFilterStatus('summarized')}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filterStatus === 'summarized' ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl font-bold text-emerald-600">{stats.summarized}</div>
            <div className="text-sm text-gray-500 mt-1">Đã tổng hợp</div>
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Tìm theo tên công ty, MST, tiêu đề..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input w-full"
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hồ sơ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Doanh nghiệp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngân sách</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngày nộp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có hồ sơ cần xử lý</td></tr>
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
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {formatCurrency(app.budget_requested)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-natif-blue hover:underline text-xs"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail + Action modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setSelectedApp(null); setSelectedScenario(''); setProposalNotes(''); setSynthesizeNotes(''); }}>
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">Chi tiết & Thao tác</h3>
                <button onClick={() => { setSelectedApp(null); setSelectedScenario(''); setProposalNotes(''); setSynthesizeNotes(''); }} className="text-gray-400 hover:text-gray-600">
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

                {/* Officer action: Submit proposal */}
                {selectedApp.status === 'preliminary_review' && (
                  <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-200">
                    <h4 className="font-semibold text-gray-800">Đề xuất phương án xét duyệt</h4>
                    <p className="text-xs text-gray-600">Theo Nghị định 268/2025, sau khi xét sơ bộ, Chuyên viên đề xuất một trong 4 phương án:</p>
                    <div className="space-y-2">
                      {[
                        { value: 'council', label: 'Lập Hội đồng tư vấn (7-9 thành viên)' },
                        { value: 'survey', label: 'Đi khảo sát thực tế' },
                        { value: 'supplementary', label: 'Yêu cầu doanh nghiệp bổ sung hồ sơ' },
                        { value: 'reject', label: 'Loại hồ sơ (không đủ điều kiện)' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedScenario === opt.value ? 'bg-amber-100' : 'hover:bg-amber-50'}`}>
                          <input
                            type="radio"
                            name="scenario"
                            value={opt.value}
                            checked={selectedScenario === opt.value}
                            onChange={() => setSelectedScenario(opt.value)}
                          />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Ghi nhận kết quả xét sơ bộ và lý do đề xuất phương án..."
                      value={proposalNotes}
                      onChange={e => setProposalNotes(e.target.value)}
                      rows={4}
                      className="form-input text-sm w-full"
                    />
                    <button
                      onClick={() => transition(selectedApp.id, 'action_taken', {
                        scenario: selectedScenario,
                        proposal_notes: proposalNotes,
                      })}
                      disabled={!selectedScenario || actionLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {actionLoading ? 'Đang gửi...' : 'Gửi đề xuất cho Trưởng phòng'}
                    </button>
                  </div>
                )}

                {/* Show proposal info */}
                {selectedApp.status === 'action_taken' && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h4 className="font-semibold text-gray-800">Đã gửi đề xuất</h4>
                    {selectedApp.scenario && (
                      <p className="text-sm text-gray-600 mt-1">
                        Phương án: <span className="font-medium">{selectedApp.scenario === 'council' ? 'Lập Hội đồng tư vấn' : selectedApp.scenario === 'survey' ? 'Đi khảo sát thực tế' : selectedApp.scenario === 'supplementary' ? 'Yêu cầu bổ sung hồ sơ' : 'Loại hồ sơ'}</span>
                      </p>
                    )}
                    {selectedApp.proposal_notes && (
                      <p className="text-sm text-gray-600 mt-1">{selectedApp.proposal_notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Đang chờ Lãnh đạo Quỹ quyết định phương án...</p>
                  </div>
                )}

                {/* Council evaluation: Synthesize */}
                {selectedApp.status === 'council_evaluation' && (
                  <div className="bg-cyan-50 rounded-xl p-4 space-y-3 border border-cyan-200">
                    <h4 className="font-semibold text-gray-800">Tổng hợp kết quả Hội đồng tư vấn</h4>
                    <textarea
                      placeholder="Tổng hợp kết quả đánh giá của Hội đồng tư vấn: điểm mạnh, điểm yếu, khuyến nghị..."
                      value={synthesizeNotes}
                      onChange={e => setSynthesizeNotes(e.target.value)}
                      rows={4}
                      className="form-input text-sm w-full"
                    />
                    <button
                      onClick={() => transition(selectedApp.id, 'summarized', { notes: synthesizeNotes })}
                      disabled={actionLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {actionLoading ? 'Đang gửi...' : 'Gửi tổng hợp cho Trưởng phòng'}
                    </button>
                  </div>
                )}

                {selectedApp.status === 'summarized' && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-700">Đã tổng hợp</h4>
                    <p className="text-sm text-gray-600 mt-1">Hồ sơ đang chờ Trưởng phòng và Lãnh đạo Quỹ phê duyệt.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
