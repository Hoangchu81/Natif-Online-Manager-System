# NATIF OMS — Master Account & Email Architecture

## Decision

oms.natif.vn account system → upgraded from 8 flat roles to 17 governed personas with RBAC, invitation, profile state, audit, notification matrix, delivery logging.

## Current baseline

- Backend auth: JWT + bcrypt in [`backend/src/routes/auth.ts`](../../backend/src/routes/auth.ts)
- RBAC middleware: [`backend/src/middleware/auth.ts`](../../backend/src/middleware/auth.ts)
- User type: [`backend/src/types/index.ts`](../../backend/src/types/index.ts)
- User admin API: [`backend/src/routes/users.ts`](../../backend/src/routes/users.ts)
- Email service: Resend API in [`backend/src/services/email.ts`](../../backend/src/services/email.ts)
- Notification orchestration: DB template/log/in-app in [`backend/src/services/notification.ts`](../../backend/src/services/notification.ts)
- Existing templates/log schema: [`backend/migrations/006_notifications_email.sql`](../../backend/migrations/006_notifications_email.sql)
- User security enhancements: [`backend/migrations/008_user_enhancements.sql`](../../backend/migrations/008_user_enhancements.sql)

## Gaps

1. Only 8 roles exist; target 17.
2. Single-role user model; lacks persona metadata, org/department binding, approval state.
3. Public registration hardcodes enterprise.
4. Expert invitation/register/CV lifecycle incomplete.
5. Email templates exist but account lifecycle matrix incomplete.
6. Email delivery has logs but lacks monthly quota policy, suppression, bounce/complaint governance.
7. Frontend role dashboards not aligned to 17-role executive model.

## Canonical 17 roles

| No | Role code | VN label | Account origin | Primary portal |
|---:|---|---|---|---|
| 01 | `chief_system_architect` | Kiến trúc sư hệ thống | Admin-created | Admin |
| 02 | `fullstack_developer` | Lập trình viên hệ thống | Admin-created | Admin |
| 03 | `devsecops_security` | An toàn thông tin/DevSecOps | Admin-created | Admin |
| 04 | `data_ai_scientist` | Dữ liệu/AI | Admin-created | Admin |
| 05 | `natif_executive` | Lãnh đạo NATIF | Admin-created | Executive |
| 06 | `department_manager` | Lãnh đạo phòng/ban | Admin-created | Dept |
| 07 | `grants_orders_specialist` | Chuyên viên tài trợ/đặt hàng | Admin-created | Officer |
| 08 | `voucher_startup_specialist` | Chuyên viên voucher/startup | Admin-created | Officer |
| 09 | `finance_disbursement` | Tài chính/giải ngân | Admin-created | Finance |
| 10 | `legal_risk_control` | Pháp chế/kiểm soát rủi ro | Admin-created | Legal |
| 11 | `admin_desk` | Văn thư/tiếp nhận | Admin-created | Clerk |
| 12 | `it_sysadmin_support` | CNTT/hỗ trợ | Admin-created | Admin |
| 13 | `scientific_council` | Thành viên hội đồng KH | Invitation | Council |
| 14 | `independent_expert` | Chuyên gia độc lập | Invitation/self-register with approval | Expert |
| 15 | `financial_appraiser` | Thẩm định tài chính | Invitation/admin-created | Appraiser |
| 16 | `independent_auditor` | Kiểm toán/giám sát độc lập | Invitation/admin-created | Auditor |
| 17 | `external_partner` | Doanh nghiệp/đối tác/ngân hàng/vendor | Self-register/invitation | Applicant/Partner |

## Legacy role mapping

| Existing | New canonical |
|---|---|
| `admin` | `chief_system_architect` or `it_sysadmin_support` |
| `moderator` | `admin_desk` |
| `enterprise` | `external_partner` |
| `expert` | `independent_expert` |
| `officer` | `grants_orders_specialist` |
| `dept_head` | `department_manager` |
| `director` | `natif_executive` |
| `clerk` | `admin_desk` |

Migration must keep backward compatibility via `legacy_role` + allow current APIs to work until frontend conversion completes.

## Account model

`users` remains primary identity table.

New fields:

- `canonical_role` — one of 17 roles.
- `legacy_role` — old role code for compatibility.
- `account_type` — `internal`, `external`, `expert`, `partner`, `system`.
- `account_status` — `invited`, `pending_verification`, `pending_approval`, `active`, `suspended`, `deactivated`, `deleted`.
- `organization_name`, `organization_type`, `tax_code`, `department`, `position_title`.
- `invited_by`, `invited_at`, `invitation_token_hash`, `invitation_expires_at`, `invitation_accepted_at`.
- `last_login_at`, `terms_accepted_at`, `privacy_accepted_at`.

