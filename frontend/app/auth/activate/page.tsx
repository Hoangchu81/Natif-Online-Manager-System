'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang kích hoạt tài khoản...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Liên kết kích hoạt không hợp lệ hoặc thiếu thông tin.');
      return;
    }

    const activate = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API_BASE}/api/auth/activate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Kích hoạt tài khoản thất bại.');
          return;
        }
        setStatus('success');
        setMessage(data.message || 'Tài khoản đã được kích hoạt. Vui lòng kiểm tra email để nhận mật khẩu đăng nhập.');
      } catch {
        setStatus('error');
        setMessage('Không thể kết nối máy chủ. Vui lòng thử lại.');
      }
    };

    activate();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/natif-logo.svg" alt="NATIF" className="w-12 h-12 object-contain" />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Kích hoạt tài khoản</h1>
        </div>

        <div className="card-flat border border-gray-200 text-center">
          <div className={`rounded-lg p-4 text-sm ${status === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : status === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            {status === 'loading' && '⏳ '}
            {status === 'success' && '✓ '}
            {status === 'error' && '⚠ '}
            {message}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/login" className="btn-primary w-full justify-center py-2.5">Đến trang đăng nhập</Link>
            <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">Đăng ký lại</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="card-flat border border-gray-200 text-center p-6 text-sm text-blue-700">Đang tải...</div>
      </div>
    }>
      <ActivateAccountContent />
    </Suspense>
  );
}
