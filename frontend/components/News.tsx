import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

const CATEGORY_COLORS: Record<string, string> = {
  'hoat-dong': 'badge-blue',
  'cong-nghe': 'badge-cyan',
  'thong-bao': 'badge-amber',
  'tech': 'badge-blue',
  'activity': 'badge-green',
  'announcement': 'badge-amber',
};

async function getNews(): Promise<{ featured: Article | null; recent: Article[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/news?limit=4`, { next: { revalidate: 300 } });
    if (!res.ok) return { featured: null, recent: [] };
    const data = await res.json();
    const articles: Article[] = data.data || [];
    const featured = articles.find(a => a.is_featured) || null;
    const recent = featured
      ? articles.filter(a => a.id !== featured.id).slice(0, 3)
      : articles.slice(0, 3);
    return { featured, recent };
  } catch {
    return { featured: null, recent: [] };
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function News() {
  const { featured, recent } = await getNews();

  if (!featured && recent.length === 0) return null;

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="badge badge-blue inline-flex mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Tin tức
            </div>
            <h2 className="section-title mb-0">Tin tức & Sự kiện</h2>
          </div>
          <Link href="/news" className="hidden sm:inline-flex items-center gap-2 text-natif-blue hover:text-natif-blue-light font-medium text-sm transition-colors">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured article */}
          {featured && (
            <Link href={`/news/${featured.slug}`} className="card group lg:row-span-1 overflow-hidden">
              {featured.thumbnail ? (
                <div className="h-48 -mx-6 -mt-6 mb-5 overflow-hidden">
                  <img src={featured.thumbnail} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-48 rounded-lg bg-gradient-to-br from-natif-blue/10 to-natif-cyan/10 mb-5 flex items-center justify-center -mx-6 -mt-6 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-natif-blue/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge ${CATEGORY_COLORS[featured.category] || 'badge-blue'}`}>
                  {featured.category}
                </span>
                {featured.published_at && (
                  <span className="text-xs text-gray-400">{formatDate(featured.published_at)}</span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-natif-blue transition-colors leading-snug">
                {featured.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                {featured.author && <span>{featured.author}</span>}
                {featured.view_count != null && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {featured.view_count}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Side articles */}
          <div className="space-y-4">
            {recent.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`}
                className="card group flex gap-4">
                {item.thumbnail ? (
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                    <img src={item.thumbnail} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-natif-blue/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge text-xs ${CATEGORY_COLORS[item.category] || 'badge-blue'}`}>
                      {item.category}
                    </span>
                    {item.published_at && (
                      <span className="text-xs text-gray-400">{formatDate(item.published_at)}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-gray-900 group-hover:text-natif-blue transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}

            {recent.length > 0 && (
              <Link href="/news"
                className="flex items-center justify-center gap-2 py-3 text-sm text-natif-blue hover:text-natif-blue-light font-medium border border-natif-blue/20 rounded-xl hover:bg-natif-blue/5 transition-colors">
                Xem tất cả tin tức
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
