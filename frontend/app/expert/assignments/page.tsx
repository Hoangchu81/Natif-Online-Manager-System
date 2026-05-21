'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'badge-amber' },
  accepted: { label: 'Đã nhận', color: 'badge-blue' },
  completed: { label: 'Đã đánh giá', color: 'badge-green' },
  declined: { label: 'Từ chối', color: 'badge-red' },
};

interface Assignment {
  id: string;
  application_id: string;
  application_title: string;
  company_name: string;
  program_type: string;
  budget_requested: number;
  application_status: string;
  assigned_by_name: string;
  assigned_at: string;
  deadline?: string;
  status: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAssignments(); }, []);

  async function fetchAssignments() {
    try {
      const res = await authFetch(`${API_BASE}/api/assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.data || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    const res = await authFetch(`${API_BASE}/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'accepted' }),
    });
    if (res.ok) fetchAssignments();
  }

  async function handleDecline(id: string) {
    if (!confirm('Bạn có chắc muốn từ chối phản biện đề tài này?')) return;
    const res = await authFetch(`${API_BASE}/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'declined' }),
    });
    if (res.ok) fetchAssignments();
  }

  function formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
  }

  if (loading) return <div className="text-gray-500 py-12 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Đề tài phản biện</h1>
        <p className="text-sm text-gray-500 mt-1">Danh sách đề tài/hồ sơ được gán cho bạn đánh giá</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">STT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tên đề tài</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Doanh nghiệp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Người gán</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hạn đánh giá</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Chưa có đề tài nào được gán</td></tr>
              ) : (
                assignments.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[250px] truncate">{a.application_title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{a.company_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{a.assigned_by_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(a.deadline)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_LABELS[a.status]?.color || 'badge-gray'}`}>
                        {STATUS_LABELS[a.status]?.label || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => handleAccept(a.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Nhận</button>
                            <button onClick={() => handleDecline(a.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Từ chối</button>
                          </>
                        )}
                        {(a.status === 'accepted' || a.status === 'completed') && (
                          <Link href={`/expert/assignments/${a.id}`} className="text-xs text-natif-blue hover:underline">
                            {a.status === 'accepted' ? 'Đánh giá' : 'Xem đánh giá'}
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
