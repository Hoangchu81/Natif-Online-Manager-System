'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${apiUrl}/api/health`);
        setStatus('API is healthy');
      } catch (error) {
        setStatus('API is unavailable');
      }
    };

    checkHealth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Natif Online Manager System</h1>
        <p className="text-xl text-gray-600 mb-8">SaaS Platform cho quản lý trực tuyến</p>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">API Status: <span className="font-mono text-green-600">{status}</span></p>
        </div>
      </div>
    </main>
  );
}
