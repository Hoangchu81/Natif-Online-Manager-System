# PRD — NATIF OMS Upgrade v2.0

## Product Overview

oms.natif.vn là hệ thống quản lý trực tuyến của Quỹ Đổi mới Công nghệ Quốc gia (NATIF), hỗ trợ toàn bộ vòng đời của hồ sơ xin tài trợ/hỗ trợ từ doanh nghiệp: từ nộp hồ sơ, xét duyệt nội bộ nhiều cấp, đến phê duyệt cuối và giải ngân. Phiên bản v2.0 nâng cấp từ MVP lên hệ thống production-grade.

## Goals

- G1: Chuẩn hóa toàn bộ luồng xử lý hồ sơ đúng Nghị định 268/2025/NĐ-CP.
- G2: Tăng trải nghiệm người dùng cho 8 vai trò.
- G3: Bổ sung vòng đời tài chính sau phê duyệt: giải ngân, báo cáo tiến độ, giám sát.
- G4: Tăng cường bảo mật, audit, và vận hành production.
- G5: Nâng độ bao phủ test và CI/CD.

## Users and Personas

| Persona | Vai trò | Mục tiêu chính |
|---------|---------|----------------|
| Nguyễn Thành - Doanh nghiệp | enterprise | Nộp hồ sơ, theo dõi tiến độ, nhận thông báo yêu cầu bổ sung |
| Lan - Văn thư | clerk | Tiếp nhận hồ sơ, chuyển Lãnh đạo, quản lý hồ sơ đến |
| Minh - Lãnh đạo | director | Phân phòng, quyết định phương án, phê duyệt cuối |
| Hùng - Trưởng phòng | dept_head | Phân công chuyên viên, theo dõi tiến độ phòng, lập hội đồng |
| Mai - Chuyên viên | officer | Xét sơ bộ, đề xuất phương án, tổng hợp kết quả |
| Tuấn - Chuyên gia | expert | Nhận phân công, đánh giá hồ sơ, gửi nhận xét |
| Admin | admin | Quản lý người dùng, toàn bộ hồ sơ, cấu hình hệ thống |
| Moderator | moderator | Quản lý nội dung, tin tức, menu |

## User Stories — Core

### Doanh nghiệp

- US-E01: Đăng ký, đăng nhập, quản lý tài khoản.
- US-E02: Nộp hồ sơ theo 4 chương trình với form đầy đủ 5 bước.
- US-E03: Theo dõi trạng thái hồ sơ theo timeline.
- US-E04: Nhận thông báo yêu cầu bổ sung và gửi tài liệu bổ sung.
- US-E05: Xem thông báo, lịch sử workflow.

### Văn thư

- US-C01: Xem danh sách hồ sơ mới nộp.
- US-C02: Tiếp nhận hồ sơ (submitted → received).
- US-C03: Chuyển hồ sơ lên Lãnh đạo (received → director_review).

### Lãnh đạo

- US-D01: Xem hồ sơ cần phân phòng.
- US-D02: Phân phòng kèm chọn Trưởng phòng (director_review → dept_assigned).
- US-D03: Quyết định phương án: hội đồng/khảo sát/bổ sung/loại (action_taken → branch).
- US-D04: Phê duyệt/từ chối cuối (dept_approved → approved/rejected).

### Trưởng phòng

- US-H01: Xem hồ sơ phòng mình.
- US-H02: Phân công chuyên viên (dept_assigned → preliminary_review).
- US-H03: Lập hội đồng tư vấn, quản lý thành viên.
- US-H04: Duyệt tổng hợp hồ sơ (summarized → dept_approved).

### Chuyên viên

- US-O01: Xem hồ sơ được giao.
- US-O02: Xét sơ bộ, đề xuất phương án (preliminary_review → action_taken).
- US-O03: Tổng hợp kết quả hội đồng (council_evaluation → summarized).

### Chuyên gia

- US-X01: Quản lý hồ sơ cá nhân (học vấn, kinh nghiệm, công trình).
- US-X02: Nhận/từ chối phân công đánh giá.
- US-X03: Gửi đánh giá có điểm số và khuyến nghị.

## User Stories — Vòng đời tài chính (NEW)

- US-F01: Admin/director tạo giải ngân cho hồ sơ đã phê duyệt.
- US-F02: Doanh nghiệp nộp báo cáo tiến độ định kỳ.
- US-F03: Chuyên viên/trưởng phòng xem xét và phê duyệt báo cáo.
- US-F04: Dashboard báo cáo IOOI hiển thị đúng dữ liệu từ disbursements/project_reports.

## User Stories — Vận hành (NEW)

- US-P01: Admin bootstrap: tạo tài khoản admin và seed dữ liệu đầu tiên.
- US-P02: Migration tự động khi deploy.
- US-P03: Health check endpoint và monitoring.
- US-P04: Audit log: ghi lại mọi hành động người dùng.

## Non-Functional Requirements

- NF01: Phản hồi API tất cả endpoints < 500ms ở tải thông thường.
- NF02: Tất cả route có xác thực và kiểm tra vai trò.
- NF03: OWASP Top 10 compliance.
- NF04: Unit/integration test coverage backend > 70%.
- NF05: E2E test cho workflow chính.
- NF06: TypeScript strict mode, không có `any` không cần thiết.

## Out of Scope v2.0

- Thanh toán online, kết nối ngân hàng trực tiếp.
- Ứng dụng mobile native.
- AI/ML phân loại hồ sơ tự động.

## Success Metrics

- Thời gian xử lý hồ sơ trung bình giảm 20%.
- Không có sự cố bảo mật nghiêm trọng trong 6 tháng.
- Tỷ lệ lỗi API < 0.5%.
- 100% vai trò có dashboard đầy đủ chức năng.
