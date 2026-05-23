'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  moderator: 'Điều phối viên',
  enterprise: 'Doanh nghiệp',
  expert: 'Chuyên gia',
  officer: 'Chuyên viên',
  dept_head: 'Trưởng phòng',
  director: 'Giám đốc',
  clerk: 'Văn thư',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  moderator: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-blue-100 text-blue-700',
  expert: 'bg-green-100 text-green-700',
  officer: 'bg-amber-100 text-amber-700',
  dept_head: 'bg-indigo-100 text-indigo-700',
  director: 'bg-rose-100 text-rose-700',
  clerk: 'bg-gray-100 text-gray-700',
};

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  email_verified_at?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [editingRole, setEditingRole] = useState<{ id: string; role: string } | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      if (filterStatus) params.set('status', filterStatus);

      const res = await authFetch(`${API_BASE}/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 20, pages: 0 });
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus]);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/login');
  }, [isLoading, isAdmin, router]);

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin, fetchUsers]);

  const handleToggleStatus = async (user: User) => {
    setActionLoading(user.id);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) fetchUsers(pagination.page);
    } finally {
      setActionLoading('');
    }
  };

  const handleChangeRole = async (id: string, role: string) => {
    setActionLoading(id);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setEditingRole(null);
        fetchUsers(pagination.page);
      }
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Xóa tài khoản "${user.full_name}" (${user.email})? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(user.id);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers(pagination.page);
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-natif-blue flex items-center justify-center">
                <span className="font-heading font-extrabold text-white text-sm">NT</span>
              </div>
              <div>
                <h1 className="font-heading font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-xs text-gray-500">Tổng: {pagination.total} tài khoản</p>
              </div>
            </div>
            <button onClick={() => router.push('/admin')} className="text-sm text-gray-500 hover:text-gray-900">
              ← Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <input type="text" placeholder="Tìm theo tên, email..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers()}
              className="form-input flex-1 min-w-[200px]" />
            <select value={filterRole} onChange={e => { setFilterRole(e.target.value); }} className="form-input w-auto">
              <option value="">Tất cả vai trò</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); }} className="form-input w-auto">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu</option>
            </select>
            <button onClick={() => fetchUsers()} className="btn-secondary py-2">Tìm kiếm</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Người dùng</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Đang tải...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Không có dữ liệu</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{user.full_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      {user.company && <div className="text-xs text-gray-400">{user.company}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {editingRole?.id === user.id ? (
                        <select value={editingRole.role}
                          onChange={e => setEditingRole({ ...editingRole, role: e.target.value })}
                          onBlur={() => {
                            if (editingRole.role !== user.role) handleChangeRole(user.id, editingRole.role);
                            else setEditingRole(null);
                          }}
                          className="form-input text-xs py-1 w-auto" autoFocus>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}
                          onClick={() => setEditingRole({ id: user.id, role: user.role })}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleStatus(user)}
                          disabled={actionLoading === user.id}
                          className={`text-xs px-2 py-1 rounded ${user.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                          {user.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        <button onClick={() => handleDelete(user)}
                          disabled={actionLoading === user.id}
                          className="text-xs px-2 py-1 rounded text-red-700 bg-red-50 hover:bg-red-100">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Trang {pagination.page}/{pagination.pages} ({pagination.total} kết quả)
              </div>
              <div className="flex gap-2">
                <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">Trước</button>
                <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                  className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">Sau</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
