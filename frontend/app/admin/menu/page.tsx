'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  position: string;
  sort_order: number;
  is_active: boolean;
}

const POSITION_LABELS: Record<string, string> = {
  header: 'Menu Header (Thanh trên)',
  footer: 'Menu Footer (Chân trang)',
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
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formSort, setFormSort] = useState(0);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  };

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
        showToast(editItem ? 'Đã cập nhật menu item' : 'Đã thêm menu item');
      } else {
        const err = await res.json();
        setError(err.error || 'Lỗi khi lưu');
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa menu item này?')) return;
    const res = await authFetch(`${API_BASE}/api/admin/menus/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchMenus();
      showToast('Đã xóa menu item');
    } else {
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

  // ─── Drag & Drop ───
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const getItems = (position: string) => position === 'header' ? headerItems : footerItems;
  const setItems = (position: string, items: MenuItem[]) =>
    position === 'header' ? setHeaderItems(items) : setFooterItems(items);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    const position = activePosition;
    const items = [...getItems(position)];
    const fromIdx = items.findIndex(i => i.id === draggedId);
    const toIdx = items.findIndex(i => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    // Reassign sort_order based on new positions
    const reordered = items.map((item, idx) => ({ ...item, sort_order: idx }));
    setItems(position, reordered);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const saveOrder = async (position: string) => {
    const items = getItems(position);
    setReordering(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/menus/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          order: items.map(i => i.id),
        }),
      });
      if (res.ok) {
        showToast('Đã lưu thứ tự menu');
        fetchMenus();
      } else {
        const err = await res.json();
        showToast(err.error || 'Lỗi khi lưu thứ tự');
        fetchMenus(); // revert
      }
    } catch { fetchMenus(); }
    finally { setReordering(false); }
  };

  const renderMenuList = (position: 'header' | 'footer') => {
    const items = getItems(position);
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 text-sm">{POSITION_LABELS[position]}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Kéo thả để sắp xếp</span>
            <button onClick={() => openCreate(position)}
              className="text-sm text-natif-blue hover:text-blue-700 font-medium">+ Thêm</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Chưa có menu item</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, item.id)}
                onDragOver={e => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 px-4 py-3 transition-colors cursor-move select-none
                  ${!item.is_active ? 'opacity-50' : ''}
                  ${dragOverId === item.id ? 'bg-blue-50 border-t-2 border-natif-blue' : 'hover:bg-gray-50'}
                  ${draggedId === item.id ? 'opacity-40 bg-gray-100' : ''}
                `}
              >
                {/* Drag handle */}
                <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Icon */}
                {item.icon && (
                  <span className="text-base shrink-0 w-6 text-center">{item.icon}</span>
                )}

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.label}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{item.url}</p>
                </div>

                {/* Status */}
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                    item.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {item.is_active ? 'Hiển thị' : 'Ẩn'}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-natif-blue hover:bg-blue-50 rounded-md transition-colors"
                    title="Sửa">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Xóa">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex justify-end">
            <button
              onClick={() => saveOrder(position)}
              disabled={reordering}
              className="px-4 py-2 bg-natif-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {reordering ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu thứ tự
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-down">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/news" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tin tức
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">Quản lý Menu</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Kéo thả icon <strong>☰</strong> bên trái mỗi dòng để sắp xếp thứ tự. Sau đó nhấn <strong>Lưu thứ tự</strong> để áp dụng. URL có thể là đường dẫn nội bộ (ví dụ: <code className="bg-blue-100 px-1 rounded">/news</code>) hoặc đường dẫn ngoài (ví dụ: <code className="bg-blue-100 px-1 rounded">https://example.com</code>).</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['header', 'footer'] as const).map(pos => (
            <button key={pos} onClick={() => setActivePosition(pos)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                activePosition === pos
                  ? 'bg-natif-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >{POSITION_LABELS[pos]}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : (
          renderMenuList(activePosition)
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-modal">
            <h3 className="font-semibold text-gray-900 mb-4">{editItem ? 'Sửa menu item' : 'Thêm menu item'}</h3>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label-sm">Nhãn *</label>
                <input type="text" value={formLabel} onChange={e => setFormLabel(e.target.value)}
                  className="form-input-sm" placeholder="VD: Giới thiệu" required />
              </div>
              <div className="mb-3">
                <label className="form-label-sm">URL *</label>
                <input type="text" value={formUrl} onChange={e => setFormUrl(e.target.value)}
                  className="form-input-sm" placeholder="/about hoặc https://..." required />
              </div>
              <div className="mb-3">
                <label className="form-label-sm">Icon (emoji)</label>
                <input type="text" value={formIcon} onChange={e => setFormIcon(e.target.value)}
                  className="form-input-sm" placeholder="🏠" maxLength={4} />
              </div>
              <div className="mb-4">
                <label className="form-label-sm">Thứ tự</label>
                <input type="number" value={formSort} onChange={e => setFormSort(parseInt(e.target.value) || 0)}
                  className="form-input-sm" min={0} />
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-natif-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
