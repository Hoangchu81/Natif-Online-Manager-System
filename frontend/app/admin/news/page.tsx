'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  author_name?: string;
  status: string;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  thumbnail?: string;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  article_count: number;
  sort_order: number;
}

const STATUS_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  published: { label: 'Đã đăng', badge: 'bg-green-100 text-green-700', color: 'text-green-600' },
  draft: { label: 'Nháp', badge: 'bg-gray-100 text-gray-700', color: 'text-gray-500' },
  archived: { label: 'Lưu trữ', badge: 'bg-yellow-100 text-yellow-700', color: 'text-yellow-600' },
};

const CATEGORY_LABELS: Record<string, string> = {
  'hoat-dong': 'Tin hoạt động',
  'cong-nghe': 'Tin công nghệ',
  'thong-bao': 'Thông báo',
};

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminNewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'articles' | 'categories'>('articles');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catError, setCatError] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      if (search) params.set('search', search);
      params.set('limit', '100');

      const [newsRes, catRes] = await Promise.all([
        authFetch(`${API_BASE}/api/admin/news?${params}`),
        authFetch(`${API_BASE}/api/admin/news-categories`),
      ]);

      if (newsRes.ok) {
        const data = await newsRes.json();
        setArticles(data.data || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.data || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [filterStatus, filterCategory, search]);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/login');
  }, [isLoading, isAdmin, router]);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin, fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/news/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== deleteId));
      } else {
        const err = await res.json();
        alert(err.error || 'Xóa thất bại');
      }
    } finally { setDeleting(false); setDeleteId(null); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatError('');
    const res = await authFetch(`${API_BASE}/api/admin/news-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
    });
    if (res.ok) {
      setNewCatName('');
      setNewCatDesc('');
      fetchData();
    } else {
      const err = await res.json();
      setCatError(err.error || 'Lỗi khi tạo danh mục');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    const res = await authFetch(`${API_BASE}/api/admin/news-categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Xóa thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Quay lại Dashboard</Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">Quản lý Tin tức & CMS</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/news/editor" className="px-4 py-2 bg-natif-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                + Tin mới
              </Link>
              <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Trang chủ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('articles')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'articles' ? 'bg-natif-blue text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >Bài viết ({articles.length})</button>
          <button
            onClick={() => setTab('categories')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'categories' ? 'bg-natif-blue text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >Danh mục ({categories.length})</button>
          <button
            onClick={() => router.push('/admin/menu')}
            className="px-5 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >Menu</button>
        </div>

        {tab === 'articles' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="published">Đã đăng</option>
                <option value="draft">Nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >Lọc</button>
            </div>

            {/* Articles table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
                <Link href="/admin/news/editor" className="px-4 py-2 bg-natif-blue text-white text-sm rounded-lg hover:bg-blue-700">
                  Tạo bài viết đầu tiên
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tiêu đề</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Lượt xem</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Cập nhật</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm line-clamp-1">{a.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{a.excerpt || '—'}</div>
                          {a.is_featured && (
                            <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Nổi bật</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{CATEGORY_LABELS[a.category] || a.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_LABELS[a.status]?.badge || 'bg-gray-100 text-gray-700'}`}>
                            {STATUS_LABELS[a.status]?.label || a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{a.view_count}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.published_at || a.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/news/editor?id=${a.id}`}
                              className="text-sm text-natif-blue hover:text-blue-700 font-medium"
                            >Sửa</Link>
                            <Link
                              href={`/news/${a.slug}`}
                              target="_blank"
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >Xem</Link>
                            <button
                              onClick={() => setDeleteId(a.id)}
                              className="text-sm text-red-500 hover:text-red-700"
                            >Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create category form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thêm danh mục mới</h3>
              <form onSubmit={handleCreateCategory}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                    placeholder="VD: Tin công nghệ"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                    placeholder="Mô tả ngắn..."
                  />
                </div>
                {catError && <div className="text-red-600 text-sm mb-3">{catError}</div>}
                <button type="submit" className="w-full px-4 py-2 bg-natif-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  Thêm danh mục
                </button>
              </form>
            </div>

            {/* Categories list */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tên</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Slug</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Bài viết</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                        {c.description && <div className="text-xs text-gray-500 truncate max-w-xs">{c.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{c.slug}</td>
                      <td className="px-4 py-3 text-sm text-center">{c.article_count}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Xóa bài viết?</h3>
            <p className="text-gray-600 text-sm mb-4">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >Hủy</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
              >{deleting ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
