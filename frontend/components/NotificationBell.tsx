'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { authFetch, isAuthenticated } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown>;
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasAuth(isAuthenticated());
  }, []);

  useEffect(() => {
    if (!hasAuth) return;
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [hasAuth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function fetchCount() {
    try {
      const res = await authFetch(`${API_BASE}/api/notifications/unread-count`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
      }
    } catch { /* silent */ }
  }

  async function fetchRecent() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/notifications?limit=5&is_read=false`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch { /* silent */ }
    finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    const res = await authFetch(`${API_BASE}/api/notifications/read-all`, { method: 'PUT' });
    if (!res.ok) return;
    setCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  function handleToggle() {
    if (!open) fetchRecent();
    setOpen(!open);
  }

  if (!hasAuth) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={`Thông báo${count > 0 ? ` (${count} chưa đọc)` : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Thông báo mới" className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">Thông báo</h3>
            {count > 0 && (
              <button onClick={markAllRead} className="text-xs text-natif-blue hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Không có thông báo mới</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <Link
              href="/notifications"
              className="text-xs text-natif-blue hover:underline font-medium"
              onClick={() => setOpen(false)}
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
