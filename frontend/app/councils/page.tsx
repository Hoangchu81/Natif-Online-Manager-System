'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatDate } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

interface CouncilMember {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  expert_name?: string;
  expert_email?: string;
  role: string;
  responsibility?: string;
  created_at: string;
}

interface CouncilMeeting {
  id: string;
  meeting_date?: string;
  meeting_location?: string;
  attendees?: string;
  discussion_summary?: string;
  recommendation?: string;
  recommendation_notes?: string;
  created_by_name?: string;
  created_at: string;
}

interface Council {
  id: string;
  application_id: string;
  name?: string;
  evaluation_deadline?: string;
  formed_at?: string;
  notes?: string;
  application_title?: string;
  company_name?: string;
  member_count?: number;
  members?: CouncilMember[];
  meetings?: CouncilMeeting[];
}

interface App {
  id: string;
  title: string;
  company_name: string;
  program_type: string;
  status: string;
}

const ROLE_LABELS: Record<string, string> = {
  chairman: 'Chủ tịch',
  member: 'Thành viên',
  secretary: 'Thư ký',
  enterprise_rep: 'Đại diện DN',
};

const ROLE_COLORS: Record<string, string> = {
  chairman: 'bg-purple-100 text-purple-700',
  member: 'bg-blue-100 text-blue-700',
  secretary: 'bg-amber-100 text-amber-700',
  enterprise_rep: 'bg-green-100 text-green-700',
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  approve: 'Đồng ý',
  reject: 'Từ chối',
  revise: 'Yêu cầu sửa đổi',
  defer: 'Tạm hoãn',
};

