'use client';

import { useState, useEffect, ReactNode } from 'react';
import { API_BASE, formatCurrency, formatDate, PROGRAM_LABELS } from '@/lib/dashboard';
import { authFetch } from '@/lib/auth';
import { StatusBadge } from './StatusBadge';
import WorkflowTimeline from './WorkflowTimeline';
import type { ApplicationRow } from './ApplicationsTable';

interface Review {
  id: string;
  expert_id: string;
  expert_name: string;
  assignment_id: string;
  score_innovation: number;
  score_feasibility: number;
  score_impact: number;
  score_budget: number;
  score_team: number;
  overall_score: number;
  recommendation: string;
  strengths: string;
  weaknesses: string;
  comments: string;
  submitted_at: string;
}

interface WorkflowEntry {
  id: string;
  from_status: string;
  to_status: string;
  action_by_name: string;
  action_role: string;
  notes: string;
  created_at: string;
}

interface ReviewModalProps {
  application: ApplicationRow | null;
  onClose: () => void;
  onAction?: () => void;
  actions?: Array<{
    label: string;
    status: string;
    color: string;
    confirmText?: string;
  }>;
  extraContent?: ReactNode;
  showReviewSection?: boolean;
  showWorkflowHistory?: boolean;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round((value / 10) * 100));
  let color = 'bg-green-500';
  if (value < 6) color = 'bg-red-500';
  else if (value < 7.5) color = 'bg-amber-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReviewModal({
  application,
  onClose,
  onAction,
  actions = [],
  extraContent,
  showReviewSection,
  showWorkflowHistory,
}: ReviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'reviews' | 'history'>('detail');

  useEffect(() => {
    if (!application) return;
    if (showReviewSection) {
      setLoadingReviews(true);
      authFetch(`${API_BASE}/api/reviews?application_id=${application.id}`)
        .then(r => r.json())
        .then(d => setReviews(d.data || []))
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    }
    if (showWorkflowHistory) {
      authFetch(`${API_BASE}/api/workflow/history/${application.id}`)
        .then(r => r.json())
        .then(d => setWorkflowHistory(d.data || []))
        .catch(() => {});
    }
  }, [application, showReviewSection, showWorkflowHistory]);

  if (!application) return null;

  const parseDescription = () => {
    try {
      return JSON.parse(application.description || '{}');
    } catch {
      return {};
    }
  };

  const desc = parseDescription();

  const handleAction = async (status: string) => {
    setActionLoading(status);
    try {
      const res = await authFetch(`${API_BASE}/api/workflow/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: application.id, to_status: status, notes }),
      });
      if (res.ok) {
        onAction?.();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'detail', label: 'Chi tiết' },
    ...(showReviewSection ? [{ key: 'reviews', label: `Đánh giá (${reviews.length})` }] : []),
    ...(showWorkflowHistory ? [{ key: 'history', label: 'Lịch sử' }] : []),
  ] as { key: 'detail' | 'reviews' | 'history'; label: string }[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Chi tiết hồ sơ</h2>
            <p className="text-xs text-gray-500 font-mono">#{application.id.slice(0, 8)} — {PROGRAM_LABELS[application.program_type]}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-natif-blue text-natif-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'detail' && (
            <div className="space-y-5">
              {/* Workflow timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tiến trình xử lý</h3>
                <div className="overflow-x-auto">
                  <WorkflowTimeline currentStatus={application.status} />
                </div>
              </div>

              {/* Company info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Thông tin doanh nghiệp</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Tên:</span> <span className="font-medium text-gray-900">{application.company_name}</span></div>
                  <div><span className="text-gray-500">MST:</span> <span className="font-medium text-gray-900">{application.tax_code}</span></div>
                  <div><span className="text-gray-500">Người LH:</span> <span className="font-medium text-gray-900">{application.contact_name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{application.contact_email}</span></div>
                </div>
              </div>

              {/* Project info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-heading font-semibold text-sm text-gray-700 mb-2">Dự án / Nhiệm vụ</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Tên:</span> <span className="font-medium text-gray-900">{application.title}</span></div>
                  <div><span className="text-gray-500">Số tiền:</span> <span className="font-semibold text-natif-blue">{formatCurrency(application.budget_requested)}đ</span></div>
                  <div><span className="text-gray-500">Ngày nộp:</span> <span className="font-medium text-gray-900">{formatDate(application.submitted_at || application.created_at)}</span></div>
                  {desc.loan_amount && <div><span className="text-gray-500">Số tiền vay:</span> <span className="font-medium text-gray-900">{formatCurrency(Number(desc.loan_amount))}đ</span></div>}
                  {desc.bank_name && <div><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium text-gray-900">{desc.bank_name}</span></div>}
                </div>
                {(desc.project_objectives || desc.project_content || desc.expected_results || desc.budget_breakdown) && (
                  <div className="mt-3 space-y-2">
                    {desc.project_objectives && <div><span className="text-gray-500 text-sm">Mục tiêu:</span><p className="text-gray-900 text-sm mt-0.5 whitespace-pre-line">{desc.project_objectives}</p></div>}
                    {desc.project_content && <div><span className="text-gray-500 text-sm">Nội dung:</span><p className="text-gray-900 text-sm mt-0.5 whitespace-pre-line">{desc.project_content}</p></div>}
                    {desc.expected_results && <div><span className="text-gray-500 text-sm">Kết quả dự kiến:</span><p className="text-gray-900 text-sm mt-0.5 whitespace-pre-line">{desc.expected_results}</p></div>}
                    {desc.budget_breakdown && <div><span className="text-gray-500 text-sm">Dự toán:</span><p className="text-gray-900 text-sm mt-0.5 whitespace-pre-line">{desc.budget_breakdown}</p></div>}
                  </div>
                )}
              </div>

              {/* Extra content */}
              {extraContent}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {loadingReviews ? (
                <div className="text-center py-8 text-gray-400">Đang tải đánh giá...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Chưa có đánh giá chuyên gia</div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{review.expert_name}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatDate(review.submitted_at)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        review.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                        review.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {review.recommendation === 'approve' ? '👍 Đề xuất duyệt' :
                         review.recommendation === 'reject' ? '👎 Đề xuất từ chối' : review.recommendation}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-5 gap-3">
                      <ScoreBar label="Sáng tạo" value={review.score_innovation} />
                      <ScoreBar label="Khả thi" value={review.score_feasibility} />
                      <ScoreBar label="Tác động" value={review.score_impact} />
                      <ScoreBar label="Ngân sách" value={review.score_budget} />
                      <ScoreBar label="Nhóm" value={review.score_team} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Điểm tổng: </span>
                      <span className="text-2xl font-bold text-natif-blue">{Number(review.overall_score).toFixed(1)}</span>
                      <span className="text-xs text-gray-500">/10</span>
                    </div>

                    {/* Strengths/Weaknesses */}
                    {review.strengths && (
                      <div>
                        <span className="text-sm font-medium text-green-700">Điểm mạnh:</span>
                        <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">{review.strengths}</p>
                      </div>
                    )}
                    {review.weaknesses && (
                      <div>
                        <span className="text-sm font-medium text-red-700">Điểm cần cải thiện:</span>
                        <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">{review.weaknesses}</p>
                      </div>
                    )}
                    {review.comments && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Bình luận:</span>
                        <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">{review.comments}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {workflowHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Chưa có lịch sử xử lý</div>
              ) : (
                workflowHistory.map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-natif-blue/10 text-natif-blue flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={entry.from_status} />
                        <span className="text-gray-400">→</span>
                        <StatusBadge status={entry.to_status} />
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.action_by_name} · {entry.action_role} · {formatDate(entry.created_at)}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action footer */}
        {actions.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-3 shrink-0">
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="form-input resize-none text-sm"
              placeholder="Nhập ghi chú (không bắt buộc)..."
            />
            <div className="flex gap-3">
              {actions.map(action => (
                <button
                  key={action.status}
                  onClick={() => handleAction(action.status)}
                  disabled={actionLoading !== null}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${action.color}`}
                >
                  {actionLoading === action.status ? 'Đang xử lý...' : action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
