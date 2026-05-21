'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Assignment {
  id: string;
  application_id: string;
  application_title: string;
  company_name: string;
  program_type: string;
  budget_requested: number;
  application_status: string;
  status: string;
  deadline?: string;
}

export default function AssignmentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    score_innovation: 5,
    score_feasibility: 5,
    score_impact: 5,
    score_budget: 5,
    score_team: 5,
    recommendation: '' as string,
    strengths: '',
    weaknesses: '',
    comments: '',
  });

  const overallScore = (
    (form.score_innovation + form.score_feasibility + form.score_impact + form.score_budget + form.score_team) / 5
  ).toFixed(1);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const assignRes = await authFetch(`${API_BASE}/api/assignments?status=accepted`);
      if (assignRes.ok) {
        const data = await assignRes.json();
        const found = data.data?.find((a: any) => a.id === params.id);
        if (!found) {
          const completedRes = await authFetch(`${API_BASE}/api/assignments?status=completed`);
          if (completedRes.ok) {
            const cData = await completedRes.json();
            const cFound = cData.data?.find((a: any) => a.id === params.id);
            if (cFound) setAssignment(cFound);
          }
        } else {
          setAssignment(found);
        }
      }

      const reviewRes = await authFetch(`${API_BASE}/api/reviews`);
      if (reviewRes.ok) {
        const rData = await reviewRes.json();
        const review = rData.data?.find((r: any) => r.assignment_id === params.id);
        if (review) {
          setExistingReview(review);
          setForm({
            score_innovation: review.score_innovation,
            score_feasibility: review.score_feasibility,
            score_impact: review.score_impact,
            score_budget: review.score_budget,
            score_team: review.score_team,
            recommendation: review.recommendation,
            strengths: review.strengths || '',
            weaknesses: review.weaknesses || '',
            comments: review.comments || '',
          });
        }
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recommendation) {
      setMessage('Vui lòng chọn đề xuất');
      return;
    }
    if (!confirm('Sau khi gửi đánh giá, bạn sẽ không thể chỉnh sửa. Tiếp tục?')) return;

    setSubmitting(true);
    setMessage('');
    try {
      const res = await authFetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          assignment_id: params.id,
          application_id: assignment?.application_id,
          ...form,
        }),
      });
      if (res.ok) {
        setMessage('Đã gửi đánh giá thành công!');
        setTimeout(() => router.push('/expert/assignments'), 1500);
      } else {
        const err = await res.json();
        setMessage(err.error || 'Có lỗi xảy ra');
      }
    } catch {
      setMessage('Không thể kết nối server');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-gray-500 py-12 text-center">Đang tải...</div>;
  if (!assignment) return <div className="text-gray-500 py-12 text-center">Không tìm thấy đề tài</div>;

  const isReadOnly = !!existingReview;

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push('/expert/assignments')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
          ← Quay lại danh sách
        </button>
        <h1 className="text-xl font-heading font-bold text-gray-900">Phiếu đánh giá phản biện</h1>
      </div>

      {/* Application info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-heading font-semibold text-gray-800 mb-4">Thông tin đề tài</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tên đề tài:</span> <span className="font-medium text-gray-900">{assignment.application_title}</span></div>
          <div><span className="text-gray-500">Doanh nghiệp:</span> <span className="font-medium text-gray-900">{assignment.company_name}</span></div>
          <div><span className="text-gray-500">Chương trình:</span> <span className="font-medium text-gray-900">{assignment.program_type}</span></div>
          <div><span className="text-gray-500">Ngân sách yêu cầu:</span> <span className="font-medium text-gray-900">{Number(assignment.budget_requested).toLocaleString('vi-VN')} VNĐ</span></div>
          {assignment.deadline && <div><span className="text-gray-500">Hạn đánh giá:</span> <span className="font-medium text-gray-900">{new Date(assignment.deadline).toLocaleDateString('vi-VN')}</span></div>}
        </div>
      </section>

      {/* Review form */}
      <form onSubmit={handleSubmit}>
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Chấm điểm (thang 1-10)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'score_innovation', label: 'Tính mới/sáng tạo' },
              { key: 'score_feasibility', label: 'Tính khả thi' },
              { key: 'score_impact', label: 'Tác động KT-XH' },
              { key: 'score_budget', label: 'Hợp lý ngân sách' },
              { key: 'score_team', label: 'Năng lực đội ngũ' },
            ].map(item => (
              <div key={item.key}>
                <label className="form-label">{item.label}</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="form-input"
                  value={(form as any)[item.key]}
                  onChange={e => setForm({ ...form, [item.key]: parseInt(e.target.value) || 1 })}
                  disabled={isReadOnly}
                />
              </div>
            ))}
            <div>
              <label className="form-label">Điểm tổng</label>
              <div className="form-input bg-gray-50 font-bold text-natif-blue">{overallScore} / 10</div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Đề xuất</h2>
          <div className="flex gap-4 mb-4">
            {[
              { value: 'approve', label: 'Phê duyệt', color: 'bg-green-50 border-green-300 text-green-700' },
              { value: 'revise', label: 'Yêu cầu chỉnh sửa', color: 'bg-amber-50 border-amber-300 text-amber-700' },
              { value: 'reject', label: 'Từ chối', color: 'bg-red-50 border-red-300 text-red-700' },
            ].map(opt => (
              <label key={opt.value} className={`flex-1 text-center py-3 rounded-lg border-2 cursor-pointer transition-all ${
                form.recommendation === opt.value ? opt.color + ' border-current' : 'bg-gray-50 border-gray-200 text-gray-600'
              } ${isReadOnly ? 'pointer-events-none' : ''}`}>
                <input
                  type="radio"
                  name="recommendation"
                  value={opt.value}
                  checked={form.recommendation === opt.value}
                  onChange={e => setForm({ ...form, recommendation: e.target.value })}
                  className="sr-only"
                  disabled={isReadOnly}
                />
                <span className="font-medium text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Nhận xét chi tiết</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Điểm mạnh</label>
              <textarea className="form-input resize-none" rows={3} value={form.strengths}
                onChange={e => setForm({ ...form, strengths: e.target.value })} disabled={isReadOnly} />
            </div>
            <div>
              <label className="form-label">Điểm yếu / Hạn chế</label>
              <textarea className="form-input resize-none" rows={3} value={form.weaknesses}
                onChange={e => setForm({ ...form, weaknesses: e.target.value })} disabled={isReadOnly} />
            </div>
            <div>
              <label className="form-label">Ý kiến khác</label>
              <textarea className="form-input resize-none" rows={3} value={form.comments}
                onChange={e => setForm({ ...form, comments: e.target.value })} disabled={isReadOnly} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {!isReadOnly && (
            <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-6 disabled:opacity-60">
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          )}
          {isReadOnly && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
              Đã gửi đánh giá lúc {existingReview.submitted_at ? new Date(existingReview.submitted_at).toLocaleString('vi-VN') : ''}
            </div>
          )}
          {message && (
            <span className={`text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
