'use client';

import { formatCurrency, formatDate, PROGRAM_LABELS, PROGRAM_COLORS } from '@/lib/dashboard';
import { StatusBadge } from './StatusBadge';
import { SimpleWorkflowBadge } from './WorkflowTimeline';

export interface ApplicationRow {
  id: string;
  program_type: string;
  company_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  title: string;
  description?: string;
  budget_requested: number;
  status: string;
  submitted_at?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  [key: string]: unknown;
}

interface ApplicationsTableProps {
  applications: ApplicationRow[];
  loading?: boolean;
  emptyMessage?: string;
  showWorkflowProgress?: boolean;
  onRowClick?: (app: ApplicationRow) => void;
  rowAction?: (app: ApplicationRow) => React.ReactNode;
  selectedId?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  extraFilters?: React.ReactNode;
}

export default function ApplicationsTable({
  applications,
  loading,
  emptyMessage = 'Không có hồ sơ nào',
  showWorkflowProgress,
  onRowClick,
  rowAction,
  selectedId,
  searchPlaceholder = 'Tìm kiếm theo tên, MST, dự án...',
  searchValue,
  onSearchChange,
  extraFilters,
}: ApplicationsTableProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      {(onSearchChange || extraFilters) && (
        <div className="flex flex-wrap items-center gap-3">
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="form-input flex-1 min-w-[200px]"
            />
          )}
          {extraFilters}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">STT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Doanh nghiệp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Chương trình</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dự án</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                {showWorkflowProgress && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tiến trình</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày nộp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tải...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">{emptyMessage}</td>
                </tr>
              ) : (
                applications.map((app, idx) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === app.id ? 'bg-natif-blue/5' : ''}`}
                    onClick={() => onRowClick?.(app)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{app.company_name}</div>
                      <div className="text-xs text-gray-500">{app.tax_code}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`badge ${PROGRAM_COLORS[app.program_type] || 'badge-gray'}`}>
                        {PROGRAM_LABELS[app.program_type] || app.program_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-[180px] truncate">{app.title}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(app.budget_requested)}đ
                    </td>
                    {showWorkflowProgress && (
                      <td className="px-4 py-3 hidden lg:table-cell w-32">
                        <SimpleWorkflowBadge currentStatus={app.status} />
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {rowAction ? rowAction(app) : (
                        <button
                          onClick={() => onRowClick?.(app)}
                          className="text-sm text-natif-blue hover:underline"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
