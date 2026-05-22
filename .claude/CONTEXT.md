# NATIF OMS Domain Language

## User Roles
- `admin` — full system access
- `moderator` — content moderation
- `enterprise` — applicant organization
- `expert` — external reviewer
- `officer` — NATIF staff, processes applications
- `dept_head` — department head approval
- `director` — final approval
- `clerk` — data entry

## Programs
- `interest_subsidy` — lãi suất ưu đãi vay vốn
- `sponsorship` — tài trợ/đặt hàng R&D
- `voucher` — phiếu hỗ trợ doanh nghiệp
- `ecosystem` — hỗ trợ hệ sinh thái đổi mới

## Application Lifecycle
- "materialization" — khi application chuyển sang status mới trong workflow
- "assignment" — expert được assign vào một application để review
- "review" — expert review với 5 scoring dimensions (1-10)

## Expert Profile Sections (7 sub-tables)
education, work_history, research_projects, publications, patents, awards, books

## Workflow States (11 steps)
draft, submitted, received, assigned, preliminary_review, expert_review, summarized, dept_approved, dept_rejected, approved, rejected

## Tech Decisions
- Chọn `jsonwebtoken` (backend) thay vì `jose` vì dùng trong Express middleware
- Zod validation cho tất cả request
- Rate limiter: general(200/15min), auth(20/15min), search(60/15min)
- Không dùng migration tool — schema changes cần manual tracking
- UI: raw Tailwind CSS + shadcn/ui components (migrating from raw HTML)
- Charts: Recharts
- Data tables: TanStack Table
- Forms: react-hook-form + Zod
- Toast: Sonner (replacing alert())
