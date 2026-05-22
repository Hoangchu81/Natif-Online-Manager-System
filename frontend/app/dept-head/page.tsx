'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatDate, formatCurrency, PROGRAM_LABELS, SCENARIO_LABELS, SCENARIO_COLORS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
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
  director_decision_notes?: string;
  officer_id?: string;
  officer_name?: string;
  user_name?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

const navItems = [
  {
    label: 'Hồ sơ cần xử lý',
    href: '/dept-head',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Hội đồng tư vấn',
    href: '/councils',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

type Tab = 'dept_assigned' | 'preliminary_review' | 'action_taken' | 'council_evaluation' | 'summarized';

export default function DeptHeadPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<App[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dept_assigned');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [proposalNotes, setProposalNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, officerRes] = await Promise.all([
        authFetch(`${API_BASE}/api/applications?limit=100`),
        authFetch(`${API_BASE}/api/auth/users?role=officer`).catch(() => null),
      ]);
      if (appRes.ok) {
        const data = await appRes.json();
        setApplications(data.data || []);
      }
      if (officerRes?.ok) {
        const data = await officerRes.json();
        setOfficers(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'dept_head' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'dept_head' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

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
        setSelectedOfficer('');
        setProposalNotes('');
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally { setActionLoading(false); }
  };

  const filtered = applications.filter(app => {
    if (app.status !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.company_name?.toLowerCase().includes(q) ||
      app.tax_code?.toLowerCase().includes(q) ||
      app.title.toLowerCase().includes(q)
    );
  });

  const stats = {
    dept_assigned: applications.filter(a => a.status === 'dept_assigned').length,
    preliminary_review: applications.filter(a => a.status === 'preliminary_review').length,
    action_taken: applications.filter(a => a.status === 'action_taken').length,
    council_evaluation: applications.filter(a => a.status === 'council_evaluation').length,
    summarized: applications.filter(a => a.status === 'summarized').length,
  };

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: 'dept_assigned', label: 'Chờ phân công', color: 'text-violet-600' },
    { key: 'preliminary_review', label: 'Đề xuất', color: 'text-amber-600' },
    { key: 'action_taken', label: 'Thực hiện HĐ', color: 'text-orange-600' },
    { key: 'council_evaluation', label: 'HĐ đánh giá', color: 'text-cyan-600' },
    { key: 'summarized', label: 'Chờ duyệt', color: 'text-emerald-600' },
  ];

  return (
    <DashboardShell
      title="Trưởng phòng — Quản lý Hồ sơ"
      role="dept_head"
      navItems={navItems}
      activeHref="/dept-head"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-natif-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={activeTab === tab.key ? '' : tab.color}>
                {stats[tab.key]}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không có hồ sơ</td></tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.title}</div>
                      <div className="text-xs text-gray-400">{PROGRAM_LABELS[app.program_type] || app.program_type}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <div>{app.company_name}</div>
                      <div className="text-xs text-gray-400">{app.tax_code}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{formatCurrency(app.budget_requested)}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(app.submitted_at || app.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedApp(app)} className="btn-primary py-1 px-3 text-xs">
                        Xử lý
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setSelectedApp(null); setSelectedOfficer(''); setProposalNotes(''); }}>
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">{activeTab === 'dept_assigned' ? 'Phân công Chuyên viên' : 'Chi tiết & Thao tác'}</h3>
                <button onClick={() => { setSelectedApp(null); setSelectedOfficer(''); setProposalNotes(''); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Hồ sơ</div>
                    <div className="font-semibold text-gray-900">{selectedApp.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Doanh nghiệp</div>
                    <div>{selectedApp.company_name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Ngân sách</div>
                    <div className="font-semibold">{formatCurrency(selectedApp.budget_requested)}đ</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ngày nộp</div>
                    <div>{formatDate(selectedApp.submitted_at || selectedApp.created_at)}</div>
                  </div>
                </div>
                <SimpleWorkflowBadge currentStatus={selectedApp.status} />

                {/* Step 1: Assign officer */}
                {selectedApp.status === 'dept_assigned' && (
                  <div className="bg-violet-50 rounded-xl p-4 space-y-3 border border-violet-200">
                    <h4 className="font-semibold text-gray-800">Giao Chuyên viên xét sơ bộ</h4>
                    <select
                      value={selectedOfficer}
                      onChange={e => setSelectedOfficer(e.target.value)}
                      className="form-input w-full"
                    >
                      <option value="">— Chọn Chuyên viên —</option>
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => transition(selectedApp.id, 'preliminary_review', { officer_id: selectedOfficer })}
                      disabled={!selectedOfficer || actionLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {actionLoading ? 'Đang gửi...' : 'Giao xét sơ bộ'}
                    </button>
                  </div>
                )}

                {/* Step 2: Approve proposal */}
                {selectedApp.status === 'preliminary_review' && (
                  <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-200">
                    <h4 className="font-semibold text-gray-800">Đề xuất của Chuyên viên</h4>
                    {selectedApp.scenario && (
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${SCENARIO_COLORS[selectedApp.scenario] || ''}`}>
                        {SCENARIO_LABELS[selectedApp.scenario] || selectedApp.scenario}
                      </div>
                    )}
                    {selectedApp.proposal_notes && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApp.proposal_notes}</p>
                    )}
                    <textarea
                      placeholder="Ghi nhận ý kiến của Trưởng phòng về đề xuất (hoặc điều chỉnh)..."
                      value={proposalNotes}
                      onChange={e => setProposalNotes(e.target.value)}
                      rows={3}
                      className="form-input text-sm w-full"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => transition(selectedApp.id, 'action_taken', { proposal_notes: proposalNotes })}
                        disabled={actionLoading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {actionLoading ? '...' : 'Gửi Lãnh đạo Quỹ quyết định'}
                      </button>
                      <button
                        onClick={() => transition(selectedApp.id, 'returned', { notes: proposalNotes })}
                        disabled={actionLoading}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Trả lại
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Execute action */}
                {selectedApp.status === 'action_taken' && (
                  <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-200">
                    <h4 className="font-semibold text-gray-800">Thực hiện theo quyết định của Lãnh đạo</h4>
                    {selectedApp.scenario && (
                      <div>
                        <div className="text-xs text-gray-500">Phương án đã duyệt:</div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${SCENARIO_COLORS[selectedApp.scenario] || ''}`}>
                          {SCENARIO_LABELS[selectedApp.scenario] || selectedApp.scenario}
                        </div>
                      </div>
                    )}
                    {selectedApp.director_decision_notes && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApp.director_decision_notes}</p>
                    )}
                    {selectedApp.scenario === 'council' && (
                      <p className="text-sm text-gray-600">Hồ sơ sẽ chuyển sang giai đoạn Hội đồng đánh giá. Vui lòng thành lập Hội đồng trong trang quản lý Hội đồng.</p>
                    )}
                    {selectedApp.scenario === 'survey' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Hồ sơ đang chờ hoàn thành khảo sát thực tế. Sau khi khảo sát xong:</p>
                        <button
                          onClick={() => transition(selectedApp.id, 'council_evaluation')}
                          disabled={actionLoading}
                          className="btn-primary disabled:opacity-50"
                        >
                          {actionLoading ? '...' : 'Hoàn thành khảo sát → Chuyển HĐ đánh giá'}
                        </button>
                      </div>
                    )}
                    {selectedApp.scenario === 'supplementary' && (
                      <p className="text-sm text-gray-600">Đã gửi yêu cầu bổ sung cho doanh nghiệp. Hồ sơ sẽ quay lại sau khi doanh nghiệp bổ sung đầy đủ.</p>
                    )}
                    {selectedApp.scenario === 'reject' && (
                      <p className="text-sm text-gray-600">Hồ sơ đã bị loại theo quyết định của Lãnh đạo.</p>
                    )}
                  </div>
                )}

                {/* Step 4: Council evaluation in progress */}
                {selectedApp.status === 'council_evaluation' && (
                  <div className="bg-cyan-50 rounded-xl p-4 space-y-3 border border-cyan-200">
                    <h4 className="font-semibold text-gray-800">Hội đồng đang đánh giá</h4>
                    <p className="text-sm text-gray-600">Hồ sơ đang được Hội đồng tư vấn đánh giá. Sau khi Hội đồng họp xong, Chuyên viên sẽ tổng hợp kết quả.</p>
                    <a href="/councils" className="text-sm text-natif-blue hover:underline">Quản lý Hội đồng →</a>
                  </div>
                )}

                {/* Step 5: Approve summarized */}
                {selectedApp.status === 'summarized' && (
                  <div className="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-200">
                    <h4 className="font-semibold text-gray-800">Tổng hợp của Chuyên viên</h4>
                    <textarea
                      placeholder="Ý kiến của Trưởng phòng về kết quả tổng hợp..."
                      value={proposalNotes}
                      onChange={e => setProposalNotes(e.target.value)}
                      rows={3}
                      className="form-input text-sm w-full"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => transition(selectedApp.id, 'dept_approved', { notes: proposalNotes })}
                        disabled={actionLoading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {actionLoading ? '...' : 'Duyệt cấp phòng'}
                      </button>
                      <button
                        onClick={() => transition(selectedApp.id, 'returned', { notes: proposalNotes })}
                        disabled={actionLoading}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Trả lại chỉnh sửa
                      </button>
                    </div>
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
