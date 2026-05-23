'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', code: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.code || !form.new_password) {
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
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: form.code, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-flat border border-gray-200 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu thành công</h2>
            <p className="text-gray-600 text-sm">Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Đặt lại mật khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">Nhập mã xác nhận từ email và mật khẩu mới</p>
        </div>

        <div className="card-flat border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="form-input" placeholder="contact@doanhnghiep.vn" autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Mã xác nhận (6 số)</label>
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                className="form-input text-center text-2xl tracking-widest" placeholder="000000"
                maxLength={6} inputMode="numeric" autoComplete="one-time-code" />
            </div>
            <div>
              <label className="form-label">Mật khẩu mới</label>
              <input type="password" value={form.new_password} onChange={e => setForm({ ...form, new_password: e.target.value })}
                className="form-input" placeholder="••••••••" autoComplete="new-password" />
            </div>
            <div>
              <label className="form-label">Xác nhận mật khẩu</label>
              <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="form-input" placeholder="••••••••" autoComplete="new-password" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
