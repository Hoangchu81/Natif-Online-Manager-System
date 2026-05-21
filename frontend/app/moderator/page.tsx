'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { API_BASE, formatCurrency, PROGRAM_LABELS, PROGRAM_COLORS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';

interface Assignment {
  id: string;
  application_id: string;
  expert_id: string;
  expert_name: string;
  expert_email: string;
  status: string;
  deadline?: string;
  assigned_by_name: string;
  application_title: string;
  company_name: string;
  program_type: string;
  budget_requested: number;
  application_status: string;
  created_at: string;
}

interface Expert {
  id: string;
  full_name: string;
  email: string;
}

const navItems = [
  {
    label: 'Phân công chuyên gia',
    href: '/moderator',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function ModeratorPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignRes, expertsRes] = await Promise.all([
        authFetch(`${API_BASE}/api/assignments`),
        authFetch(`${API_BASE}/api/auth/users?role=expert`).catch(() => null),
      ]);
      if (assignRes.ok) {
        const data = await assignRes.json();
        setAssignments(data.data || []);
      }
      if (expertsRes?.ok) {
        const data = await expertsRes.json();
        setExperts(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'moderator' && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => { if (user?.role === 'moderator' || user?.role === 'admin') fetchData(); }, [user, fetchData]);

  const assignExpert = async (appId: string) => {
    if (!selectedExpert) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, expert_id: selectedExpert }),
      });
      if (res.ok) {
        setSelectedAppId(null);
        setSelectedExpert('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gán chuyên gia thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally { setActionLoading(false); }
  };

  const removeAssignment = async (id: string) => {
    if (!confirm('Hủy gán chuyên gia này?')) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch { alert('Lỗi kết nối'); } finally { setActionLoading(false); }
  };

  // Group by application
  const byApp = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    if (!acc[a.application_id]) acc[a.application_id] = [];
    acc[a.application_id].push(a);
    return acc;
  }, {});

  const appList = Object.entries(byApp).map(([appId, assigns]) => ({
    appId,
    assigns,
    appTitle: assigns[0].application_title,
    companyName: assigns[0].company_name,
    programType: assigns[0].program_type,
    budgetRequested: assigns[0].budget_requested,
    appStatus: assigns[0].application_status,
  }));

  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'accepted').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  return (
    <DashboardShell
      title="Điều phối viên — Gán Chuyên gia"
      role="moderator"
      navItems={navItems}
      activeHref="/moderator"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-amber-600">{appList.length}</div>
            <div className="text-sm text-gray-500 mt-1">Hồ sơ đã gán</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-purple-600">{pendingCount}</div>
            <div className="text-sm text-gray-500 mt-1">Đang chờ đánh giá</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Đã hoàn thành</div>
          </div>
        </div>

        {/* Assignment list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-heading font-semibold text-sm text-gray-700">Danh sách hồ sơ & chuyên gia đã gán</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="px-4 py-12 text-center text-gray-400">Đang tải...</div>
            ) : appList.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400">Chưa có hồ sơ nào được gán</div>
            ) : (
              appList.map(({ appId, assigns, appTitle, companyName, programType, budgetRequested, appStatus }) => (
                <div key={appId} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${PROGRAM_COLORS[programType] || 'badge-gray'}`}>
                          {PROGRAM_LABELS[programType] || programType}
                        </span>
                        <StatusBadge status={appStatus} />
                      </div>
                      <div className="font-semibold text-gray-900">{appTitle}</div>
                      <div className="text-sm text-gray-500">{companyName} · {formatCurrency(budgetRequested)}đ</div>
                    </div>
                    <button
                      onClick={() => setSelectedAppId(selectedAppId === appId ? null : appId)}
                      className="shrink-0 text-sm text-natif-blue hover:underline"
                    >
                      + Gán chuyên gia
                    </button>
                  </div>

                  {/* Assigned experts */}
                  <div className="flex flex-wrap gap-2">
                    {assigns.map(a => (
                      <div key={a.id} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                          {a.expert_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{a.expert_name}</div>
                          <div className="text-[10px] text-gray-500">{a.status}</div>
                        </div>
                        {a.status !== 'completed' && (
                          <button
                            onClick={() => removeAssignment(a.id)}
                            className="text-gray-400 hover:text-red-500 ml-1"
                            title="Hủy gán"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assign form */}
                  {selectedAppId === appId && (
                    <div className="bg-natif-blue/5 rounded-xl p-4 space-y-3 border border-natif-blue/20">
                      <h4 className="text-sm font-semibold text-gray-700">Gán chuyên gia mới</h4>
                      <select
                        value={selectedExpert}
                        onChange={e => setSelectedExpert(e.target.value)}
                        className="form-input text-sm"
                      >
                        <option value="">— Chọn chuyên gia —</option>
                        {experts.map(e => (
                          <option key={e.id} value={e.id}>{e.full_name} ({e.email})</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => assignExpert(appId)}
                          disabled={!selectedExpert || actionLoading}
                          className="btn-primary py-2 text-sm disabled:opacity-50"
                        >
                          {actionLoading ? 'Đang gán...' : 'Gán'}
                        </button>
                        <button
                          onClick={() => { setSelectedAppId(null); setSelectedExpert(''); }}
                          className="btn-secondary py-2 text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
