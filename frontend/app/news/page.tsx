'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORY_COLORS: Record<string, string> = {
  'hoat-dong': 'badge-blue',
  'cong-nghe': 'badge-cyan',
  'thong-bao': 'badge-amber',
  'tech': 'badge-blue',
  'activity': 'badge-green',
  'announcement': 'badge-amber',
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
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchDebounced(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchInput]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchDebounced) params.set('search', searchDebounced);
      params.set('page', String(currentPage));
      params.set('limit', '9');

      const [newsRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/news?${params}`),
        fetch(`${API_BASE}/api/news-categories`),
      ]);

      if (newsRes.ok) {
        const data = await newsRes.json();
        setArticles(data.data || []);
        setTotal(data.meta?.total || data.data?.length || 0);
        setTotalPages(data.meta?.totalPages || Math.ceil((data.data?.length || 0) / 9) || 1);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.data || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [activeCategory, searchDebounced, currentPage]);

  useEffect(() => { loadData(); }, [loadData]);

  const featuredArticle = articles.find(a => a.is_featured) || null;
  const regularArticles = featuredArticle
    ? articles.filter(a => a.id !== featuredArticle.id)
    : articles;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
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

        {/* Category filter + Search */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 space-y-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natif-blue/30 focus:border-natif-blue bg-gray-50 placeholder-gray-400"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${activeCategory === 'all' ? 'bg-natif-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >Tất cả</button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setActiveCategory(cat.slug); setCurrentPage(1); }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${activeCategory === cat.slug ? 'bg-natif-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >{cat.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results info */}
        {(searchDebounced || activeCategory !== 'all') && !loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <p className="text-sm text-gray-500">
              {searchDebounced
                ? `Kết quả tìm kiếm "${searchDebounced}"`
                : `Danh mục: ${categories.find(c => c.slug === activeCategory)?.name || activeCategory}`}
              {' — '}{total} bài viết
            </p>
          </div>
        )}

        {/* News list */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-gray-500 font-medium">Không tìm thấy bài viết nào.</p>
                <p className="text-gray-400 text-sm mt-1">Thử từ khóa khác hoặc danh mục khác.</p>
              </div>
            ) : (
              <>
                {/* Featured article (full width) */}
                {featuredArticle && (
                  <a href={`/news/${featuredArticle.slug}`}
                    className="block bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 group hover:border-natif-blue/30 hover:shadow-card-hover transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 shrink-0">
                        {featuredArticle.thumbnail ? (
                          <img src={featuredArticle.thumbnail} alt={featuredArticle.title}
                            className="w-full h-56 md:h-full object-cover" />
                        ) : (
                          <div className="h-56 md:h-full bg-gradient-to-br from-natif-blue/20 to-natif-cyan/20 flex items-center justify-center">
                            <svg className="w-16 h-16 text-natif-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="badge badge-blue">⭐ Nổi bật</span>
                          <span className={`badge ${CATEGORY_COLORS[featuredArticle.category] || 'badge-gray'}`}>
                            {categories.find(c => c.slug === featuredArticle.category)?.name || featuredArticle.category}
                          </span>
                        </div>
                        <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-3 group-hover:text-natif-blue transition-colors leading-snug">
                          {featuredArticle.title}
                        </h2>
                        {featuredArticle.excerpt && (
                          <p className="text-gray-500 leading-relaxed line-clamp-3 mb-4">{featuredArticle.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {featuredArticle.published_at && (
                            <span>{new Date(featuredArticle.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          )}
                          {featuredArticle.author && <span>{featuredArticle.author}</span>}
                          {featuredArticle.view_count != null && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {featuredArticle.view_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                {/* Regular grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularArticles.map(item => (
                    <a key={item.id} href={`/news/${item.slug}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:border-natif-blue/30 hover:shadow-card-hover transition-all flex flex-col">
                      <div className="relative">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-gradient-to-br from-natif-blue/10 to-natif-cyan/10 flex items-center justify-center">
                            <svg className="w-10 h-10 text-natif-blue/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                        {item.is_featured && (
                          <span className="absolute top-2 right-2 badge badge-amber text-xs">⭐ Nổi bật</span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge text-xs ${CATEGORY_COLORS[item.category] || 'badge-gray'}`}>
                            {categories.find(c => c.slug === item.category)?.name || item.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-natif-blue transition-colors flex-1 leading-snug">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="text-gray-500 text-sm line-clamp-2 mt-1">{item.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          {item.author && <span>{item.author}</span>}
                          {item.view_count != null && (
                            <span className="flex items-center gap-1 ml-auto">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {item.view_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white transition-colors"
                    >← Trước</button>
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
                          className={`w-10 h-10 text-sm rounded-lg border transition-colors ${
                            currentPage === page
                              ? 'bg-natif-blue text-white border-natif-blue'
                              : 'border-gray-300 hover:bg-white text-gray-600'
                          }`}>{page}</button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white transition-colors"
                    >Sau →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
