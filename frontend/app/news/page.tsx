'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORY_LABELS: Record<string, string> = {
  'hoat-dong': 'Tin hoạt động',
  'cong-nghe': 'Tin công nghệ',
  'thong-bao': 'Thông báo',
};

const CATEGORY_BADGE: Record<string, string> = {
  'hoat-dong': 'badge-blue',
  'cong-nghe': 'badge-cyan',
  'thong-bao': 'badge-amber',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  thumbnail?: string;
  is_featured?: boolean;
  view_count?: number;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'all') params.set('category', activeCategory);
        params.set('limit', '20');

        const [newsRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/news?${params}`),
          fetch(`${API_BASE}/api/news-categories`),
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
    };
    load();
  }, [activeCategory]);

  return (
    <>
      <Header />
      <main>
        {/* Page header */}
        <div className="bg-gov-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
                <span>/</span>
                <span>Tin tức</span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">Tin tức & Sự kiện</h1>
              <p className="text-white/80 text-lg">
                Cập nhật tin tức hoạt động, thông báo và sự kiện của Quỹ Đổi mới công nghệ quốc gia.
              </p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-4 overflow-x-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === 'all' ? 'bg-natif-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >Tất cả</button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeCategory === cat.slug ? 'bg-natif-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >{cat.name}</button>
              ))}
            </div>
          </div>
        </div>

        {/* News list */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Đang tải tin tức...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-gray-500">Chưa có bài viết nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((item) => (
                  <a
                    key={item.id || item.slug}
                    href={`/news/${item.slug}`}
                    className="card-flat border border-gray-200 flex flex-col sm:flex-row gap-6 group hover:border-natif-blue/30 transition-colors bg-white rounded-xl overflow-hidden"
                  >
                    <div className="sm:w-48 sm:shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-32 sm:h-full object-cover" />
                      ) : (
                        <div className="h-32 sm:h-full bg-gradient-to-br from-natif-blue/10 to-natif-cyan/10 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-xl bg-natif-blue/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 p-5 sm:py-6">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`badge ${CATEGORY_BADGE[item.category] || 'badge-gray'}`}>
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </span>
                        {item.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Nổi bật</span>}
                      </div>
                      <h2 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-natif-blue transition-colors leading-snug">
                        {item.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {item.excerpt || 'Không có mô tả'}
                      </p>
                      {item.author && (
                        <div className="mt-3 text-xs text-gray-400">Tác giả: {item.author}</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
