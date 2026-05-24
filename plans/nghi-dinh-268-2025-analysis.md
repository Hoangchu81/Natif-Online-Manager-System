# Phân tích Nghị định 268/2025/NĐ-CP cho NATIF OMS

Nguồn: thuvienphapluat.vn, Nghị định 268/2025/NĐ-CP ngày 14/10/2025, hướng dẫn Luật Khoa học, công nghệ và đổi mới sáng tạo — khuyến khích hoạt động KH&CN.

## 1. Tóm tắt điều hành

NĐ 268/2025 là nghị định hướng dẫn chi tiết Luật KH,CN&ĐMST về:
- Nhiệm vụ đổi mới sáng tạo (ĐMST) và chương trình ĐMST.
- Hoạt động ĐMST trong doanh nghiệp.
- Thúc đẩy hệ thống ĐMST, hệ sinh thái khởi nghiệp sáng tạo.
- Hỗ trợ doanh nghiệp thực hiện ĐMST.
- Doanh nghiệp KH&CN, trung tâm ĐMST, cá nhân/nhóm khởi nghiệp sáng tạo.

Đây là văn bản gốc quy định quy trình nghiệp vụ mà OMS phải tuân thủ khi xử lý hồ sơ tài trợ/đặt hàng/hỗ trợ.

## 2. Cấu trúc văn bản

### Chương I: Quy định chung (Điều 1-3)
- Phạm vi, đối tượng, giải thích từ ngữ.

### Chương II: Nhiệm vụ ĐMST, Chương trình ĐMST
- Mục 1: Nhiệm vụ ĐMST (Điều 4-19) — quy trình tài trợ/đặt hàng.
- Mục 2: Nhiệm vụ hỗ trợ lãi suất vay (Điều 20-22).
- Mục 3: Nhiệm vụ hỗ trợ qua voucher (Điều 23-24).
- Mục 4: Chương trình ĐMST quốc gia (Điều 25-28).

### Chương III: Hoạt động ĐMST trong doanh nghiệp
- Mục 1: Tiêu chí doanh nghiệp ĐMST (Điều 29-37).
- Mục 2: Công nhận doanh nghiệp KH&CN (Điều 38-42).

### Chương IV+: Hệ sinh thái, trung tâm ĐMST, khởi nghiệp sáng tạo, tổ chức thực hiện.

## 3. Nội dung trọng yếu cho OMS

### 3.1 Giải thích từ ngữ (Điều 3)

| # | Thuật ngữ | Định nghĩa | Hàm ý OMS |
|---|-----------|-------------|-----------|
| 1 | Nhiệm vụ ĐMST | Tạo sản phẩm/dịch vụ/quy trình/mô hình kinh doanh mới hoặc cải tiến đáng kể | application_type field |
| 2 | Tài trợ | DN/tổ chức đề xuất → cơ quan xét, tài trợ kinh phí | program_type = 'sponsorship' |
| 3 | Đặt hàng | Nhà nước xác định mục tiêu/nội dung → giao DN thực hiện | program_type = 'procurement' |
| 4 | ĐMST cơ sở | Tổ chức KH&CN công lập tự thực hiện từ kinh phí được giao | Không thuộc scope OMS |
| 5 | Hỗ trợ lãi suất vay | Quỹ hỗ trợ 50% lãi suất, tối đa 6%/năm, tối đa 5 năm | program_type = 'interest_subsidy' |
| 6 | Voucher | Phiếu hỗ trợ tài chính thúc đẩy thương mại hóa sản phẩm mới | program_type = 'voucher' |
| 7 | Dự án khởi nghiệp sáng tạo | Dự án hình thành mô hình kinh doanh sáng tạo dựa trên công nghệ | program_type = 'ecosystem' |
| 8 | Chương trình ĐMST | Tập hợp nhiệm vụ ĐMST có mục tiêu chung, trung/dài hạn | programs table |
| 9 | Cơ quan quản lý nhiệm vụ ĐMST | Bộ/ngành/UBND tỉnh hoặc Quỹ | org_unit / managing_agency |

