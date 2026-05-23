'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authFetch, isAuthenticated } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

type Filter = 'all' | 'unread' | 'read';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    fetchNotifications(filter);
  }, [filter]);

  async function fetchNotifications(nextFilter: Filter) {
    setLoading(true);
    setError('');
    try {
      const readParam = nextFilter === 'all' ? '' : `&is_read=${nextFilter === 'read'}`;
      const res = await authFetch(`${API_BASE}/api/notifications?limit=100${readParam}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được thông báo');
      setNotifications(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    const res = await authFetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
    if (!res.ok) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const res = await authFetch(`${API_BASE}/api/notifications/read-all`, { method: 'PUT' });
    if (!res.ok) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-natif-blue text-white p-8 shadow-lg mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70 mb-3">NATIF OMS</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Thông báo</h1>
                <p className="text-blue-100 mt-2">Theo dõi cập nhật hồ sơ, đánh giá, hội đồng và báo cáo.</p>
              </div>
              {isAuthenticated() && (
                <button onClick={markAllRead} className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium">
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>

          {!isAuthenticated() ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem thông báo.</p>
              <Link href="/login" className="btn-primary">Đăng nhập</Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50">
                {(['all', 'unread', 'read'] as Filter[]).map(item => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === item ? 'bg-natif-blue text-white' : 'text-gray-600 hover:bg-white'}`}
                  >
                    {item === 'all' ? 'Tất cả' : item === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="p-10 text-center text-gray-500">Đang tải...</div>
              ) : error ? (
                <div className="p-10 text-center text-red-600">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-400">Không có thông báo</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <article key={n.id} className={`p-5 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-natif-blue'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h2 className="font-semibold text-gray-900">{n.title}</h2>
                            <time className="text-xs text-gray-400">
                              {new Date(n.created_at).toLocaleString('vi-VN')}
                            </time>
                          </div>
                          {n.body && <p className="mt-1 text-sm text-gray-600">{n.body}</p>}
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{n.type}</span>
                            {!n.is_read && (
                              <button onClick={() => markRead(n.id)} className="text-xs font-medium text-natif-blue hover:underline">
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
