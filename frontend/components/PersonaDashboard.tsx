'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import DashboardShell from './DashboardShell';
import { useAuth } from './AuthProvider';
import { API_BASE } from '@/lib/dashboard';
import { authFetch, type CanonicalRole } from '@/lib/auth';
import { getMenuForRole } from '@/lib/role-menus';

interface PersonaDashboardData {
  role: CanonicalRole;
  legacy_role: string;
  role_label: string;
  title: string;
  subtitle: string;
  mission: string;
  portal_path: string;
  kpis: Array<{ label: string; value: string; trend: string; tone: string }>;
  queues: Array<{ title: string; count: number; href: string; priority: string; description: string }>;
  alerts: Array<{ title: string; description: string; severity: string }>;
  quick_actions: Array<{ label: string; href: string; intent: string }>;
  demo_highlights: Array<{ title: string; body: string; metric: string }>;
  legal_pillars: string[];
}

const toneClass: Record<string, string> = {
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-100 bg-amber-50 text-amber-700',
  red: 'border-red-100 bg-red-50 text-red-700',
  purple: 'border-purple-100 bg-purple-50 text-purple-700',
  slate: 'border-slate-100 bg-slate-50 text-slate-700',
};

const severityClass: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function iconNode(name: string) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] || Icons.Circle;
  return <Icon className="h-5 w-5" />;
}

function Skeleton() {
  return <div className="p-8 grid gap-4"><div className="h-32 rounded-2xl bg-white border animate-pulse"/><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-28 rounded-2xl bg-white border animate-pulse" />)}</div></div>;
}

export default function PersonaDashboard({ roleOverride }: { roleOverride?: CanonicalRole }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PersonaDashboardData | null>(null);
  const role = roleOverride || user?.canonical_role || 'external_partner';
  const navGroups = useMemo(() => getMenuForRole(role), [role]);
  const navItems = navGroups.flatMap(group => group.items.map(item => ({ label: item.label, href: item.href || (data?.portal_path || '#'), icon: iconNode(item.icon) })));

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    authFetch(`${API_BASE}/api/dashboard/persona`).then(async res => {
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    }).catch(() => undefined);
  }, [user]);

  if (isLoading || !user) return <Skeleton />;
  if (!data) return <DashboardShell title="Không gian làm việc NATIF" role={role} navItems={navItems}><Skeleton /></DashboardShell>;

  return (
    <DashboardShell title={data.title} role={data.role} navItems={navItems} activeHref={data.portal_path}>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <section className="rounded-3xl bg-gradient-to-br from-natif-blue via-blue-800 to-slate-950 text-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 mb-4">{data.role_label}</div>
              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">{data.title}</h1>
              <p className="mt-2 text-blue-100 text-sm sm:text-base">{data.subtitle}</p>
              <p className="mt-4 text-white/90 leading-7">{data.mission}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-[260px]">
              {data.legal_pillars.map(pillar => <span key={pillar} className="rounded-xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15">{pillar}</span>)}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {data.kpis.map(kpi => <article key={kpi.label} className={`rounded-2xl border p-5 bg-white shadow-sm ${toneClass[kpi.tone] || toneClass.slate}`}>
            <div className="text-sm font-medium opacity-80">{kpi.label}</div>
            <div className="mt-3 text-3xl font-extrabold text-slate-950">{kpi.value}</div>
            <div className="mt-2 text-xs font-semibold">{kpi.trend}</div>
          </article>)}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between"><h2 className="font-heading font-bold text-slate-900">Hàng đợi công việc chuyên biệt</h2><span className="text-xs text-slate-500">Theo quyền hiện tại</span></div>
            <div className="divide-y divide-slate-100">
              {data.queues.map(queue => <a key={queue.title} href={queue.href} className="block p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-slate-900">{queue.title}</div><p className="text-sm text-slate-500 mt-1">{queue.description}</p></div><div className="text-right"><div className="text-2xl font-extrabold text-natif-blue">{queue.count}</div><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${severityClass[queue.priority] || severityClass.low}`}>{queue.priority}</span></div></div>
              </a>)}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"><h2 className="font-heading font-bold text-slate-900 mb-4">Cảnh báo nghiệp vụ</h2><div className="space-y-3">{data.alerts.map(alert => <div key={alert.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><div className="font-semibold text-sm text-slate-900">{alert.title}</div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${severityClass[alert.severity] || severityClass.medium}`}>{alert.severity}</span></div><p className="text-xs text-slate-500 mt-2 leading-5">{alert.description}</p></div>)}</div></div>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"><h2 className="font-heading font-bold text-slate-900 mb-4">Thao tác nhanh</h2><div className="grid gap-2">{data.quick_actions.map(action => <a key={action.label} href={action.href} className="rounded-xl bg-natif-blue text-white px-4 py-3 text-sm font-semibold hover:bg-blue-800 transition-colors">{action.label}</a>)}</div></div>
          </aside>
        </section>

        <section className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="font-heading font-bold text-slate-900">Dữ liệu demo nghiệp vụ phong phú</h2><span className="text-xs text-slate-500">Grants • Interest • Voucher • Startup</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{data.demo_highlights.map(item => <div key={item.title} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5"><div className="text-xs font-bold uppercase tracking-wide text-natif-blue">{item.metric}</div><div className="mt-2 font-semibold text-slate-900">{item.title}</div><p className="text-sm text-slate-500 mt-2 leading-6">{item.body}</p></div>)}</div>
        </section>
      </div>
    </DashboardShell>
  );
}
