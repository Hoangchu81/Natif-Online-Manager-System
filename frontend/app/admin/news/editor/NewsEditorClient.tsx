'use client';

import { useState, useEffect } from 'react';
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

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  thumbnail: string;
  tags: string[];
  status: string;
  is_featured: boolean;
}

interface Props {
  editId?: string;
}

export default function NewsEditorClient({ editId }: Props) {
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
          const a: Article = await res.json();
          setTitle(a.title || '');
          setContent(a.content || '');
          setExcerpt(a.excerpt || '');
          setCategory(a.category || '');
          setAuthor(a.author || '');
          setThumbnail(a.thumbnail || '');
          setTags(Array.isArray(a.tags) ? a.tags.join(', ') : '');
          setStatus(a.status || 'draft');
          setIsFeatured(a.is_featured || false);
        }
      }
      setLoaded(true);
    };

    load();
  }, [isLoading, isAdmin, editId]);

  const handleSave = async (publishStatus?: string) => {
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
        if (!editId && data.id) {
          router.push(`/admin/news/editor?id=${data.id}`);
        } else {
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

  if (isLoading || !loaded) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/news" className="text-gray-400 hover:text-gray-600 text-sm">← Tin tức</Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="font-heading font-bold text-gray-900">{editId ? 'Sửa bài viết' : 'Bài viết mới'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >Lưu nháp</button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >{saving ? 'Đang lưu...' : 'Đăng bài'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-transparent focus:border-natif-blue pb-2 placeholder-gray-300 outline-none"
                />
              </div>

              <div className="mb-4">
                <textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Tóm tắt ngắn (hiển thị trong danh sách)..."
                  className="w-full px-0 border-0 border-b border-gray-200 text-gray-600 text-sm resize-none focus:ring-0 focus:border-natif-blue placeholder-gray-300"
                />
              </div>

              <RichTextEditor value={content} onChange={setContent} placeholder="Nhập nội dung bài viết..." />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Cài đặt</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                  required
                >
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Tên tác giả..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                />
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="Thumbnail" className="mt-2 w-full h-32 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Phân cách bằng dấu phẩy</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-natif-blue focus:border-transparent"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã đăng</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-natif-blue focus:ring-natif-blue"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">⭐ Nổi bật</label>
              </div>
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
