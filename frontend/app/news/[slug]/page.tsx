import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface PageProps {
  params: { slug: string };
}

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/news/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelated(id: string, category: string) {
  try {
    const res = await fetch(`${API_BASE}/api/news/${id}/related?category=${category}&limit=3`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/news-categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Không tìm thấy bài viết | NATIF' };

  return {
    title: `${article.title} | NATIF`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
      type: 'article',
      publishedTime: article.published_at,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const [article, categories] = await Promise.all([
    getArticle(params.slug),
    getCategories(),
  ]);

  if (!article) notFound();

  const related = await getRelated(article.id, article.category);

  const categoryInfo = categories.find((c: any) => c.slug === article.category);
  const categoryName = categoryInfo?.name || article.category;

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/" className="hover:text-natif-blue transition-colors">Trang chủ</a>
              <span>/</span>
              <a href="/news" className="hover:text-natif-blue transition-colors">Tin tức</a>
              <span>/</span>
              <a href={`/news?category=${article.category}`} className="hover:text-natif-blue transition-colors">
                {categoryName}
              </a>
              <span>/</span>
              <span className="text-gray-700 truncate max-w-xs">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Image */}
        {article.thumbnail && (
          <div className="w-full bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full object-cover rounded-b-2xl"
                style={{ maxHeight: '480px' }}
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            {/* Category badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-natif-blue/10 text-natif-blue">
                {categoryName}
              </span>
              {article.is_featured && (
                <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  Nổi bật
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {publishedDate}
                </span>
              )}
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {article.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Claude Opus 4.6 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.view_count || 0} lượt xem
              </span>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-6 text-lg text-gray-600 leading-relaxed font-medium border-l-4 border-natif-blue pl-4 italic">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Article Content */}
            <article className="flex-1 min-w-0">
              {article.content ? (
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-natif-blue prose-headings:font-bold
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-natif-blue prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full
                    prose-blockquote:border-l-natif-blue prose-blockquote:text-gray-600
                    prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:text-gray-100
                    prose-ul:list-disc prose-ol:list-decimal
                    prose-li:text-gray-700
                    prose-table:border prose-table:border-gray-200
                    prose-th:bg-natif-blue prose-th:text-white prose-th:px-4 prose-th:py-2
                    prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-100"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  Nội dung đang được cập nhật.
                </div>
              )}

              {/* Social Share */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500">Chia sẻ:</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://oms.natif.vn/news/${params.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    aria-label="Chia sẻ Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=https://oms.natif.vn/news/${params.slug}&title=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                    aria-label="Chia sẻ LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://oms.natif.vn/news/${params.slug}`)}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Sao chép liên kết"
                    title="Sao chép liên kết"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* JSON-LD */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'NewsArticle',
                    headline: article.title,
                    description: article.excerpt || '',
                    image: article.thumbnail || '',
                    datePublished: article.published_at,
                    author: { '@type': 'Person', name: article.author || 'NATIF' },
                    publisher: { '@type': 'Organization', name: 'NATIF', url: 'https://oms.natif.vn' },
                    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://oms.natif.vn/news/${params.slug}` },
                  }),
                }}
              />
            </article>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">

                {/* Related Articles */}
                {related.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-natif-blue text-white px-5 py-3 font-heading font-bold text-sm">
                      Bài viết liên quan
                    </div>
                    <div className="divide-y divide-gray-100">
                      {related.map((item: any) => (
                        <a key={item.id} href={`/news/${item.slug}`} className="flex gap-3 p-4 hover:bg-gray-50 transition-colors group">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                          ) : (
                            <div className="w-20 h-14 bg-natif-blue/10 rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-6 h-6 text-natif-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 group-hover:text-natif-blue transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            {item.published_at && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-800 text-white px-5 py-3 font-heading font-bold text-sm">
                      Danh mục tin
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat: any) => (
                          <a
                            key={cat.slug}
                            href={`/news?category=${cat.slug}`}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              cat.slug === article.category
                                ? 'bg-natif-blue text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-natif-blue hover:text-white'
                            }`}
                          >
                            {cat.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gov-gradient text-white rounded-xl p-6">
                  <h3 className="font-heading font-bold text-lg mb-2">Nộp hồ sơ tài trợ</h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    Quỹ Đổi mới công nghệ quốc gia hỗ trợ doanh nghiệp đổi mới sáng tạo.
                  </p>
                  <a
                    href="/apply"
                    className="inline-flex items-center gap-2 bg-white text-natif-blue font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors w-full justify-center"
                  >
                    Nộp hồ sơ ngay
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
