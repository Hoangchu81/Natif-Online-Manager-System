'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface IOOIData {
  period: string;
  period_start: string;
  period_end: string;
  input: {
    total_budget_requested: number;
    applications_received: number;
    experts_participated: number;
    council_meetings: number;
  };
  output: {
    applications_approved: number;
    approval_rate: number;
    total_disbursed: number;
    disbursement_count: number;
    avg_processing_days: number;
    rejections: number;
    total_processed: number;
  };
  outcome: {
    enterprises_supported: number;
    projects_approved: number;
    reports_submitted: number;
    reports_total: number;
    reports_overdue_rate: number;
  };
  impact: {
    jobs_created_estimated: number;
    revenue_increase_estimated: number;
    new_products: number;
    technology_transfers: number;
  };
}

function formatNumber(value: number, suffix = '') {
  return `${Number(value || 0).toLocaleString('vi-VN')}${suffix}`;
}

function MetricCard({ label, value, helper, tone = 'blue' }: { label: string; value: string; helper?: string; tone?: string }) {
  const tones: Record<string, string> = {
    blue: 'from-blue-50 to-indigo-50 text-blue-700 border-blue-100',
    green: 'from-green-50 to-emerald-50 text-green-700 border-green-100',
    amber: 'from-amber-50 to-orange-50 text-amber-700 border-amber-100',
    rose: 'from-rose-50 to-red-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${tones[tone] || tones.blue}`}>
      <div className="text-sm font-medium opacity-75 mb-2">{label}</div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      {helper && <div className="text-xs opacity-70 mt-2">{helper}</div>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </section>
  );
}

export default function ReportsPage() {
  const { isAdmin, user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<IOOIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [quarter, setQuarter] = useState('');
  const [month, setMonth] = useState('');
  const [error, setError] = useState('');

  const canView = isAdmin || ['director', 'dept_head'].includes(user?.role || '');

  const fetchIOOI = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ year });
      if (month) params.set('month', month);
      else if (quarter) params.set('quarter', quarter);

      const res = await authFetch(`${API_BASE}/api/reports/iooi?${params}`);
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Không tải được báo cáo');
        return;
      }
      setData(body);
    } catch {
      setError('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [year, quarter, month]);

  useEffect(() => {
    if (!isLoading && !canView) router.push('/login');
  }, [isLoading, canView, router]);

  useEffect(() => { if (canView) fetchIOOI(); }, [canView, fetchIOOI]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="font-heading font-bold text-gray-900">Báo cáo IOOI</h1>
              <p className="text-xs text-gray-500">Input → Output → Outcome → Impact</p>
            </div>
            <button onClick={() => router.push('/admin')} className="text-sm text-gray-500 hover:text-gray-900">
              ← Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="form-input w-28" min="2020" max="2100" />
            <select value={quarter} onChange={e => { setQuarter(e.target.value); if (e.target.value) setMonth(''); }} className="form-input w-auto">
              <option value="">Cả năm</option>
              <option value="1">Quý I</option>
              <option value="2">Quý II</option>
              <option value="3">Quý III</option>
              <option value="4">Quý IV</option>
            </select>
            <select value={month} onChange={e => { setMonth(e.target.value); if (e.target.value) setQuarter(''); }} className="form-input w-auto">
              <option value="">Theo tháng</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <button onClick={fetchIOOI} className="btn-primary py-2">Cập nhật</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">Đang tải báo cáo...</div>
        ) : data && (
          <>
            <div className="rounded-3xl bg-gradient-to-br from-natif-blue to-blue-800 p-8 text-white shadow-lg">
              <div className="text-sm opacity-80">Kỳ báo cáo</div>
              <div className="font-heading text-4xl font-bold mt-2">{data.period}</div>
              <div className="text-sm opacity-75 mt-3">
                {new Date(data.period_start).toLocaleDateString('vi-VN')} → {new Date(data.period_end).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <Section title="INPUT — Đầu vào" subtitle="Nguồn lực, hồ sơ, chuyên gia, hội đồng">
              <MetricCard label="Ngân sách đăng ký" value={formatNumber(data.input.total_budget_requested, ' tỷ')} helper="Tổng ngân sách đề nghị" tone="blue" />
              <MetricCard label="Hồ sơ tiếp nhận" value={formatNumber(data.input.applications_received)} helper="Tổng hồ sơ chưa xóa" tone="blue" />
              <MetricCard label="Chuyên gia tham gia" value={formatNumber(data.input.experts_participated)} helper="Chuyên gia được phân công" tone="blue" />
              <MetricCard label="Cuộc họp hội đồng" value={formatNumber(data.input.council_meetings)} helper="Trong kỳ báo cáo" tone="blue" />
            </Section>

            <Section title="OUTPUT — Đầu ra trực tiếp" subtitle="Phê duyệt, giải ngân, thời gian xử lý">
              <MetricCard label="Hồ sơ phê duyệt" value={formatNumber(data.output.applications_approved)} helper={`${data.output.approval_rate}% tỷ lệ phê duyệt`} tone="green" />
              <MetricCard label="Đã giải ngân" value={formatNumber(data.output.total_disbursed, ' tỷ')} helper={`${data.output.disbursement_count} đợt giải ngân`} tone="green" />
              <MetricCard label="Thời gian xử lý TB" value={formatNumber(data.output.avg_processing_days, ' ngày')} helper="Từ nộp đến xử lý" tone="amber" />
              <MetricCard label="Hồ sơ từ chối" value={formatNumber(data.output.rejections)} helper={`${data.output.total_processed} hồ sơ xử lý`} tone="rose" />
            </Section>

            <Section title="OUTCOME — Kết quả ngắn/trung hạn" subtitle="Doanh nghiệp, dự án, báo cáo định kỳ">
              <MetricCard label="Doanh nghiệp hỗ trợ" value={formatNumber(data.outcome.enterprises_supported)} helper="Distinct doanh nghiệp được duyệt" tone="green" />
              <MetricCard label="Dự án phê duyệt" value={formatNumber(data.outcome.projects_approved)} helper="Dự án approved" tone="green" />
              <MetricCard label="Báo cáo đã nộp" value={formatNumber(data.outcome.reports_submitted)} helper={`/${data.outcome.reports_total} báo cáo`} tone="blue" />
              <MetricCard label="Tỷ lệ quá hạn" value={formatNumber(data.outcome.reports_overdue_rate, '%')} helper="Báo cáo chưa nộp" tone="rose" />
            </Section>

            <Section title="IMPACT — Tác động dài hạn" subtitle="Chỉ số ước tính cần bổ sung từ báo cáo dự án">
              <MetricCard label="Việc làm tạo ra" value={formatNumber(data.impact.jobs_created_estimated)} tone="amber" />
              <MetricCard label="Doanh thu tăng thêm" value={formatNumber(data.impact.revenue_increase_estimated, ' tỷ')} tone="amber" />
              <MetricCard label="Sản phẩm mới" value={formatNumber(data.impact.new_products)} tone="amber" />
              <MetricCard label="Chuyển giao CN" value={formatNumber(data.impact.technology_transfers)} tone="amber" />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
