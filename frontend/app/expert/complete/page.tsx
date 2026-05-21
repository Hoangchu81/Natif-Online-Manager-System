'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface ProfileStatus {
  profile_completed: boolean;
}

export default function CompletePage() {
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await authFetch(`${API_BASE}/api/expert/profile`);
        if (res.ok) {
          const data = await res.json();
          setStatus({ profile_completed: data.profile_completed });
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  async function handleComplete() {
    setCompleting(true);
    setMessage('');
    try {
      const res = await authFetch(`${API_BASE}/api/expert/complete`, { method: 'POST' });
      if (res.ok) {
        setStatus({ profile_completed: true });
        setMessage('Hồ sơ đã được đánh dấu hoàn thành!');
      } else {
        setMessage('Có lỗi xảy ra');
      }
    } catch {
      setMessage('Không thể kết nối server');
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="text-gray-500 py-12 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Hoàn thành và xuất lý lịch</h1>
        <p className="text-sm text-gray-500 mt-1">Xác nhận hoàn thành hồ sơ và xuất lý lịch khoa học</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.profile_completed ? 'bg-green-100' : 'bg-amber-100'}`}>
            {status?.profile_completed ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {status?.profile_completed ? 'Hồ sơ đã hoàn thành khai báo' : 'Hồ sơ chưa hoàn thành'}
            </div>
            <div className="text-sm text-gray-500">
              {status?.profile_completed
                ? 'Bạn đã xác nhận thông tin lý lịch khoa học là chính xác.'
                : 'Vui lòng kiểm tra đầy đủ thông tin trước khi xác nhận hoàn thành.'}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 italic">
            Tôi xin cam kết những thông tin trên là đúng sự thật và sẽ chịu hoàn toàn trách nhiệm nếu có rõ về sai sót thông tin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-2">
          {!status?.profile_completed && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="btn-primary py-2.5 px-6 disabled:opacity-60"
            >
              {completing ? 'Đang xử lý...' : 'ĐÃ HOÀN THÀNH'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="border border-natif-blue text-natif-blue rounded-lg py-2.5 px-6 font-medium text-sm hover:bg-natif-blue/5 transition-colors"
          >
            XUẤT LÝ LỊCH KHOA HỌC (PDF)
          </button>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('hoàn thành') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
