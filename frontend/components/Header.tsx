'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const FALLBACK_NAV = [
  { id: '1', label: 'Trang chủ', url: '/', position: 'header', sort_order: 0, is_active: true, icon: '' },
  { id: '2', label: 'Giới thiệu', url: '/about', position: 'header', sort_order: 1, is_active: true, icon: '' },
  { id: '3', label: 'Chương trình', url: '/programs', position: 'header', sort_order: 2, is_active: true, icon: '' },
  { id: '4', label: 'Tin tức', url: '/news', position: 'header', sort_order: 3, is_active: true, icon: '' },
  { id: '5', label: 'Liên hệ', url: '/contact', position: 'header', sort_order: 4, is_active: true, icon: '' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState(FALLBACK_NAV);

  useEffect(() => {
    fetch(`${API_BASE}/api/menus?position=header`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data?.length > 0) {
          setNavItems(data.data);
        }
      })
      .catch(() => {/* use fallback */});
  }, []);

  const activeNav = navItems
    .filter(i => i.is_active && i.position === 'header')
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-header">
      {/* Top bar */}
      <div className="bg-natif-blue text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Quỹ Đổi mới công nghệ quốc gia</span>
            <span className="sm:hidden">NATIF</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:0913060581" className="hidden sm:flex items-center gap-1.5 hover:opacity-80">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0913.060.581
            </a>
            <span className="hidden md:inline text-white/70">|</span>
            <a href="mailto:info@natif.vn" className="hidden md:flex items-center gap-1.5 hover:opacity-80">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@natif.vn
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/natif-logo.svg" alt="NATIF" className="w-14 h-14 object-contain" />
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-lg text-gray-900 leading-tight">NATIF</div>
              <div className="text-[10px] text-gray-500 leading-tight tracking-wide">Quỹ Đổi mới công nghệ quốc gia</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {activeNav.map((item) => (
              <Link
                key={item.id}
                href={item.url.startsWith('http') ? item.url : item.url}
                {...(item.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="nav-link"
              >
                {item.icon ? <span className="mr-1">{item.icon}</span> : null}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-natif-blue hover:bg-blue-50 transition-colors">
              Đăng nhập
            </Link>
            <Link href="/apply" className="btn-primary text-sm py-2 px-5">
              Nộp hồ sơ
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {activeNav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                {...(item.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-natif-blue rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.icon ? <span className="mr-1">{item.icon}</span> : null}
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2 px-4">
              <Link href="/login" className="block py-2 text-sm font-medium text-natif-blue">
                Đăng nhập
              </Link>
              <Link href="/apply" className="btn-primary text-sm w-full justify-center">
                Nộp hồ sơ
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
