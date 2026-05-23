'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400">Đang tải editor...</div>
});

interface Category {
  slug: string;
  name: string;
}

const AUTOSAVE_KEY = 'natif_editor_autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface DraftData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  thumbnail: string;
  tags: string;
  status: string;
  is_featured: boolean;
  savedAt: string;
}

export default function NewsEditorClient({ editId }: { editId?: string }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadDone = useRef(false);

  // ─── Load data ───
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }
    if (!isAdmin) return;

    const load = async () => {
      const catRes = await authFetch(`${API_BASE}/api/admin/news-categories`);
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.data || []);
        if (data.data?.length > 0 && !category) {
          setCategory(data.data[0].slug);
        }
      }

      if (editId) {
        const res = await authFetch(`${API_BASE}/api/admin/news/${editId}`);
        if (res.ok) {
          const a = await res.json();
          setTitle(a.title || '');
          setContent(a.content || '');
          setExcerpt(a.excerpt || '');
          setCategory(a.category || '');
          setAuthor(a.author || '');
          setThumbnail(a.thumbnail || '');
          setTags(Array.isArray(a.tags) ? a.tags.join(', ') : '');
          setStatus(a.status || 'draft');
          setIsFeatured(a.is_featured || false);
          // Clear any autosave for this article
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`${AUTOSAVE_KEY}_${editId}`);
          }
        }
      } else {
        // New article: restore autosave
        const savedKey = typeof window !== 'undefined' ? `${AUTOSAVE_KEY}_new` : null;
        if (savedKey && localStorage.getItem(savedKey)) {
          try {
            const saved: DraftData = JSON.parse(localStorage.getItem(savedKey) || '');
            const age = Date.now() - new Date(saved.savedAt).getTime();
            if (age < 24 * 60 * 60 * 1000) { // within 24h
              const restore = confirm('Phát hiện bản nháp được lưu tự động trước đó. Khôi phục không?');
              if (restore) {
                setTitle(saved.title);
                setContent(saved.content);
                setExcerpt(saved.excerpt);
                setCategory(saved.category);
                setAuthor(saved.author);
                setThumbnail(saved.thumbnail);
                setTags(saved.tags);
                setStatus(saved.status);
                setIsFeatured(saved.is_featured);
                setLastSaved(saved.savedAt);
              } else {
                localStorage.removeItem(savedKey);
              }
            } else {
              localStorage.removeItem(savedKey);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      initialLoadDone.current = true;
      setLoaded(true);
    };

    load();
  }, [isLoading, isAdmin, editId]);

  // ─── Auto-save to localStorage ───
  const saveDraftToStorage = useCallback(() => {
    if (!isDirty || !initialLoadDone.current) return;
    const key = editId ? `${AUTOSAVE_KEY}_${editId}` : `${AUTOSAVE_KEY}_new`;
    const draft: DraftData = {
      title, content, excerpt, category, author,
      thumbnail, tags, status, is_featured: isFeatured,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
    setLastSaved(draft.savedAt);
  }, [title, content, excerpt, category, author, thumbnail, tags, status, isFeatured, isDirty, editId]);

  // Mark dirty on any change
  useEffect(() => {
    if (loaded) setIsDirty(true);
  }, [title, content, excerpt, category, author, thumbnail, tags, status, isFeatured]);

  // Auto-save interval
  useEffect(() => {
    if (!loaded) return;
    autosaveTimer.current = setInterval(() => {
      saveDraftToStorage();
    }, AUTOSAVE_INTERVAL);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, [loaded, saveDraftToStorage]);

  // Save before unload
  useEffect(() => {
    const handleUnload = () => saveDraftToStorage();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [saveDraftToStorage]);

  // ─── Handle save ───
  const handleSave = async (publishStatus?: string, redirectToList = true) => {
    if (!title.trim()) { setError('Tiêu đề không được trống'); return; }
    if (!category) { setError('Vui lòng chọn danh mục'); return; }

    setError('');
    setSaving(true);

    const body = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      category,
      author: author.trim() || user?.full_name || '',
      thumbnail: thumbnail.trim(),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: publishStatus || status,
      is_featured: isFeatured,
    };

    try {
      const res = await authFetch(
        editId ? `${API_BASE}/api/admin/news/${editId}` : `${API_BASE}/api/admin/news`,
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Clear autosave on save
        const key = editId ? `${AUTOSAVE_KEY}_${editId}` : `${AUTOSAVE_KEY}_new`;
        localStorage.removeItem(key);
        setIsDirty(false);

        if (!editId && data.id) {
          router.push(`/admin/news/editor?id=${data.id}`);
        } else if (redirectToList) {
          router.push('/admin/news');
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Lỗi khi lưu');
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Duplicate ───
  const handleDuplicate = async () => {
    if (!editId) return;
    if (!confirm('Sao chép bài viết này thành bản nháp?')) return;
    setError('');

    const res = await authFetch(`${API_BASE}/api/admin/news/${editId}/duplicate`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/news/editor?id=${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error || 'Lỗi khi sao chép');
    }
  };

  if (isLoading || !loaded) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/news" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tin tức
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">{editId ? 'Sửa bài viết' : 'Bài viết mới'}</h1>
              {lastSaved && (
                <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã lưu {new Date(lastSaved).toLocaleTimeString('vi-VN')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editId && (
                <button
                  onClick={handleDuplicate}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  title="Sao chép bài viết"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Sao chép
                </button>
              )}
              <button
                onClick={() => handleSave('draft', false)}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >Lưu nháp</button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >{saving ? 'Đang lưu...' : 'Đăng bài'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-transparent focus:border-natif-blue pb-2 placeholder-gray-300 outline-none mb-4"
              />
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Tóm tắt ngắn (hiển thị trong danh sách)..."
                className="w-full px-0 border-0 border-b border-gray-200 text-gray-600 text-sm resize-none focus:ring-0 focus:border-natif-blue placeholder-gray-300 mb-4"
              />
              <RichTextEditor value={content} onChange={setContent} placeholder="Nhập nội dung bài viết..." />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Cài đặt</h3>

              <div className="mb-4">
                <label className="form-label-sm">Danh mục *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="form-input-sm" required>
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label-sm">Tác giả</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder="Tên tác giả..." className="form-input-sm" />
              </div>

              <div className="mb-4">
                <label className="form-label-sm">Ảnh đại diện</label>
                <input type="text" value={thumbnail} onChange={e => setThumbnail(e.target.value)}
                  placeholder="https://... hoặc tải ảnh lên"
                  className="form-input-sm mb-2" />
                {thumbnail && (
                  <div className="relative">
                    <img src={thumbnail} alt="Preview" className="w-full h-32 object-cover rounded-lg"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button onClick={() => setThumbnail('')}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label-sm">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                  className="form-input-sm" />
                <p className="text-xs text-gray-400 mt-1">Phân cách bằng dấu phẩy, tối đa 10 tags</p>
              </div>

              <div className="mb-4">
                <label className="form-label-sm">Trạng thái</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="status" value="draft" checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="text-natif-blue focus:ring-natif-blue" />
                    Nháp
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="status" value="published" checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="text-natif-blue focus:ring-natif-blue" />
                    Đã đăng
                  </label>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-natif-blue focus:ring-natif-blue" />
                  <label htmlFor="featured" className="text-sm text-gray-700">Nổi bật</label>
                </div>
              )}
            </div>

            {/* Auto-save info */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tự động lưu
              </div>
              <p className="text-xs text-gray-400">Bài nháp được lưu tự động mỗi 30 giây vào bộ nhớ trình duyệt. Nếu trình duyệt đóng đột ngột, bạn có thể khôi phục khi quay lại trang.</p>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <h4 className="text-sm font-semibold text-natif-blue mb-2">Mẹo</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Dùng tiêu đề H1 cho tiêu đề chính</li>
                <li>• Trích dẫn ngắn giúp hiển thị tốt hơn</li>
                <li>• Thêm thumbnail để bài viết nổi bật</li>
                <li>• Tags giúp phân loại nội dung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