const navItems = [
  {
    label: 'Quản lý Hội đồng',
    href: '/councils',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function CouncilsPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [councils, setCouncils] = useState<Council[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [newCouncil, setNewCouncil] = useState({ application_id: '', name: '', evaluation_deadline: '', notes: '' });
  const [newMember, setNewMember] = useState({ user_id: '', expert_name: '', expert_email: '', role: 'member', responsibility: '' });
  const [newMeeting, setNewMeeting] = useState({ meeting_date: '', meeting_location: '', attendees: '', discussion_summary: '', recommendation: '', recommendation_notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [councilRes, appRes] = await Promise.all([
        authFetch(`${API_BASE}/api/councils`),
        authFetch(`${API_BASE}/api/applications?status=council_evaluation&limit=100`),
      ]);
      if (councilRes.ok) {
        const data = await councilRes.json();
        setCouncils(data.data || []);
      }
      if (appRes.ok) {
        const data = await appRes.json();
        setApps(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'dept_head' && user?.role !== 'director' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const createCouncil = async () => {
    if (!newCouncil.application_id) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/councils`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCouncil),
      });
      if (res.ok) {
        fetchData();
        setShowCreate(false);
        setNewCouncil({ application_id: '', name: '', evaluation_deadline: '', notes: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Tạo thất bại');
      }
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const addMember = async (councilId: string) => {
    if (!newMember.role) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/councils/${councilId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (res.ok) {
        loadCouncil(councilId);
        setNewMember({ user_id: '', expert_name: '', expert_email: '', role: 'member', responsibility: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Thêm thất bại');
      }
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const removeMember = async (memberId: string, councilId: string) => {
    if (!confirm('Xóa thành viên này?')) return;
    setActionLoading(true);
    try {
      await authFetch(`${API_BASE}/api/council-members/${memberId}`, { method: 'DELETE' });
      loadCouncil(councilId);
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const addMeeting = async (councilId: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/councils/${councilId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMeeting, application_id: selectedCouncil?.application_id }),
      });
      if (res.ok) {
        loadCouncil(councilId);
        setNewMeeting({ meeting_date: '', meeting_location: '', attendees: '', discussion_summary: '', recommendation: '', recommendation_notes: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Thêm thất bại');
      }
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const loadCouncil = async (councilId: string) => {
    const res = await authFetch(`${API_BASE}/api/councils/${councilId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedCouncil(data);
    }
  };

  const availableApps = apps.filter(a => !councils.find(c => c.application_id === a.id));

  return (
    <DashboardShell
      title="Quản lý Hội đồng Tư vấn"
      role="dept_head"
      navItems={navItems}
      activeHref="/councils"
    >
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Danh sách Hội đồng</h2>
            <p className="text-sm text-gray-500">Thành lập và quản lý Hội đồng tư vấn theo Nghị định 268/2025</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            + Thành lập Hội đồng
          </button>
        </div>

        {/* Council list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Đang tải...</div>
          ) : councils.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Chưa có Hội đồng nào.{' '}
              <button onClick={() => setShowCreate(true)} className="text-natif-blue hover:underline">Thành lập ngay →</button>
            </div>
          ) : (
            councils.map(council => (
              <div key={council.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => loadCouncil(council.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                        HĐ
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">{council.name || 'Hội đồng tư vấn'}</div>
                        <div className="text-sm text-gray-500">{council.application_title} — {council.company_name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{council.member_count || 0} thành viên</div>
                      {council.evaluation_deadline && (
                        <div className="text-xs text-gray-400">Hạn: {formatDate(council.evaluation_deadline)}</div>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create council modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-gray-900">Thành lập Hội đồng</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="form-label">Hồ sơ áp dụng <span className="text-red-500">*</span></label>
                  <select
                    value={newCouncil.application_id}
                    onChange={e => setNewCouncil(c => ({ ...c, application_id: e.target.value }))}
                    className="form-input w-full"
                  >
                    <option value="">— Chọn hồ sơ —</option>
                    {availableApps.map(a => (
                      <option key={a.id} value={a.id}>{a.title} — {a.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tên Hội đồng</label>
                  <input
                    type="text"
                    value={newCouncil.name}
                    onChange={e => setNewCouncil(c => ({ ...c, name: e.target.value }))}
                    placeholder="Hội đồng tư vấn thẩm định số 1/2026"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Hạn đánh giá</label>
                  <input
                    type="date"
                    value={newCouncil.evaluation_deadline}
                    onChange={e => setNewCouncil(c => ({ ...c, evaluation_deadline: e.target.value }))}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    value={newCouncil.notes}
                    onChange={e => setNewCouncil(c => ({ ...c, notes: e.target.value }))}
                    rows={2}
                    className="form-input w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={createCouncil} disabled={actionLoading || !newCouncil.application_id} className="btn-primary disabled:opacity-50">
                    {actionLoading ? '...' : 'Thành lập'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="btn-secondary">Hủy</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Council detail modal */}
        {selectedCouncil && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedCouncil(null)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-gray-900">{selectedCouncil.name || 'Hội đồng tư vấn'}</h3>
                  <p className="text-sm text-gray-500">{selectedCouncil.application_title} — {selectedCouncil.company_name}</p>
                </div>
                <button onClick={() => setSelectedCouncil(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Thành viên Hội đồng ({selectedCouncil.members?.length || 0})</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {selectedCouncil.members?.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Chưa có thành viên</p>
                    )}
                    {selectedCouncil.members?.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {(m.user_name || m.expert_name || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{m.user_name || m.expert_name}</div>
                          <div className="text-xs text-gray-400">{m.user_email || m.expert_email} · {m.responsibility || ''}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[m.role] || ''}`}>
                          {ROLE_LABELS[m.role] || m.role}
                        </span>
                        <button onClick={() => removeMember(m.id, selectedCouncil.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                  {/* Add member */}
                  <div className="bg-purple-50 rounded-xl p-4 space-y-3 border border-purple-200">
                    <h5 className="text-sm font-semibold text-purple-800">Thêm thành viên</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tên chuyên gia"
                        value={newMember.expert_name}
                        onChange={e => setNewMember(m => ({ ...m, expert_name: e.target.value, user_id: '' }))}
                        className="form-input text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newMember.expert_email}
                        onChange={e => setNewMember(m => ({ ...m, expert_email: e.target.value }))}
                        className="form-input text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newMember.role}
                        onChange={e => setNewMember(m => ({ ...m, role: e.target.value }))}
                        className="form-input text-sm"
                      >
                        <option value="chairman">Chủ tịch</option>
                        <option value="member">Thành viên</option>
                        <option value="secretary">Thư ký</option>
                        <option value="enterprise_rep">Đại diện DN</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Phụ trách"
                        value={newMember.responsibility}
                        onChange={e => setNewMember(m => ({ ...m, responsibility: e.target.value }))}
                        className="form-input text-sm"
                      />
                    </div>
                    <button
                      onClick={() => addMember(selectedCouncil.id)}
                      disabled={actionLoading || !newMember.expert_name || !newMember.role}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      Thêm thành viên
                    </button>
                  </div>
                </div>

                {/* Meetings */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Biên bản họp</h4>
                  <div className="space-y-2 mb-3">
                    {selectedCouncil.meetings?.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Chưa có biên bản họp</p>
                    )}
                    {selectedCouncil.meetings?.map(m => (
                      <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {m.meeting_date ? formatDate(m.meeting_date) : 'Chưa có ngày'} — {m.meeting_location || 'Chưa có địa điểm'}
                            </div>
                            {m.attendees && <div className="text-xs text-gray-500">Tham dự: {m.attendees}</div>}
                            {m.discussion_summary && <p className="text-sm text-gray-700 mt-1">{m.discussion_summary}</p>}
                          </div>
                          {m.recommendation && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                              m.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                              m.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {RECOMMENDATION_LABELS[m.recommendation] || m.recommendation}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Add meeting */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700">Thêm biên bản họp</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={newMeeting.meeting_date} onChange={e => setNewMeeting(m => ({ ...m, meeting_date: e.target.value }))} className="form-input text-sm" />
                      <input type="text" placeholder="Địa điểm" value={newMeeting.meeting_location} onChange={e => setNewMeeting(m => ({ ...m, meeting_location: e.target.value }))} className="form-input text-sm" />
                    </div>
                    <input type="text" placeholder="Người tham dự" value={newMeeting.attendees} onChange={e => setNewMeeting(m => ({ ...m, attendees: e.target.value }))} className="form-input text-sm w-full" />
                    <textarea placeholder="Tóm tắt nội dung thảo luận..." value={newMeeting.discussion_summary} onChange={e => setNewMeeting(m => ({ ...m, discussion_summary: e.target.value }))} rows={2} className="form-input text-sm w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={newMeeting.recommendation} onChange={e => setNewMeeting(m => ({ ...m, recommendation: e.target.value }))} className="form-input text-sm">
                        <option value="">Kết luận...</option>
                        <option value="approve">Đồng ý</option>
                        <option value="reject">Từ chối</option>
                        <option value="revise">Yêu cầu sửa đổi</option>
                        <option value="defer">Tạm hoãn</option>
                      </select>
                      <input type="text" placeholder="Ghi chú kết luận" value={newMeeting.recommendation_notes} onChange={e => setNewMeeting(m => ({ ...m, recommendation_notes: e.target.value }))} className="form-input text-sm" />
                    </div>
                    <button
                      onClick={() => addMeeting(selectedCouncil.id)}
                      disabled={actionLoading}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      Thêm biên bản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
