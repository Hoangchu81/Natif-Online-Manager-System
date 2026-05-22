# NATIF Online Manager System

## Domain
Hệ thống quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF).
Trang: https://oms.techfair.vn
VPS: 161.33.2.207

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, Axios
- **Backend**: Express.js 4, TypeScript (ESM), PostgreSQL 16, JWT auth (jsonwebtoken), bcryptjs, Zod
- **Deployment**: Docker, PM2, Nginx + SSL (Certbot), VPS ubuntu

## Project Structure
```
backend/src/
  server.ts           — Express app entry
  config/database.ts  — pg.Pool connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
  middleware/
    auth.ts           — JWT auth + requireRole/requireAdmin/requireExpert
    rateLimiter.ts    — 3 limiters: general(200/15min), auth(20/15min), search(60/15min)
    validate.ts       — Zod schema validation
    audit.ts          — Audit logging middleware
  routes/
    auth.ts, applications.ts, programs.ts, news.ts, dashboard.ts
    expert.ts, assignments.ts, reviews.ts, workflow.ts
  validators/index.ts  — All Zod schemas
  types/index.ts      — TypeScript interfaces
  test/               — Vitest + Supertest + Playwright tests
frontend/
  app/                — Next.js 14 App Router pages
  components/         — Reusable UI components
  tailwind.config.ts  — Custom natif theme (natif.blue #1f3892)
```

## User Roles (8 roles)
admin, moderator, enterprise, expert, officer, dept_head, director, clerk

## Application Workflow State Machine
draft → submitted → received → assigned → preliminary_review → expert_review → summarized → dept_approved|dept_rejected → approved|rejected

## Programs (4 types)
interest_subsidy, sponsorship, voucher, ecosystem

## Key Patterns
- **Expert CRUD**: Factory pattern via `createCrudHandlers` (7 sub-tables)
- **Middleware pipeline**: helmet → cors → rateLimiter → validate → authenticate → requireRole
- **Database**: No migration tool — manual schema changes in `/backend/src/scripts/setup-db.ts`
- **Auth**: JWT shared secret from env, 8h expiry, bcryptjs password hashing

## When working on this codebase
- ALWAYS run /security-review before committing auth, role, or data-handling changes
- Use /tdd or /tdd-workflow for new features
- Use /database-migrations when changing schema (NOT setup-db.ts)
- Production deploy: use /to-prd checklist
- Check agentmemory for past decisions: /recall "workflow engine"
- Before adding middleware: consider audit.ts and rateLimiter.ts first
- Check /design-system before adding new UI components
