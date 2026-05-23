'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current_password || !form.new_password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.new_password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        setLoading(false);
        return;
      }
      setSuccess('Đổi mật khẩu thành công');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch {
      setError('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="font-heading font-bold text-2xl text-gray-900 mb-6">Đổi mật khẩu</h1>

        <div className="card-flat border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Mật khẩu hiện tại</label>
              <input type="password" value={form.current_password}
                onChange={e => setForm({ ...form, current_password: e.target.value })}
                className="form-input" autoComplete="current-password" />
            </div>
            <div>
              <label className="form-label">Mật khẩu mới</label>
              <input type="password" value={form.new_password}
                onChange={e => setForm({ ...form, new_password: e.target.value })}
                className="form-input" autoComplete="new-password" />
            </div>
            <div>
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="form-input" autoComplete="new-password" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">{success}</div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