Role extension tables:

- `role_permissions` — canonical permission registry.
- `user_role_assignments` — future multi-role support.
- `account_activity_logs` — identity/account audit.
- `email_suppression_list` — bounce/complaint/unsubscribe handling.
- `email_quota_counters` — quota monitoring.

## Registration policy

| Flow | Allowed roles | State after submit | Required emails |
|---|---|---|---|
| Public business register | `external_partner` | `pending_verification` | Welcome + verify email |
| Public expert register | `independent_expert` | `pending_approval` after email verify | Verify email + CV reminder + admin review notice |
| Admin create internal | roles 01-12, 15-16 | `invited` | Invitation email |
| Invite council | `scientific_council` | `invited` | Council invitation email |
| Invite bank/vendor | `external_partner` | `invited` | Partner invitation email |

## Email volume model

Expected 4,000 emails/month → low volume. Resend adequate.

Policy:

- Monthly planned: 4,000.
- Daily safe capacity: 200/day baseline.
- Burst capacity: 500/day for council/program deadlines.
- Throttle: 60 emails/min max.
- Retry: 3 attempts with exponential backoff.
- Bounce/complaint: suppress immediately.
- Critical state changes: email + in-app.
- Internal noise: in-app default, email only HIGH/CRITICAL.

## Required email matrix

### Account lifecycle

| Event | Recipient | Template code | Priority |
|---|---|---|---|
| Enterprise register success | enterprise contact | `account.external_partner.registered` | HIGH |
| Email verification | registering user | `account.email.verification` | CRITICAL |
| Account approved | user | `account.approved` | HIGH |
| Account rejected/suspended | user | `account.status_changed` | HIGH |
| Password reset | user | `account.password.reset` | CRITICAL |
| Password changed | user | `account.password.changed` | HIGH |
| Internal user invited | invited user | `account.internal.invited` | HIGH |
| Expert invited | expert | `account.expert.invited` | HIGH |
| Expert registered | expert + admin desk | `account.expert.registered` | HIGH |
| Expert CV completed/updated | expert + admin desk | `account.expert.cv_updated` | MEDIUM |

### Application lifecycle

| Event | Recipient |
|---|---|
| Draft saved | applicant in-app only |
| Application submitted | applicant + admin desk |
| Application received | applicant + NATIF executive |
| Assigned to department | department manager + applicant |
| Officer assigned | specialist |
| Supplement requested | applicant |
| Survey required | applicant + assigned officer |
| Council created | council members + admin desk |
| Expert assignment | invited expert/scientist |
| Expert accepted/declined | admin desk + department manager |
| Expert review completed | department manager + admin desk |
| Council recommendation | applicant + executive + department manager |
| Final approved/rejected | applicant + finance/legal as applicable |
| Contract signing | applicant + legal |
| Disbursement made | applicant + finance |
| Report due/overdue | applicant + officer + finance if overdue |

## Template rules

- Subject prefix: `[NATIF]`.
- VN formal tone: `Kính gửi ...`.
- Must include app link via `FRONTEND_URL`.
- No sensitive scores to external recipients unless legally permitted.
- All messages logged in `email_logs`.
- All user-facing critical events also inserted into `notifications`.

## Backend implementation plan

1. Add canonical role constants/types.
2. Add migration `010_account_system_overhaul.sql`.
3. Seed new account email templates.
4. Update registration to accept `account_type` but restrict public to `external_partner` / `independent_expert`.
5. Add admin invite endpoint.
6. Add expert invitation acceptance endpoint.
7. Update RBAC to accept legacy + canonical roles.
8. Update notification service type union.
9. Add email suppression/quota check before send.

## Frontend implementation plan

1. Register page: choose business/expert.
2. Login redirect: canonical role dashboard map.
3. Expert onboarding: required CV completeness gate.
4. Admin users page: show canonical role/status/invite action.
5. Notification preferences page: account/application/expert/council/finance categories.

## Security/compliance

- Password: bcrypt 12+ currently OK.
- JWT: keep short access token + add refresh-token later.
- Invitations: store token hash only.
- Email verification and reset codes: time-bound; current pattern OK.
- Audit: role/status changes in `account_activity_logs`.
- Deletion: soft delete + anonymize, existing pattern retained.
- Least privilege: 17 roles mapped to explicit permissions.

## Executive verdict

Adopt canonical 17-role account layer immediately. Preserve old `role` field during transition. Email infra is sufficient for 4,000/month but must gain suppression/quota + account lifecycle templates before production launch.
