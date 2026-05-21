'use client';

import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/lib/auth';
import FormModal, { type FieldDef } from './FormModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface CrudTableProps {
  title: string;
  apiPath: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
}

export default function CrudTable({ title, apiPath, fields, columns }: CrudTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/expert/${apiPath}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(formData: Record<string, any>) {
    const url = editItem
      ? `${API_BASE}/api/expert/${apiPath}/${editItem.id}`
      : `${API_BASE}/api/expert/${apiPath}`;
    const method = editItem ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, body: JSON.stringify(formData) });
    if (res.ok) {
      setShowModal(false);
      setEditItem(null);
      fetchData();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
    const res = await authFetch(`${API_BASE}/api/expert/${apiPath}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-gray-900">{title}</h1>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="btn-primary py-2 px-4 text-sm"
        >
          + Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">STT</th>
                {columns.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col.label}
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-400">Đang tải...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditItem(row); setShowModal(true); }}
                          className="text-natif-blue hover:text-natif-blue/80"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <FormModal
          title={editItem ? `Sửa` : `Thêm mới`}
          fields={fields}
          data={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}