### 3.2 Phân loại nhiệm vụ ĐMST (Điều 5)

Nhiệm vụ ĐMST sử dụng NSNN gồm:
- a) Nhiệm vụ đổi mới công nghệ.
- b) Nhiệm vụ phát triển quyền SHTT, nâng cao năng suất, chất lượng.
- c) Nhiệm vụ hỗ trợ khởi nghiệp sáng tạo.
- d) Nhiệm vụ hỗ trợ lãi suất vay.
- đ) Nhiệm vụ hỗ trợ qua voucher.

Hàm ý OMS: Cần enum `task_category` mapping chính xác 5 loại trên.

### 3.3 Nguyên tắc quản lý (Điều 6)

- Công khai, minh bạch, dân chủ, khách quan.
- Tách bạch chức năng quản lý nhà nước và hoạt động tài trợ.
- Đánh giá dựa trên kết quả đầu ra.
- Phân cấp, phân quyền.
- Ứng dụng CNTT, chuyển đổi số.

Hàm ý OMS: Cần audit trail, role separation, outcome-based evaluation, digital-first.

### 3.4 Tiêu chí lựa chọn nhiệm vụ (Điều 8)

Tiêu chí chung:
- Phù hợp định hướng ưu tiên.
- Có tính mới, sáng tạo.
- Có tính khả thi.
- Có năng lực tổ chức thực hiện.
- Có phương án huy động nguồn lực.
- Có kết quả đầu ra rõ ràng, đo lường được.

Tiêu chí riêng theo loại nhiệm vụ (khoản 2):
- Đổi mới công nghệ: có công nghệ cụ thể, có đối tác chuyển giao, có năng lực tiếp nhận.
- SHTT/năng suất: có sản phẩm/quy trình cần bảo hộ, có kế hoạch thương mại hóa.
- Khởi nghiệp: có mô hình kinh doanh sáng tạo, có tiềm năng tăng trưởng.

Hàm ý OMS: Cần scoring rubric per program type, criteria checklist, weighted evaluation.

### 3.5 Điều kiện tham gia (Điều 9)

- Có tư cách pháp nhân.
- Có chức năng/ngành nghề phù hợp.
- Có năng lực triển khai.
- Không vi phạm pháp luật về KH&CN.
- Không đang bị xử lý vi phạm liên quan.

Hàm ý OMS: Cần eligibility pre-check, blacklist check, legal status verification.

### 3.6 Quy trình xét duyệt (Điều 10-14)

**Bước 1: Thông báo (Điều 10)**
- Công bố trên cổng thông tin: định hướng, yêu cầu, nội dung, thời gian nhận hồ sơ, tiêu chí.
- Thời gian nhận hồ sơ tối thiểu 30 ngày.

**Bước 2: Nộp hồ sơ (Điều 11)**
- 01 bộ hồ sơ gồm: đề xuất, thuyết minh, tài liệu pháp lý, năng lực, cam kết.

**Bước 3: Xét duyệt (Điều 12)**
- 3 hình thức: Hội đồng xét duyệt, chuyên gia tư vấn, tổ chức tư vấn.
- Hội đồng: 5-9 thành viên, ≥2/3 có chuyên môn phù hợp.
- Đánh giá theo tiêu chí Điều 8.
- Biên bản, phiếu đánh giá, kiến nghị.
- Thông báo kết quả trong 3 ngày làm việc.
- Hoàn thiện hồ sơ trong 15 ngày.

**Bước 4: Thẩm định kinh phí (Điều 13)**
- Trong 10 ngày sau xét duyệt.
- Kiểm tra hoàn thiện hồ sơ.
- Đánh giá dự toán vs nội dung được duyệt.
- Rà soát tỷ lệ/mức hỗ trợ.
- Xem xét vốn đối ứng.

