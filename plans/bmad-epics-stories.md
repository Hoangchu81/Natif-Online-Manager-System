# BMAD Epics & Stories — NATIF OMS v2.0

## Epic 1: Foundation & Code Quality

Chuẩn hóa codebase, shared components, typed API client.

### E1-S01: Typed API Client

- Create `frontend/lib/api.ts` with typed functions for all endpoints.
- Replace all raw `authFetch` calls in pages with typed client.
- AC: No direct fetch calls in page components. All API calls go through typed client.

### E1-S02: Shared ApplicationTable Component

- Extract table rendering from clerk, officer, dept_head, director pages into reusable `ApplicationTable`.
- Props: columns config, actions config, data, loading state.
- AC: All 4 role pages use shared component. No duplicate table markup.

### E1-S03: Migrate Admin Page to DashboardShell

- Refactor `frontend/app/admin/page.tsx` to use DashboardShell with sidebar nav.
- Add nav items: Dashboard, Users, News, Reports, Menu.
- Fix legacy status labels to match current workflow states.
- AC: Admin page uses DashboardShell. Status filter shows correct workflow states.

### E1-S04: API Response Envelope

- Standardize all backend responses to `{ data, pagination?, error? }` format.
- Add shared error handler middleware.
- AC: All routes return consistent envelope. Error responses include error field.

### E1-S05: TypeScript Strict Mode

- Enable strict mode in both tsconfig files.
- Fix all resulting type errors.
- AC: `npm run typecheck` passes with strict: true.

---

## Epic 2: Post-Approval Financial Lifecycle

Giải ngân, báo cáo tiến độ, giám sát dự án.

### E2-S01: Disbursements Migration & API

- Create migration 009: disbursements table.
- Add CRUD routes: POST/GET/PUT disbursements.
- Roles: admin, director can create; enterprise can view own.
- AC: Disbursement CRUD works. Reports IOOI queries return real data.

### E2-S02: Project Reports Migration & API

- Create migration 010: project_reports table.
- Add routes: enterprise submits, officer/dept_head reviews.
- AC: Enterprise can submit periodic reports. Staff can approve/reject.

### E2-S03: Disbursement Dashboard UI

- Add disbursement section to director and admin dashboards.
- Show: total disbursed, by program, by period.
- AC: Director sees disbursement stats. Can create new disbursement for approved app.

### E2-S04: Project Report UI

- Enterprise dashboard: submit report form with period selector.
- Officer/dept_head: review submitted reports.
- AC: Full report submission and review flow works end-to-end.

---

## Epic 3: Security & Audit

### E3-S01: Audit Log Table & Middleware

- Create migration 011: audit_logs table.
- Add audit middleware that logs all POST/PUT/DELETE/PATCH requests.
- AC: All mutating actions logged with user_id, action, resource, IP.

### E3-S02: JWT httpOnly Cookie

- Backend: set JWT in httpOnly secure cookie on login/register.
- Frontend: remove localStorage token storage, use cookie-based auth.
- Keep Authorization header as fallback.
- AC: Token not accessible via JS. Auth works via cookie.

### E3-S03: Object-Level Permission Audit

- Review all routes for proper ownership/assignment checks.
- Add missing checks (e.g., officer can only see assigned apps).
- AC: No route allows access to resources outside user scope.

### E3-S04: Input Validation Hardening

- Add Zod schemas for all remaining routes without validation.
- Ensure file upload validates type/size.
- AC: All POST/PUT routes have validation. Invalid input returns 400.

---

## Epic 4: UX Polish

### E4-S01: Loading/Error/Empty States

- Add skeleton loaders to all dashboard tables.
- Add error boundary with retry.
- Add meaningful empty states with action prompts.
- AC: No raw "Đang tải..." text. All states have proper UI.

### E4-S02: Application Detail Modal/Page

- Create shared application detail view with: info, workflow timeline, documents, reviews, notes.
- Replace simple alert-based modals with proper dialog.
- AC: Clicking any application shows full detail with all related data.

### E4-S03: Notification Center

- Improve notification page with read/unread filtering, pagination.
- Add real-time badge update (polling or SSE).
- AC: User sees unread count in header. Notification page is functional.

### E4-S04: Responsive Mobile Layout

- DashboardShell: collapsible sidebar on mobile.
- Tables: card view on small screens.
- AC: All role dashboards usable on 375px width.

---

## Epic 5: Testing & CI

### E5-S01: Backend Unit Tests

- Add tests for auth, workflow transitions, applications CRUD.
- Target: 70% coverage on routes.
- AC: `npm run test:coverage` shows > 70% on src/routes.

### E5-S02: Frontend Component Tests

- Add vitest + testing-library tests for key components.
- Test: DashboardShell, ApplicationTable, StatusBadge, auth flow.
- AC: `npm run test` passes with component tests.

### E5-S03: E2E Workflow Test

- Add Playwright test: enterprise submits → clerk receives → director assigns → officer reviews → approved.
- AC: Full workflow E2E test passes in CI.

### E5-S04: CI Pipeline Enhancement

- Add typecheck, lint, test steps to GitHub Actions.
- Block merge on failure.
- AC: PR cannot merge with failing checks.

---

## Epic 6: Operations & Deploy

### E6-S01: Migration Runner on Deploy

- Ensure migrations run automatically on container start.
- Add migration verification in health check.
- AC: Deploy triggers migrations. Health check confirms DB schema version.

### E6-S02: Admin Bootstrap Seed

- Create seed script for first admin user + sample programs.
- Run on first deploy only.
- AC: Fresh deploy has working admin account and program data.

### E6-S03: Backup & Monitoring

- Add pg_dump cron script.
- Add basic uptime monitoring endpoint.
- Document backup/restore procedure.
- AC: Daily backup runs. Monitoring endpoint returns DB/API status.

### E6-S04: Environment Configuration

- Document all env vars with descriptions.
- Add .env.production.example.
- Validate required env vars on startup.
- AC: Missing required env var causes clear error on boot.

---

## Priority Order

1. Epic 1 (Foundation) — unblocks all other work.
2. Epic 3 (Security) — critical for production.
3. Epic 4 (UX) — user-facing improvements.
4. Epic 2 (Financial) — new features.
5. Epic 5 (Testing) — quality gate.
6. Epic 6 (Operations) — production readiness.
