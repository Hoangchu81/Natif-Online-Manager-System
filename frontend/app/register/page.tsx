'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type RegisterType = 'enterprise' | 'expert';

export default function RegisterPage() {
  const router = useRouter();
  const [registerType, setRegisterType] = useState<RegisterType>('enterprise');
  const [form, setForm] = useState({
    email: '', full_name: '',
    phone: '', company: '', organization_name: '', tax_code: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.full_name) { setError('Email và họ tên là bắt buộc'); return; }
    setError('');
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const body: Record<string, string> = {
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        account_type: registerType === 'expert' ? 'expert' : 'external',
        canonical_role: registerType === 'expert' ? 'independent_expert' : 'external_partner',
      };
      if (registerType === 'enterprise') {
        body.company = form.company || form.organization_name;
        body.organization_name = form.organization_name || form.company;
        body.tax_code = form.tax_code;
      }

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }
      setSuccess(data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản và nhận mật khẩu.');
      setTimeout(() => router.push('/login?registered=true'), 5000);
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/natif-logo.svg" alt="NATIF" className="w-12 h-12 object-contain" />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Đăng ký tài khoản</h1>
          <p className="text-gray-500 text-sm mt-1">Khai báo thông tin → kích hoạt qua email → nhận mật khẩu</p>
        </div>

        <div className="card-flat border border-gray-200">
          {/* Account type selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRegisterType('enterprise')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                registerType === 'enterprise'
                  ? 'bg-natif-blue text-white border-natif-blue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              🏢 Doanh nghiệp
            </button>
            <button
              type="button"
              onClick={() => setRegisterType('expert')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                registerType === 'expert'
                  ? 'bg-natif-blue text-white border-natif-blue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              🎓 Chuyên gia / Nhà khoa học
            </button>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
              <p className="font-medium mb-1">✓ {success}</p>
              <p className="text-xs text-green-600">Sau khi kích hoạt, hệ thống sẽ gửi mật khẩu mặc định qua email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="form-input" placeholder={registerType === 'expert' ? 'PGS.TS. Nguyễn Văn A' : 'Nguyễn Văn A'} />
              </div>
              <div>
                <label className="form-label">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="form-input" placeholder={registerType === 'expert' ? 'expert@university.edu.vn' : 'contact@doanhnghiep.vn'} />
              </div>
              <div>
                <label className="form-label">Số điện thoại</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="form-input" placeholder="0912 345 678" />
              </div>

              {registerType === 'enterprise' && (
                <>
                  <div>
                    <label className="form-label">Tên doanh nghiệp</label>
                    <input type="text" value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })}
                      className="form-input" placeholder="Công ty TNHH ABC" />
                  </div>
                  <div>
                    <label className="form-label">Mã số thuế</label>
                    <input type="text" value={form.tax_code} onChange={e => setForm({ ...form, tax_code: e.target.value })}
                      className="form-input" placeholder="0123456789" />
                  </div>
                </>
              )}

              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                ℹ️ Bạn chưa cần tạo mật khẩu. Sau khi nhấn liên kết kích hoạt trong email, hệ thống sẽ gửi mật khẩu mặc định cho bạn.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Đang đăng ký...' : `Đăng ký ${registerType === 'expert' ? 'Chuyên gia' : 'Doanh nghiệp'}`}
              </button>

              {registerType === 'expert' && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  ℹ️ Tài khoản chuyên gia cần được NATIF phê duyệt sau khi bạn cập nhật đầy đủ CV khoa học.
                </p>
              )}

              <p className="text-xs text-gray-400 text-center">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <a href="/terms" className="text-natif-blue hover:underline">Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="/privacy" className="text-natif-blue hover:underline">Chính sách bảo mật</a>.
              </p>
            </form>
          )}

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
