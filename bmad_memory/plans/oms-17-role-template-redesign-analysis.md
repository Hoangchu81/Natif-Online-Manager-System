# OMS NATIF — Frontend/Backend Template Redesign Analysis

## Scope

Analyze current `oms.natif.vn` frontend/backend template system and redesign direction for 17 specialized user personas with shared minimum features, professional UI, synchronized menu structure, richer demo content.

## Current Findings

### Frontend

- `DashboardShell` exists but is thin: sidebar, role badge, header, logout only.
- `RoleDashboard` is generic placeholder and still says detailed functions are under development.
- `frontend/lib/dashboard.ts` still exposes only 8 legacy role labels/colors.
- `frontend/lib/auth.ts` has 17 canonical roles but routes collapse multiple roles into old pages.
- Role pages are uneven: admin/director/dept-head/officer/clerk/moderator have custom code; finance/legal/auditor/sysadmin/data-ai/devsecops/startup-voucher lack dedicated portals.
- Menu is mostly static/hardcoded per page; no central role-menu registry.
- UX pattern is not synchronized: duplicated tables, duplicated filters, inconsistent alert/error handling, no shared role home template.
- Demo data is sparse and operationally generic, not tailored to legal pillars: grants/orders, interest support, voucher, startup ecosystem.

### Backend

- `backend/src/types/roles.ts` defines 17 canonical roles and mappings.
- `backend/src/routes/dashboard.ts` provides generic global/user stats only.
- Role-specific KPI endpoints are missing for finance, legal, auditor, IT support, AI/data, voucher/startup, council, partner/bank/vendor.
- Permission registry exists in architecture but API use still mainly legacy role compatibility.
- Backend routes expose workflow/application primitives but not a unified persona dashboard API contract.

## Design Diagnosis

The system is halfway migrated: identity/RBAC model recognizes 17 canonical personas, but frontend IA and backend dashboards still operate as 8 legacy portals. This causes visual inconsistency, weak navigation depth, missing persona-specific workflows, and insufficient professional demo realism.

## Target Information Architecture

### Shared Minimum Features for All Roles

1. Home dashboard with KPIs, workload, alerts, next actions.
2. Notifications/inbox.
3. Profile/account/security.
4. Search/filter over allowed entities.
5. Help/support center.
6. Audit/activity history where authorized.
7. Document preview/download where authorized.
8. Vietnamese administrative copy, consistent state badges, empty/loading/error states.

### 17 Specialized Portal Designs

| Role | Portal | Specialized functions |
|---|---|---|
| chief_system_architect | `/admin/architecture` | System blueprint, schema/API registry, module dependency map, release governance |
| fullstack_developer | `/admin/development` | Feature backlog, deployment checklist, API health, UI component catalog |
| devsecops_security | `/admin/security` | RBAC matrix, audit alerts, vulnerability queue, session/device monitoring |
| data_ai_scientist | `/admin/data-ai` | IOOI reports, model insights, KPI pipeline, anomaly detection |
| natif_executive | `/executive` | Executive KPI board, final approvals, digital signature queue, strategic portfolio |
| department_manager | `/dept-head` | Assignment, staff workload, council creation, department decision summaries |
| grants_orders_specialist | `/grants-orders` | Grants/orders dossiers, document validation, synthesis, council coordination |
| voucher_startup_specialist | `/voucher-startup` | Voucher marketplace, vendor verification, Techfest/startup KPIs |
| finance_disbursement | `/finance` | Budget appraisal, disbursement plan, interest support calculations, treasury status |
| legal_risk_control | `/legal-risk` | Duplicate funding checks, contract generation, compliance exceptions |
| admin_desk | `/clerk` | Reception/OCR queue, routing, completeness check, incoming/outgoing logs |
| it_sysadmin_support | `/admin/it-support` | System health, tickets, incidents, user recovery, SLA dashboard |
| scientific_council | `/councils` | Council sessions, voting/scoring, consensus, minutes |
| independent_expert | `/expert` | Blind review assignments, scoring forms, CV completeness |
| financial_appraiser | `/financial-appraisal` | Budget norms matrix, cost reasonableness, appraisal opinions |
| independent_auditor | `/auditor` | Read-only audit, log export, compliance sampling, data room |
| external_partner | `/apply/dashboard` | Applications, contracts, reports, bank/vendor/voucher redemption flows |

## Role Menu Blueprint

### Common menu group

