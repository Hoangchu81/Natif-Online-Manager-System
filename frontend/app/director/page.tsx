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
  dept_head_id?: string;
  dept_head_name?: string;
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
    href: '/director',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

type Tab = 'director_review' | 'action_taken' | 'dept_approved' | 'approved';

export default function DirectorPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<App[]>([]);
  const [deptHeads, setDeptHeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('director_review');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDeptHead, setSelectedDeptHead] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, deptRes] = await Promise.all([
        authFetch(`${API_BASE}/api/applications?limit=100`),
        authFetch(`${API_BASE}/api/auth/users?role=dept_head`).catch(() => null),
      ]);
      if (appRes.ok) {
        const data = await appRes.json();
        setApplications(data.data || []);
      }
      if (deptRes?.ok) {
        const data = await deptRes.json();
        setDeptHeads(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'director' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'director' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

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
        setSelectedDeptHead('');
        setDecisionNotes('');
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
    director_review: applications.filter(a => a.status === 'director_review').length,
    action_taken: applications.filter(a => a.status === 'action_taken').length,
    dept_approved: applications.filter(a => a.status === 'dept_approved').length,
    approved: applications.filter(a => a.status === 'approved').length,
  };

  const approvedBudget = applications
    .filter(a => a.status === 'approved')
    .reduce((s, a) => s + (a.budget_requested || 0), 0);

  const programBreakdown = applications
    .filter(a => a.status === 'approved')
    .reduce<Record<string, number>>((acc, a) => {
      acc[a.program_type] = (acc[a.program_type] || 0) + 1;
      return acc;
    }, {});

  const tabs: { key: Tab; label: string }[] = [
    { key: 'director_review', label: 'Chờ phân phòng' },
    { key: 'action_taken', label: 'Quyết định phương án' },
    { key: 'dept_approved', label: 'Duyệt cuối' },
    { key: 'approved', label: 'Đã phê duyệt' },
  ];

  return (
    <DashboardShell
      title="Lãnh đạo Quỹ — Phê duyệt Cuối cùng"
      role="director"
      navItems={navItems}
      activeHref="/director"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`bg-white rounded-xl border p-5 text-left transition-all ${
                activeTab === tab.key ? 'border-natif-blue ring-2 ring-natif-blue/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl font-bold text-gray-900">{stats[tab.key]}</div>
              <div className="text-sm text-gray-500 mt-1">{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Approved budget */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-natif-blue">{formatCurrency(approvedBudget)}đ</div>
          <div className="text-sm text-gray-500 mt-1">Tổng kinh phí đã phê duyệt</div>
          {Object.keys(programBreakdown).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(programBreakdown).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{PROGRAM_LABELS[type] || type}</span>
                  <span className="bg-natif-blue text-white text-xs px-2 py-0.5 rounded-full font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
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
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Phòng ban</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngân sách</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngày nộp</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có hồ sơ</td></tr>
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
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {app.dept_head_name || <span className="text-gray-400 italic">Chưa phân</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-right hidden lg:table-cell">
                      {formatCurrency(app.budget_requested)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
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

        {/* Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setSelectedApp(null); setSelectedDeptHead(''); setDecisionNotes(''); }}>
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">Chi tiết & Thao tác</h3>
                <button onClick={() => { setSelectedApp(null); setSelectedDeptHead(''); setDecisionNotes(''); }} className="text-gray-400 hover:text-gray-600">
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
                    <div className="text-xs text-gray-500">Phòng ban</div>
                    <div>{selectedApp.dept_head_name || <span className="text-gray-400 italic">Chưa phân</span>}</div>
                  </div>
                </div>
                <SimpleWorkflowBadge currentStatus={selectedApp.status} />

                {/* Assign dept_head */}
                {selectedApp.status === 'director_review' && (
                  <div className="bg-purple-50 rounded-xl p-4 space-y-3 border border-purple-200">
                    <h4 className="font-semibold text-gray-800">Phân công Trưởng phòng</h4>
                    <select
                      value={selectedDeptHead}
                      onChange={e => setSelectedDeptHead(e.target.value)}
                      className="form-input w-full"
                    >
                      <option value="">— Chọn Trưởng phòng —</option>
                      {deptHeads.map(d => (
                        <option key={d.id} value={d.id}>{d.full_name} ({d.email})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => transition(selectedApp.id, 'dept_assigned', { dept_head_id: selectedDeptHead })}
                      disabled={!selectedDeptHead || actionLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {actionLoading ? '...' : 'Phân phòng xử lý'}
                    </button>
                  </div>
                )}

                {/* Decide on scenario */}
                {selectedApp.status === 'action_taken' && (
                  <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-200">
                    <h4 className="font-semibold text-gray-800">Quyết định phương án xét duyệt</h4>
                    {selectedApp.scenario && (
                      <div>
                        <div className="text-xs text-gray-500">Đề xuất của Trưởng phòng:</div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${SCENARIO_COLORS[selectedApp.scenario] || ''}`}>
                          {SCENARIO_LABELS[selectedApp.scenario] || selectedApp.scenario}
                        </div>
                      </div>
                    )}
                    {selectedApp.proposal_notes && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded p-2">{selectedApp.proposal_notes}</p>
                    )}
                    <textarea
                      placeholder="Quyết định và ghi nhận ý kiến của Lãnh đạo Quỹ..."
                      value={decisionNotes}
                      onChange={e => setDecisionNotes(e.target.value)}
                      rows={3}
                      className="form-input text-sm w-full"
                    />
                    <div className="space-y-2">
                      {[
                        { to: 'council_evaluation', label: 'Đồng ý lập Hội đồng tư vấn', color: 'bg-purple-600 text-white hover:bg-purple-700' },
                        { to: 'survey_conducted', label: 'Đồng ý đi khảo sát thực tế', color: 'bg-teal-600 text-white hover:bg-teal-700' },
                        { to: 'supplementary_requested', label: 'Yêu cầu bổ sung hồ sơ', color: 'bg-amber-600 text-white hover:bg-amber-700' },
                        { to: 'rejected', label: 'Loại hồ sơ', color: 'bg-red-600 text-white hover:bg-red-700' },
                      ].map(opt => (
                        <button
                          key={opt.to}
                          onClick={() => transition(selectedApp.id, opt.to, { director_decision_notes: decisionNotes })}
                          disabled={actionLoading}
                          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${opt.color}`}
                        >
                          {actionLoading ? '...' : opt.label}
                        </button>
                      ))}
                      <button
                        onClick={() => transition(selectedApp.id, 'returned', { notes: decisionNotes })}
                        disabled={actionLoading}
                        className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Trả lại
                      </button>
                    </div>
                  </div>
                )}

                {/* Final approval */}
                {selectedApp.status === 'dept_approved' && (
                  <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-200">
                    <h4 className="font-semibold text-gray-800">Phê duyệt cuối cùng</h4>
                    <p className="text-sm text-gray-600">Trưởng phòng đã duyệt. Nhấn "Phê duyệt" để hoàn tất quy trình.</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => transition(selectedApp.id, 'approved')}
                        disabled={actionLoading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {actionLoading ? '...' : 'Phê duyệt cuối cùng'}
                      </button>
                      <button
                        onClick={() => transition(selectedApp.id, 'returned', { notes: 'Yêu cầu xem xét lại' })}
                        disabled={actionLoading}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Trả lại
                      </button>
                    </div>
                  </div>
                )}

                {selectedApp.status === 'approved' && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-700">Đã phê duyệt</h4>
                    <p className="text-sm text-gray-600 mt-1">Hồ sơ đã được phê duyệt cuối cùng.</p>
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
