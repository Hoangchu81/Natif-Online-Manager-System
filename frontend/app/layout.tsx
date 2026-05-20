import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NATIF - Quỹ Đổi mới công nghệ quốc gia',
    template: '%s | NATIF',
  },
  description: 'Quỹ Đổi mới công nghệ quốc gia - Hỗ trợ lãi suất vay, tài trợ đặt hàng, voucher và thúc đẩy hệ sinh thái khởi nghiệp sáng tạo cho doanh nghiệp Việt Nam.',
  keywords: ['NATIF', 'Quỹ Đổi mới công nghệ', 'hỗ trợ doanh nghiệp', 'tài trợ R&D', 'voucher công nghệ'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}
