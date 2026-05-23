'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Vui lòng nhập email'); return; }
    setError('');
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-flat border border-gray-200 p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-natif-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kiểm tra email</h2>
            <p className="text-gray-600 text-sm mb-6">
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, mã xác nhận đã được gửi. Mã có hiệu lực 15 phút.
            </p>
            <button onClick={() => router.push('/auth/reset-password')}
              className="btn-primary w-full justify-center py-2.5">
              Nhập mã xác nhận
            </button>
            <p className="text-xs text-gray-400 mt-4">Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau 1 phút.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Quên mật khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">Nhập email để nhận mã đặt lại mật khẩu</p>
        </div>

        <div className="card-flat border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email đăng ký</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="contact@doanhnghiep.vn" autoComplete="email" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
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