**Bước 5: Phê duyệt (Điều 14)**
- Trong 10 ngày sau thẩm định.
- Thủ trưởng cơ quan quản lý phê duyệt.
- Công bố công khai: tên nhiệm vụ, tổ chức chủ trì, thời gian, kinh phí.

**Bước 6: Ký hợp đồng (Điều 15)**
- Trong 30 ngày sau phê duyệt.
- Nội dung: mục tiêu, sản phẩm, tiến độ, kinh phí, quyền/nghĩa vụ, nghiệm thu, SHTT, bảo mật, điều chỉnh, chấm dứt, thi hành.

**Bước 7: Kiểm tra, giám sát (Điều 16)**
- Định kỳ hoặc đột xuất.
- Kiểm tra tiến độ, chất lượng, sử dụng kinh phí.
- Yêu cầu báo cáo, cung cấp tài liệu.

**Bước 8: Sửa đổi, bổ sung (Điều 17)**
- Điều chỉnh nội dung, tiến độ, kinh phí khi có lý do chính đáng.
- Chấm dứt hợp đồng khi vi phạm nghiêm trọng.

**Bước 9: Quyết toán (Điều 18)**
- Nghiệm thu kết quả.
- Quyết toán kinh phí.
- Thu hồi kinh phí sử dụng sai mục đích.

Hàm ý OMS: Workflow hiện tại cần map chính xác 9 bước trên. Cần SLA tracking cho từng bước (30 ngày nhận hồ sơ, 3 ngày thông báo, 15 ngày hoàn thiện, 10 ngày thẩm định, 10 ngày phê duyệt, 30 ngày ký hợp đồng).

### 3.7 Nhiệm vụ hỗ trợ lãi suất vay (Điều 20-22)

Đặc thù:
- Thực hiện qua Quỹ (NATIF).
- Điều kiện: pháp nhân, ngành nghề phù hợp, có hợp đồng vay đã ký, cam kết sử dụng đúng mục đích.
- Mức hỗ trợ: 50% lãi suất, tối đa 6%/năm.
- Thời hạn: tối đa 5 năm, còn tối thiểu 12 tháng.
- Quy trình riêng: Quỹ ký thỏa thuận với tổ chức tín dụng → công bố → tiếp nhận hồ sơ → xét duyệt → phê duyệt → giải ngân qua tài khoản chuyên dùng.
- Không áp dụng Điều 9-17 (quy trình chung).

Hàm ý OMS:
- Cần workflow riêng cho interest_subsidy.
- Cần tích hợp thông tin tổ chức tín dụng.
- Cần tính toán mức hỗ trợ lãi suất.
- Cần theo dõi giải ngân theo kỳ trả nợ.
- Cần kiểm tra sử dụng vốn đúng mục đích.

### 3.8 Nhiệm vụ hỗ trợ qua voucher (Điều 23-24)

Đặc thù:
- Thực hiện qua Quỹ (NATIF).
- Mục tiêu: thúc đẩy thương mại hóa sản phẩm mới, khuyến khích người dùng trải nghiệm.
- Điều kiện sản phẩm: mới, có tính sáng tạo, đã qua kiểm nghiệm/thử nghiệm.
- Quy trình: Quỹ phê duyệt khung chương trình → công bố → tiếp nhận hồ sơ → Hội đồng xét duyệt → phê duyệt → phát hành voucher → thanh toán.
- Voucher có giá trị tối đa 12 tháng.
- Voucher phải thể hiện: tên chương trình, sản phẩm, giá bán, giá trị voucher, thời hạn.

Hàm ý OMS:
- Cần voucher lifecycle management.
- Cần product/service catalog.
- Cần voucher issuance, redemption, expiry tracking.
- Cần integration với thanh toán/đối soát.

### 3.9 Chương trình ĐMST quốc gia (Điều 25-28)

3 chương trình quốc gia chính:
1. Chương trình quốc gia về đổi mới công nghệ.
2. Chương trình quốc gia về khởi nghiệp sáng tạo.
3. Chương trình quốc gia về phát triển tài sản trí tuệ, nâng cao năng suất, chất lượng.

