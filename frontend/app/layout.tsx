import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Natif Online Manager System',
  description: 'SaaS Platform cho quản lý trực tuyến',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
