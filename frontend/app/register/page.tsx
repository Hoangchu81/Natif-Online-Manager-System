'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', phone: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) { setError('Email, mật khẩu và họ tên là bắt buộc'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { router.push('/login?registered=true'); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-natif-blue flex items-center justify-center">
              <span className="font-heading font-extrabold text-white text-lg">NT</span>
            </div>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Đăng ký tài khoản</h1>
          <p className="text-gray-500 text-sm mt-1">Tạo tài khoản để nộp hồ sơ xin hỗ trợ</p>
        </div>

        <div className="card-flat border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="form-input" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="form-label">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="form-input" placeholder="contact@doanhnghiep.vn" />
            </div>
            <div>
              <label className="form-label">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="form-input" placeholder="0912 345 678" />
            </div>
            <div>
              <label className="form-label">Tên doanh nghiệp</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                className="form-input" placeholder="Công ty TNHH ABC" />
            </div>
            <div>
              <label className="form-label">Mật khẩu <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="form-input" placeholder="Ít nhất 6 ký tự" />
            </div>
            <div>
              <label className="form-label">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="form-input" placeholder="Nhập lại mật khẩu" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <a href="/terms" className="text-natif-blue hover:underline">Điều khoản sử dụng</a>
              {' '}và{' '}
              <a href="/privacy" className="text-natif-blue hover:underline">Chính sách bảo mật</a>.
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-natif-blue font-medium hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