Quy trình:
- Xây dựng → thẩm định → phê duyệt → tổ chức thực hiện → đánh giá.
- Nội dung phê duyệt: tên, mục tiêu định lượng, nội dung, sản phẩm đầu ra, cơ quan chủ trì, thời gian, kinh phí, cơ cấu nguồn vốn.

Hàm ý OMS:
- Cần program management module.
- Cần program lifecycle: draft → approved → active → evaluation → closed.
- Cần link nhiệm vụ/hồ sơ vào chương trình.
- Cần báo cáo tổng hợp theo chương trình.

### 3.10 Tiêu chí doanh nghiệp ĐMST (Điều 29-37)

Nhiều loại tiêu chí cho:
- Doanh nghiệp đổi mới sáng tạo (Điều 29).
- DN ĐMST xuất sắc (Điều 30).
- DN ĐMST tiêu biểu (Điều 31).
- Tổ chức hỗ trợ khởi nghiệp sáng tạo (Điều 32-34).
- Cá nhân/nhóm khởi nghiệp sáng tạo (Điều 35).
- Nhà đầu tư hỗ trợ ĐMST (Điều 36).
- Chuyên gia hỗ trợ ĐMST (Điều 37).

Hàm ý OMS:
- Cần enterprise classification/certification module.
- Cần criteria-based assessment.
- Cần certificate issuance/renewal.
- Cần public registry of certified entities.

## 4. Mapping NĐ 268 → OMS Workflow hiện tại

| NĐ 268 Step | OMS Status hiện tại | Gap |
|---|---|---|
| Thông báo (Đ.10) | Không có | Cần funding_calls module |
| Nộp hồ sơ (Đ.11) | `submitted` | OK nhưng thiếu checklist pháp lý |
| Xét duyệt (Đ.12) | `reviewing` → `expert_review` | Cần 3 hình thức: council/expert/org |
| Thẩm định kinh phí (Đ.13) | Không có | Cần `financial_appraisal` status |
| Phê duyệt (Đ.14) | `approved` | OK nhưng thiếu công bố công khai |
| Ký hợp đồng (Đ.15) | Không có | Cần `contract_signed` status |
| Kiểm tra (Đ.16) | Không có | Cần monitoring module |
| Sửa đổi (Đ.17) | Không có | Cần change_request workflow |
| Quyết toán (Đ.18) | Không có | Cần settlement module |

## 5. SLA Requirements từ NĐ 268

| Bước | Thời hạn pháp lý | Cần tracking |
|---|---|---|
| Thời gian nhận hồ sơ | ≥ 30 ngày | call_open_date → call_close_date |
| Thông báo kết quả xét duyệt | 3 ngày làm việc | review_completed → notification_sent |
| Hoàn thiện hồ sơ | 15 ngày | notification_sent → revision_submitted |
| Thẩm định kinh phí | 10 ngày | review_completed → financial_appraisal_done |
| Phê duyệt | 10 ngày | financial_appraisal_done → approved |
| Ký hợp đồng | 30 ngày | approved → contract_signed |

Hàm ý OMS: Cần SLA timer, deadline alerts, overdue notifications, compliance dashboard.

## 6. Tác động tới kiến trúc OMS

### 6.1 Data model mới cần thiết

```
funding_calls (id, program_id, title, description, criteria, open_date, close_date, budget_envelope, status, legal_basis)
eligibility_checks (id, application_id, criterion, result, evidence, checked_by, checked_at)
review_councils (id, application_id, type: 'council'|'expert'|'org', members[], meeting_date, minutes, result)
financial_appraisals (id, application_id, budget_requested, budget_approved, co_funding_ratio, appraiser, approved_at)
contracts (id, application_id, contract_number, signed_date, start_date, end_date, total_amount, milestones[], status)
disbursements (id, contract_id, milestone_id, amount, requested_at, approved_at, paid_at, evidence[])
monitoring_visits (id, contract_id, visit_date, findings, recommendations, follow_up_required)
settlements (id, contract_id, final_amount, recovered_amount, settlement_date, status)
sla_tracking (id, application_id, step, deadline, actual_date, is_overdue)
```