- Tổng quan
- Công việc cần xử lý
- Thông báo
- Hồ sơ cá nhân
- Trợ giúp

### Internal specialized groups

- Quản trị hệ thống: users, roles, menus, health, audit logs.
- Nghiệp vụ hồ sơ: reception, routing, assignments, review, council, decisions.
- Tài chính/pháp lý: appraisal, contracts, disbursement, duplicate risk.
- Báo cáo dữ liệu: executive reports, IOOI, exports.

### External specialized groups

- Hồ sơ của tôi
- Nộp hồ sơ mới
- Hợp đồng/giải ngân
- Báo cáo định kỳ
- Voucher/đối tác/ngân hàng, if applicable

## Frontend Refactor Blueprint

1. Add `frontend/lib/roles.ts`: canonical role metadata, labels, groups, dashboard paths, legacy mapping.
2. Add `frontend/lib/role-menus.ts`: centralized menu registry per role plus shared menu entries.
3. Upgrade `DashboardShell`:
   - role-aware menu groups,
   - breadcrumb,
   - global search,
   - notification area,
   - mobile sidebar,
   - workspace switcher for partner subtypes.
4. Create reusable role dashboard modules:
   - `RoleKpiGrid`, `WorkQueuePanel`, `ComplianceAlertPanel`, `DemoInsightPanel`, `QuickActionGrid`, `PersonaHero`.
5. Replace placeholder `RoleDashboard` with data-driven `PersonaDashboard`.
6. Add dedicated routes for currently missing personas.
7. Create rich demo data generator/fixtures mapped to each role and 4 legal pillars.
8. Remove duplicated per-role table/filter/action code by extracting shared workflow components.

## Backend API Blueprint

### New endpoints

- `GET /api/me/portal` → current role, permissions, menu, dashboard path.
- `GET /api/dashboard/persona` → role-specific KPIs, queues, alerts, demo insights.
- `GET /api/permissions/matrix` → admin/security roles only.
- `GET /api/work-queues` → role-filtered work items.
- `GET /api/audit/summary` → security/auditor/sysadmin.
- `GET /api/reports/executive` → executive/data-ai roles.

### Data contract

```ts
interface PersonaDashboardResponse {
  role: CanonicalRole;
  title: string;
  summary: string;
  kpis: Array<{ label: string; value: string | number; trend?: string; tone?: string }>;
  queues: Array<{ id: string; title: string; count: number; href: string; priority: 'low' | 'medium' | 'high' | 'critical' }>;
  alerts: Array<{ title: string; description: string; severity: string }>;
  quick_actions: Array<{ label: string; href: string; intent: string }>;
  demo_highlights: Array<{ title: string; body: string; metric?: string }>;
}
```

## Rich Demo Content Model

Demo content must cover:

1. Grants/orders: research grants, state technology orders, council scoring, final approval.
2. Interest support: bank debt notices, eligible interest rate calculation, treasury disbursement.
3. Voucher: vendor marketplace, voucher issuance/redemption, vendor payout.
4. Startup ecosystem: Techfest events, incubation milestones, startup KPI monitoring.

Each role should see realistic Vietnamese records, dates, budgets, legal state labels, responsible departments, risks, next action, document checklist.

## Visual Design Direction

- Government-grade clean design: white/blue/navy, restrained amber/red status accents.
- Dense but readable enterprise dashboards.
- Card hierarchy: executive KPIs, queue cards, document/action panels.
- Consistent badges for workflow, risk, deadline, approval authority.
- Professional Vietnamese administrative wording.
- No raw `alert()`; use toast/dialog with actionable guidance.

## Implementation Priority

1. Centralize role metadata and role-menu registry.
2. Upgrade shell and shared dashboard components.
3. Implement persona dashboard API fallback with rich demo data.
4. Add missing 9 persona routes with specialized menus/content.
5. Refactor existing 8 pages to use shared components.
6. Expand backend permission/dashboard APIs.
7. Add tests for role routing/menu visibility/API authorization.

## Acceptance Criteria

- 17 canonical roles have distinct dashboard path, menu, KPIs, queues, quick actions.
- Shared minimum features appear consistently across all roles.
- Legacy 8-role compatibility still works.
- Demo data covers all 4 legal pillars.
- FE and BE dashboard contracts are aligned.
- No page shows generic “Đang phát triển” as primary content.
- Role pages use one visual system, responsive at 375px.
