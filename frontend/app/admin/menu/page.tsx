'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  parent_id?: string;
  position: string;
  sort_order: number;
  is_active: boolean;
  children?: MenuItem[];
}

const POSITION_LABELS: Record<string, string> = {
  header: 'Menu Header (Thanh trên)',
  footer: 'Menu Footer (Chân trang)',
  sidebar: 'Menu Sidebar',
};

export default function AdminMenuPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [headerItems, setHeaderItems] = useState<MenuItem[]>([]);
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePosition, setActivePosition] = useState<'header' | 'footer'>('header');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formSort, setFormSort] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/menus`);
      if (res.ok) {
        const data = await res.json();
        const items: MenuItem[] = data.data || [];
        setHeaderItems(items.filter(i => i.position === 'header').sort((a, b) => a.sort_order - b.sort_order));
        setFooterItems(items.filter(i => i.position === 'footer').sort((a, b) => a.sort_order - b.sort_order));
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/login');
  }, [isLoading, isAdmin, router]);

  useEffect(() => { if (isAdmin) fetchMenus(); }, [isAdmin, fetchMenus]);

  const openCreate = (position: 'header' | 'footer') => {
    setEditItem(null);
    setFormLabel('');
    setFormUrl('');
    setFormIcon('');
    setFormSort(0);
    setError('');
    setActivePosition(position);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setFormLabel(item.label);
    setFormUrl(item.url);
    setFormIcon(item.icon || '');
    setFormSort(item.sort_order);
    setActivePosition(item.position as 'header' | 'footer');
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formUrl.trim()) { setError('Nhãn và URL không được trống'); return; }
    setSaving(true);
    setError('');

    const body = {
      label: formLabel.trim(),
      url: formUrl.trim(),
      icon: formIcon.trim() || null,
      position: activePosition,
      sort_order: formSort,
    };

    try {
      const res = await authFetch(
        editItem ? `${API_BASE}/api/admin/menus/${editItem.id}` : `${API_BASE}/api/admin/menus`,
        {
          method: editItem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        setShowForm(false);
        fetchMenus();
      } else {
        const err = await res.json();
        setError(err.error || 'Lỗi khi lưu');
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa menu item này?')) return;
    const res = await authFetch(`${API_BASE}/api/admin/menus/${id}`, { method: 'DELETE' });
    if (res.ok) fetchMenus();
    else {
      const err = await res.json();
      alert(err.error || 'Xóa thất bại');
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    await authFetch(`${API_BASE}/api/admin/menus/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    });
    fetchMenus();
  };

  const renderMenuList = (items: MenuItem[], position: string) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{POSITION_LABELS[position]}</h3>
        <button
          onClick={() => openCreate(position as 'header' | 'footer')}
          className="text-sm text-natif-blue hover:text-blue-700 font-medium"
        >+ Thêm</button>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">Chưa có menu item</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Thứ tự</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Nhãn</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">URL</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${!item.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-sm text-gray-600 w-16">{item.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="text-base">{item.icon}</span>}
                    <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500 font-mono">{item.url}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {item.is_active ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="text-sm text-natif-blue hover:text-blue-700">Sửa</button>
                    <button onClick={() => handleDelete(item.id)} className="text-sm text-red-500 hover:text-red-700">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/news" className="text-gray-400 hover:text-gray-600 text-sm">← Tin tức</Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">Quản lý Menu</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick links */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>Mẹo:</strong> Menu này sẽ tự động hiển thị trên website. URL có thể là đường dẫn nội bộ (ví dụ: <code className="bg-blue-100 px-1 rounded">/news</code>) hoặc đường dẫn ngoài (ví dụ: <code className="bg-blue-100 px-1 rounded">https://example.com</code>).
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : (
          <div className="space-y-6">
            {renderMenuList(headerItems, 'header')}
            {renderMenuList(footerItems, 'footer')}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">{editItem ? 'Sửa menu item' : 'Thêm menu item'}</h3>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhãn *</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  placeholder="VD: Giới thiệu"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  placeholder="/about hoặc https://..."
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formIcon}
                  onChange={e => setFormIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  placeholder="🏠"
                  maxLength={4}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                <select
                  value={activePosition}
                  onChange={e => setActivePosition(e.target.value as 'header' | 'footer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                >
                  <option value="header">Menu Header</option>
                  <option value="footer">Menu Footer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={formSort}
                  onChange={e => setFormSort(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  min={0}
                />
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >Hủy</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-natif-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