### 6.2 Workflow states mới

Bổ sung vào workflow hiện tại:
- `call_published` → `accepting_applications`
- `eligibility_screening` → `duplicate_check`
- `council_review` | `expert_review` | `org_review`
- `financial_appraisal`
- `budget_commitment`
- `director_approval`
- `public_disclosure`
- `contract_drafting` → `contract_signed`
- `active_monitoring`
- `milestone_report_due` → `disbursement_requested` → `disbursed`
- `inspection`
- `change_requested` → `change_approved`
- `settlement_pending` → `settled`
- `completed`

### 6.3 Role expansion

Từ NĐ 268:
- `program_manager` — quản lý chương trình, công bố call.
- `financial_appraiser` — thẩm định kinh phí.
- `council_chair` — chủ tịch hội đồng xét duyệt.
- `council_member` — thành viên hội đồng.
- `contract_officer` — quản lý hợp đồng.
- `monitoring_officer` — kiểm tra, giám sát.
- `settlement_officer` — quyết toán.

## 7. Đối chiếu NĐ 268 vs NĐ 77/2026

| Nội dung | NĐ 268/2025 | NĐ 77/2026 |
|---|---|---|
| Phạm vi | Quy trình nghiệp vụ chi tiết | Tổ chức & hoạt động Quỹ |
| Quy trình xét duyệt | Điều 10-14 (chi tiết 9 bước) | Tham chiếu NĐ 268 |
| Tài chính | Nguyên tắc chung | Chi tiết nguồn vốn, dự toán, quyết toán |
| Rủi ro | Điều 17-18 (sửa đổi/chấm dứt) | Điều 18 (xử lý rủi ro tài chính) |
| Voucher | Điều 23-24 (quy trình chi tiết) | Tham chiếu |
| Lãi suất vay | Điều 20-22 (quy trình chi tiết) | Tham chiếu |
| Chương trình | Điều 25-28 (xây dựng/phê duyệt) | Điều 5 (chức năng quản lý) |

Kết luận: NĐ 268 quy định QUY TRÌNH, NĐ 77 quy định TỔ CHỨC + TÀI CHÍNH. OMS cần tuân thủ cả hai.

## 8. Priority implementation cho OMS

### Phase 1 (Immediate — Sprint 2-3)
1. Thêm `funding_calls` module + public listing.
2. Thêm `eligibility_checks` vào workflow.
3. Thêm `financial_appraisal` step.
4. Thêm SLA tracking + deadline alerts.
5. Thêm `legal_basis` field cho programs/applications.

### Phase 2 (Short-term — Sprint 4-5)
1. Contract management module.
2. Disbursement tracking.
3. Monitoring/inspection module.
4. Settlement/final evaluation.
5. Public disclosure pages.

### Phase 3 (Medium-term — Sprint 6-7)
1. Voucher lifecycle management.
2. Interest subsidy calculation + bank integration.
3. Enterprise certification module.
4. Program lifecycle management.
5. AI-assisted scoring + risk assessment.

## 9. Kết luận

NĐ 268/2025/NĐ-CP là văn bản quy trình gốc cho mọi hoạt động tài trợ/đặt hàng/hỗ trợ ĐMST. OMS hiện tại mới cover khoảng 40% quy trình (nộp hồ sơ → xét duyệt → phê duyệt). Cần mở rộng đáng kể để cover full lifecycle theo pháp luật: công bố → tiếp nhận → xét duyệt → thẩm định → phê duyệt → hợp đồng → giải ngân → giám sát → quyết toán → công khai.

Kết hợp với NĐ 77/2026 (tổ chức + tài chính Quỹ), OMS cần trở thành nền tảng quản trị vòng đời đầy đủ cho quỹ đổi mới công nghệ quốc gia.
