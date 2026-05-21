'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatCurrency, formatDate, PROGRAM_LABELS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

interface Assignment {
  id: string;
  application_id: string;
  expert_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  deadline?: string;
  application_title: string;
  company_name: string;
  program_type: string;
  budget_requested: number;
  created_at: string;
}

const navItems = [
  {
    label: 'Nhiệm vụ đánh giá',
    href: '/expert',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Hồ sơ cá nhân',
    href: '/expert/profile',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const SCORE_LABELS = [
  { key: 'score_innovation', label: 'Tính sáng tạo / Đổi mới (0-10)' },
  { key: 'score_feasibility', label: 'Tính khả thi (0-10)' },
  { key: 'score_impact', label: 'Tác động xã hội & kinh tế (0-10)' },
  { key: 'score_budget', label: 'Tính hợp lý ngân sách (0-10)' },
  { key: 'score_team', label: 'Năng lực nhóm thực hiện (0-10)' },
];

export default function ExpertDashboardPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('pending');

  const [scores, setScores] = useState<Record<string, number>>({});
  const [recommendation, setRecommendation] = useState('approve');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [comments, setComments] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'expert' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'expert' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const handleAction = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!selectedAssignment) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: selectedAssignment.id,
          application_id: selectedAssignment.application_id,
          ...scores,
          recommendation,
          strengths,
          weaknesses,
          comments,
        }),
      });
      if (res.ok) {
        setShowReviewForm(false);
        setScores({});
        setStrengths('');
        setWeaknesses('');
        setComments('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gửi đánh giá thất bại');
      }
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  const filtered = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'accepted') return a.status === 'accepted';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-amber',
      accepted: 'badge-blue',
      declined: 'badge-red',
      completed: 'badge-green',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ tiếp nhận',
      accepted: 'Đã nhận',
      declined: 'Đã từ chối',
      completed: 'Hoàn thành',
    };
    return (
      <span className={`badge ${map[status] || 'badge-gray'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <DashboardShell
      title="Chuyên gia — Đánh giá Hồ sơ"
      role="expert"
      navItems={navItems}
      activeHref="/expert"
    >
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-sm text-gray-500 mt-1">Chờ tiếp nhận</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">{acceptedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Đã nhận, chưa đánh giá</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Đã hoàn thành</div>
          </div>
        </div>

        <div className="flex gap-2">
          {(['pending', 'accepted', 'completed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-natif-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ tiếp nhận' : f === 'accepted' ? 'Đã nhận' : 'Hoàn thành'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dự án</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Chương trình</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Doanh nghiệp</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Số tiền</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Không có nhiệm vụ</td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{a.application_title}</div>
                      <div className="text-xs text-gray-400">{formatDate(a.created_at)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue">{PROGRAM_LABELS[a.program_type] || a.program_type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{a.company_name}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(a.budget_requested)}đ</td>
                    <td className="px-4 py-3">{getStatusBadge(a.status)}</td>
                    <td className="px-4 py-3">
                      {a.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(a.id, 'accepted')}
                            disabled={actionLoading}
                            className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                          >
                            Nhận
                          </button>
                          <button
                            onClick={() => handleAction(a.id, 'declined')}
                            disabled={actionLoading}
                            className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                      {a.status === 'accepted' && (
                        <button
                          onClick={() => { setSelectedAssignment(a); setShowReviewForm(true); }}
                          className="text-xs bg-natif-blue text-white px-3 py-1 rounded-lg hover:bg-natif-blue/90"
                        >
                          Đánh giá
                        </button>
                      )}
                      {a.status === 'completed' && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đã gửi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showReviewForm && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-bold text-lg">Đánh giá hồ sơ</h2>
                  <p className="text-xs text-gray-500">{selectedAssignment.application_title}</p>
                </div>
                <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div><span className="text-gray-500">Dự án:</span> <span className="font-medium">{selectedAssignment.application_title}</span></div>
                  <div><span className="text-gray-500">Doanh nghiệp:</span> <span className="font-medium">{selectedAssignment.company_name}</span></div>
                  <div><span className="text-gray-500">Chương trình:</span> <span className="font-medium">{PROGRAM_LABELS[selectedAssignment.program_type]}</span></div>
                  <div><span className="text-gray-500">Số tiền:</span> <span className="font-medium">{formatCurrency(selectedAssignment.budget_requested)}đ</span></div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-sm text-gray-700">Điểm đánh giá (0–10)</h3>
                  {SCORE_LABELS.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm text-gray-600">{label}</label>
                      <input
                        type="range" min="0" max="10" step="0.5"
                        value={scores[key] || 5}
                        onChange={e => setScores({ ...scores, [key]: parseFloat(e.target.value) })}
                        className="w-full accent-natif-blue"
                      />
                      <div className="text-center text-sm font-semibold text-natif-blue">{scores[key] || 5}/10</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kết luận</label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="recommendation" value="approve" checked={recommendation === 'approve'} onChange={() => setRecommendation('approve')} className="sr-only peer" />
                      <div className="text-center py-2 rounded-lg border-2 transition-colors peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 border-gray-200 text-gray-600 text-sm font-medium">
                        👍 Đề xuất duyệt
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="recommendation" value="reject" checked={recommendation === 'reject'} onChange={() => setRecommendation('reject')} className="sr-only peer" />
                      <div className="text-center py-2 rounded-lg border-2 transition-colors peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 border-gray-200 text-gray-600 text-sm font-medium">
                        👎 Đề xuất từ chối
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="recommendation" value="conditional" checked={recommendation === 'conditional'} onChange={() => setRecommendation('conditional')} className="sr-only peer" />
                      <div className="text-center py-2 rounded-lg border-2 transition-colors peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-700 border-gray-200 text-gray-600 text-sm font-medium">
                        ⚠️ Cần bổ sung
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Điểm mạnh</label>
                  <textarea rows={3} value={strengths} onChange={e => setStrengths(e.target.value)} className="form-input resize-none mt-1 text-sm" placeholder="Phân tích các điểm mạnh của hồ sơ..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Điểm cần cải thiện</label>
                  <textarea rows={3} value={weaknesses} onChange={e => setWeaknesses(e.target.value)} className="form-input resize-none mt-1 text-sm" placeholder="Các điểm còn thiếu hoặc cần cải thiện..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bình luận thêm</label>
                  <textarea rows={2} value={comments} onChange={e => setComments(e.target.value)} className="form-input resize-none mt-1 text-sm" placeholder="Nhận xét khác (không bắt buộc)..." />
                </div>

                <button onClick={handleSubmitReview} disabled={actionLoading} className="w-full btn-primary py-3 disabled:opacity-50">
                  {actionLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
