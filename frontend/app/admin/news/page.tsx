'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  published_at: string | null;
  created_at: string;
  updated_at: string;
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
  is_active: boolean;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  published: { label: 'Đã đăng', badge: 'bg-emerald-100 text-emerald-700' },
  draft: { label: 'Nháp', badge: 'bg-gray-100 text-gray-600' },
  archived: { label: 'Lưu trữ', badge: 'bg-amber-100 text-amber-700' },
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminNewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'articles' | 'categories'>('articles');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSort, setNewCatSort] = useState(0);
  const [catError, setCatError] = useState('');
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatSort, setEditCatSort] = useState(0);
  const [editCatActive, setEditCatActive] = useState(true);
  const [editCatLoading, setEditCatLoading] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = user?.role === 'admin';
  const canManageCat = isAdmin;

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchDebounced(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchInput]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      if (searchDebounced) params.set('search', searchDebounced);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));

      const res = await authFetch(`${API_BASE}/api/admin/news?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.data || []);
        setMeta(data.meta || { total: 0, page: 1, limit: pageSize });
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [filterStatus, filterCategory, searchDebounced, currentPage, pageSize]);

  const fetchCategories = useCallback(async () => {
    const res = await authFetch(`${API_BASE}/api/admin/news-categories`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.data || []);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) fetchArticles();
  }, [user, fetchArticles]);

  useEffect(() => {
    if (user && tab === 'categories') fetchCategories();
  }, [user, tab, fetchCategories]);

  const handleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));
    }
  };

  const handleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleBulk = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const action = bulkAction;
    setBulkLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/news/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setBulkAction('');
        fetchArticles();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại');
      }
    } finally { setBulkLoading(false); }
  };

  const handleToggleFeatured = async (id: string) => {
    const res = await authFetch(`${API_BASE}/api/admin/news/${id}/featured`, { method: 'PUT' });
    if (res.ok) fetchArticles();
  };

  const handlePublish = async (id: string) => {
    const res = await authFetch(`${API_BASE}/api/admin/news/${id}/publish`, { method: 'PUT' });
    if (res.ok) fetchArticles();
  };

  const handleUnpublish = async (id: string) => {
    const res = await authFetch(`${API_BASE}/api/admin/news/${id}/unpublish`, { method: 'PUT' });
    if (res.ok) fetchArticles();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/news/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== deleteId));
        setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteId); return n; });
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
      body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim(), sort_order: newCatSort }),
    });
    if (res.ok) {
      setNewCatName(''); setNewCatDesc(''); setNewCatSort(0);
      fetchCategories();
    } else {
      const err = await res.json();
      setCatError(err.error || 'Lỗi khi tạo danh mục');
    }
  };

  const handleEditCat = (cat: Category) => {
    setEditCat(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
    setEditCatSort(cat.sort_order);
    setEditCatActive(cat.is_active !== false);
  };

  const handleSaveCat = async () => {
    if (!editCat || !editCatName.trim()) return;
    setEditCatLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/news-categories/${editCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCatName.trim(), description: editCatDesc.trim(), sort_order: editCatSort, is_active: editCatActive }),
      });
      if (res.ok) {
        setEditCat(null);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi cập nhật danh mục');
      }
    } finally { setEditCatLoading(false); }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    const res = await authFetch(`${API_BASE}/api/admin/news-categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Xóa thất bại');
    }
  };

  const totalPages = Math.ceil(meta.total / meta.limit);
  const startItem = (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">Quản lý Tin tức</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/news/editor" className="btn-primary text-sm py-2">
                + Tin mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'articles', label: 'Bài viết' },
            { key: 'categories', label: 'Danh mục' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-natif-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── ARTICLES TAB ─── */}
        {tab === 'articles' && (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-64">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm</label>
                  <input
                    type="text"
                    placeholder="Tìm theo tiêu đề, tóm tắt..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                  <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tất cả</option>
                    <option value="published">Đã đăng</option>
                    <option value="draft">Nháp</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
                  <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tất cả</option>
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hiển thị</label>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                    <option value={100}>100 / trang</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
              <div className="bg-natif-blue text-white rounded-xl p-3 mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">{selectedIds.size} bài viết được chọn</span>
                <div className="flex items-center gap-2">
                  <select
                    value={bulkAction}
                    onChange={e => setBulkAction(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-white/30 bg-white/10 text-white"
                  >
                    <option value="">-- Thao tác --</option>
                    <option value="publish">Xuất bản</option>
                    <option value="unpublish">Gỡ xuất bản</option>
                    <option value="delete">Xóa</option>
                  </select>
                  <button
                    onClick={handleBulk}
                    disabled={!bulkAction || bulkLoading}
                    className="px-4 py-1.5 bg-white text-natif-blue text-sm font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    {bulkLoading ? 'Đang xử lý...' : 'Thực hiện'}
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-3 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Hủy chọn
                  </button>
                </div>
              </div>
            )}

            {/* Articles Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-natif-blue border-t-transparent rounded-full mx-auto mb-3" />
                  Đang tải...
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📰</div>
                  <p className="text-gray-500 font-medium mb-1">Chưa có bài viết nào</p>
                  <p className="text-gray-400 text-sm mb-4">Tạo bài viết đầu tiên để bắt đầu</p>
                  <Link href="/admin/news/editor" className="btn-primary text-sm">
                    + Tạo bài viết
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="w-10 px-4 py-3">
                            <input type="checkbox" checked={selectedIds.size === articles.length}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-natif-blue focus:ring-natif-blue" />
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tiêu đề</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-28">Danh mục</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-28">Trạng thái</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-20">Lượt xem</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-36">Ngày đăng</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-28">Tác giả</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-44">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {articles.map(a => (
                          <tr key={a.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.has(a.id) ? 'bg-blue-50/50' : ''}`}>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selectedIds.has(a.id)}
                                onChange={() => handleSelect(a.id)}
                                className="rounded border-gray-300 text-natif-blue focus:ring-natif-blue" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {a.thumbnail ? (
                                  <img src={a.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-natif-blue/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className={`font-semibold text-sm line-clamp-1 ${a.status === 'draft' ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {a.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {a.is_featured && (
                                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">Nổi bật</span>
                                    )}
                                    {a.author_name && (
                                      <span className="text-xs text-gray-400">{a.author_name}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700 whitespace-nowrap">
                                {categories.find(c => c.slug === a.category)?.name || a.category || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_CONFIG[a.status]?.badge || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_CONFIG[a.status]?.label || a.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {a.view_count || 0}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(a.published_at)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{a.author_name || a.author || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {a.status === 'draft' ? (
                                  <button onClick={() => handlePublish(a.id)}
                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                                    title="Xuất bản">
                                    Đăng
                                  </button>
                                ) : (
                                  <button onClick={() => handleUnpublish(a.id)}
                                    className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                                    title="Gỡ xuất bản">
                                    Gỡ
                                  </button>
                                )}
                                {isAdmin && (
                                  <button onClick={() => handleToggleFeatured(a.id)}
                                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${a.is_featured ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                                    title="Toggle Nổi bật">
                                    ⭐
                                  </button>
                                )}
                                <Link href={`/admin/news/editor?id=${a.id}`}
                                  className="text-xs text-natif-blue hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                                  Sửa
                                </Link>
                                {a.slug && (
                                  <a href={`/news/${a.slug}`} target="_blank"
                                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                                    title="Xem trên site">
                                    ↗
                                  </a>
                                )}
                                <button onClick={() => setDeleteId(a.id)}
                                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {meta.total > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-500">
                        Hiển thị {startItem}–{endItem} / {meta.total} bài viết
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white transition-colors"
                        >
                          ← Trước
                        </button>
                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 7) {
                            page = i + 1;
                          } else if (currentPage <= 4) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            page = totalPages - 6 + i;
                          } else {
                            page = currentPage - 3 + i;
                          }
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-9 h-9 text-sm rounded-lg border transition-colors ${currentPage === page ? 'bg-natif-blue text-white border-natif-blue' : 'border-gray-300 hover:bg-white text-gray-600'}`}>
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white transition-colors"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ─── CATEGORIES TAB ─── */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Category */}
            {canManageCat && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
                <h3 className="font-heading font-bold text-gray-900 mb-4">Thêm danh mục mới</h3>
                <form onSubmit={handleCreateCategory}>
                  <div className="mb-3">
                    <label className="form-label-sm">Tên danh mục *</label>
                    <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                      className="form-input-sm" placeholder="VD: Tin công nghệ" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-sm">Mô tả</label>
                    <textarea value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)}
                      rows={2} className="form-input-sm" placeholder="Mô tả ngắn..." />
                  </div>
                  <div className="mb-4">
                    <label className="form-label-sm">Thứ tự</label>
                    <input type="number" value={newCatSort} onChange={e => setNewCatSort(Number(e.target.value))}
                      className="form-input-sm" />
                  </div>
                  {catError && <div className="text-red-600 text-sm mb-3">{catError}</div>}
                  <button type="submit" className="btn-primary w-full text-sm">Thêm danh mục</button>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className={canManageCat ? 'lg:col-span-2' : 'col-span-3'}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tên</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Slug</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Bài</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Thứ tự</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                          {c.description && <p className="text-xs text-gray-400 line-clamp-1">{c.description}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-natif-blue/10 text-natif-blue text-xs font-bold">
                            {c.article_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">{c.sort_order}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${c.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {c.is_active !== false ? 'Kích hoạt' : 'Tắt'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canManageCat && (
                              <button onClick={() => handleEditCat(c)}
                                className="text-xs text-natif-blue hover:text-blue-800 font-medium">
                                Sửa
                              </button>
                            )}
                            {canManageCat && c.article_count === 0 && (
                              <button onClick={() => handleDeleteCat(c.id, c.name)}
                                className="text-xs text-red-500 hover:text-red-700">
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                          Chưa có danh mục nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xóa bài viết?</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditCat(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-4">Sửa danh mục</h3>
            <div className="mb-3">
              <label className="form-label-sm">Tên danh mục *</label>
              <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)}
                className="form-input-sm" required />
            </div>
            <div className="mb-3">
              <label className="form-label-sm">Mô tả</label>
              <textarea value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)}
                rows={2} className="form-input-sm" />
            </div>
            <div className="mb-4">
              <label className="form-label-sm">Thứ tự</label>
              <input type="number" value={editCatSort} onChange={e => setEditCatSort(Number(e.target.value))}
                className="form-input-sm" />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input type="checkbox" id="editActive" checked={editCatActive}
                onChange={e => setEditCatActive(e.target.checked)}
                className="rounded border-gray-300 text-natif-blue focus:ring-natif-blue" />
              <label htmlFor="editActive" className="text-sm text-gray-700">Kích hoạt danh mục</label>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditCat(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button onClick={handleSaveCat} disabled={editCatLoading}
                className="btn-primary text-sm">
                {editCatLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
