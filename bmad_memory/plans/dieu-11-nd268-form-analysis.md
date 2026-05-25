# Phân tích Biểu mẫu Điều 11 NĐ 268/2025/NĐ-CP
# Hồ sơ đề xuất nhiệm vụ ĐMST — Tài trợ & Đặt hàng

**Phân tích bởi:** Dr. CDH (CDH Master Orchestrator)  
**Ngày:** 2026-05-24  
**Căn cứ pháp lý:**
- Nghị định 268/2025/NĐ-CP ngày 14/10/2025 (Quy trình nghiệp vụ)
- Nghị định 77/2026/NĐ-CP ngày 17/03/2026 (Tổ chức & hoạt động Quỹ)

---

## 1. BỐI CẢNH PHÁP LÝ

### 1.1 Phân biệt Tài trợ vs Đặt hàng

| Tiêu chí | TÀI TRỢ (Sponsorship) | ĐẶT HÀNG (Procurement/Order) |
|---|---|---|
| **Khởi xướng** | DN/tổ chức tự đề xuất | Nhà nước xác định mục tiêu → giao DN |
| **Chương trình** | Quỹ có thể tự làm (NĐ 77, Đ.6) | Phải gắn với chương trình được phê duyệt |
| **Cơ sở pháp lý** | Giám đốc Quỹ phê duyệt trực tiếp | Bộ trưởng/Thủ trưởng cơ quan quản lý phê duyệt |
| **Nguồn kinh phí** | NSNN qua Quỹ hoặc ngoài NSNN | NSNN theo chương trình |
| **Quy trình** | Điều 10-18 NĐ 268 (đầy đủ) | Điều 10-18 NĐ 268 + ràng buộc chương trình |
| **Scope OMS** | `program_type = 'sponsorship'` | `program_type = 'procurement'` + `program_id` bắt buộc |

### 1.2 Vị trí Điều 11 trong quy trình

```
Điều 10 (Thông báo/Công bố) 
    → Điều 11 (NỘP HỒ SƠ) ← ĐANG PHÂN TÍCH
        → Điều 12 (Xét duyệt: HĐ/Chuyên gia/Tổ chức tư vấn)
            → Điều 13 (Thẩm định kinh phí)
                → Điều 14 (Phê duyệt)
                    → Điều 15 (Ký hợp đồng)
```

---

## 2. CẤU TRÚC BIỂU MẪU ĐIỀU 11

### 2.1 Thành phần hồ sơ (01 bộ)

Theo Điều 11 NĐ 268/2025, hồ sơ đề xuất nhiệm vụ ĐMST gồm:

| # | Thành phần | Mô tả | Bắt buộc | Loại file |
|---|---|---|---|---|
| 1 | **Đơn đề xuất nhiệm vụ** | Theo mẫu quy định | ✅ | Form + PDF |
| 2 | **Thuyết minh nhiệm vụ** | Chi tiết nội dung, mục tiêu, sản phẩm, tiến độ, kinh phí | ✅ | Form + PDF |
| 3 | **Tài liệu pháp lý tổ chức** | Giấy ĐKKD/Quyết định thành lập, điều lệ | ✅ | Upload scan |
| 4 | **Năng lực tổ chức** | Nhân lực, cơ sở vật chất, kinh nghiệm | ✅ | Form + Upload |
| 5 | **Lý lịch khoa học chủ nhiệm** | CV khoa học người chủ trì | ✅ | Form + PDF |
| 6 | **Văn bản xác nhận phối hợp** | Nếu có đơn vị phối hợp | Có điều kiện | Upload |
| 7 | **Cam kết/Tự kê khai** | Cam kết không trùng lặp NSNN, tự chịu trách nhiệm | ✅ | Form checkbox + ký |
| 8 | **Dự toán kinh phí chi tiết** | Theo định mức/thực tế | ✅ | Form bảng |
| 9 | **Tài liệu minh chứng** | Bằng sáng chế, hợp đồng chuyển giao, kết quả nghiên cứu trước | Tùy loại | Upload |

### 2.2 Đơn đề xuất nhiệm vụ (Mẫu chính)

#### Cấu trúc form fields:

```yaml
don_de_xuat:
  # PHẦN I: THÔNG TIN CHUNG
  ten_nhiem_vu: string (required, max 500)
  loai_nhiem_vu: enum [doi_moi_cong_nghe, shtt_nang_suat, khoi_nghiep, lai_suat, voucher]
  linh_vuc: enum [cong_nghe_thong_tin, cong_nghe_sinh_hoc, vat_lieu_moi, nang_luong, co_khi, ...]
  thoi_gian_thuc_hien: {tu: date, den: date, so_thang: int}
  tong_kinh_phi: decimal
  kinh_phi_de_nghi_ho_tro: decimal
  von_doi_ung: decimal
  
  # PHẦN II: TỔ CHỨC CHỦ TRÌ
  to_chuc_chu_tri:
    ten: string (required)
    dia_chi: string
    dien_thoai: string
    email: string
    ma_so_thue: string (required)
    so_dkkd: string (required)
    nguoi_dai_dien: string
    chuc_vu: string
    tai_khoan_ngan_hang: string
    ngan_hang: string
    
  # PHẦN III: CHỦ NHIỆM NHIỆM VỤ
  chu_nhiem:
    ho_ten: string (required)
    hoc_vi: enum [cu_nhan, thac_si, tien_si, pgs, gs]
    chuc_danh: string
    don_vi_cong_tac: string
    dien_thoai: string
    email: string
    
  # PHẦN IV: MỤC TIÊU
  muc_tieu_tong_quat: text (required)
  muc_tieu_cu_the: text[] (required, min 1)
  
  # PHẦN V: NỘI DUNG CHÍNH
  noi_dung_thuc_hien: 
    - ten_noi_dung: string
      mo_ta: text
      san_pham_du_kien: text
      thoi_gian: {tu: date, den: date}
      
  # PHẦN VI: SẢN PHẨM ĐẦU RA
  san_pham:
    - ten_san_pham: string
      chi_tieu_chat_luong: text
      so_luong: string
      don_vi: string
      
  # PHẦN VII: HIỆU QUẢ DỰ KIẾN
  hieu_qua_kinh_te: text
  hieu_qua_xa_hoi: text
  hieu_qua_moi_truong: text
  kha_nang_ung_dung: text
  
  # PHẦN VIII: CAM KẾT
  cam_ket_khong_trung_lap: boolean (required = true)
  cam_ket_tu_chiu_trach_nhiem: boolean (required = true)
  cam_ket_su_dung_dung_muc_dich: boolean (required = true)
```

### 2.3 Thuyết minh nhiệm vụ (Chi tiết)

```yaml
thuyet_minh:
  # A. TỔNG QUAN
  tinh_cap_thiet: text (required, min 500 chars)
  tong_quan_tinh_hinh_nghien_cuu:
    trong_nuoc: text
    quoc_te: text
  tinh_moi_sang_tao: text (required)
  
  # B. MỤC TIÊU & NỘI DUNG
  muc_tieu: (same as đơn đề xuất)
  noi_dung_chi_tiet:
    - noi_dung_so: int
      ten: string
      mo_ta_chi_tiet: text
      phuong_phap: text
      san_pham: text
      nguoi_thuc_hien: string
      thoi_gian: date_range
      
  # C. SẢN PHẨM
  san_pham_khoa_hoc: [{ten, chi_tieu, yeu_cau_ky_thuat}]
  san_pham_dao_tao: [{loai, so_luong}]  # thạc sĩ, tiến sĩ, bài báo
  san_pham_ung_dung: [{ten, quy_mo, dia_chi_ung_dung}]
  quyen_shtt_du_kien: [{loai, ten, trang_thai}]
  
  # D. PHƯƠNG ÁN TỔ CHỨC
  phuong_an_to_chuc:
    nhom_nghien_cuu: [{ho_ten, hoc_vi, vai_tro, thoi_gian_tham_gia}]
    co_so_vat_chat: text
    hop_tac_quoc_te: text
    
  # E. TIẾN ĐỘ
  tien_do:
    - giai_doan: int
      noi_dung: text
      san_pham: text
      thoi_gian: date_range
      kinh_phi: decimal
      
  # F. DỰ TOÁN KINH PHÍ
  du_toan:
    tong_kinh_phi: decimal
    tu_nsnn: decimal
    von_doi_ung: decimal
    chi_tiet:
      - hang_muc: enum [cong_lao_dong, nguyen_vat_lieu, thiet_bi, cong_tac_phi, 
                         hoi_thao, quan_ly, khac]
        noi_dung: text
        don_vi: string
        so_luong: int
        don_gia: decimal
        thanh_tien: decimal
        nguon_nsnn: decimal
        nguon_khac: decimal
```

---

## 3. ĐẶC THÙ THEO LOẠI NHIỆM VỤ

### 3.1 Tài trợ (Quỹ tự làm)

- **Trigger:** Quỹ công bố định hướng → DN nộp hồ sơ
- **Phê duyệt:** Giám đốc Quỹ (NĐ 77, Đ.6 khoản 6)
- **Không bắt buộc** gắn chương trình quốc gia
- **Form bổ sung:** Không cần văn bản giao nhiệm vụ từ cấp trên

### 3.2 Đặt hàng (Gắn chương trình)

- **Trigger:** Chương trình ĐMST quốc gia → xác định nhiệm vụ cần đặt hàng → công bố
- **Phê duyệt:** Bộ trưởng/Thủ trưởng cơ quan quản lý chương trình
- **Bắt buộc** gắn `program_id` (chương trình đã được phê duyệt theo Đ.25-28)
- **Form bổ sung:**
  - Mã chương trình/nhiệm vụ được đặt hàng
  - Văn bản giao nhiệm vụ/quyết định phê duyệt chương trình
  - Yêu cầu đầu ra cụ thể từ cơ quan đặt hàng
  - Cam kết đáp ứng yêu cầu đặt hàng

---

## 4. MAPPING VÀO OMS DATA MODEL

### 4.1 Bảng `applications` (mở rộng)

```sql
ALTER TABLE applications ADD COLUMN IF NOT EXISTS:
  -- Phân loại theo NĐ 268
  task_category VARCHAR(50) NOT NULL 
    CHECK (task_category IN ('doi_moi_cong_nghe', 'shtt_nang_suat', 
                              'khoi_nghiep', 'lai_suat', 'voucher')),
  funding_mechanism VARCHAR(20) NOT NULL 
    CHECK (funding_mechanism IN ('tai_tro', 'dat_hang')),
  
  -- Liên kết chương trình (bắt buộc nếu đặt hàng)
  program_id UUID REFERENCES programs(id),
  program_order_document_url TEXT,  -- Văn bản giao nhiệm vụ
  
  -- Thông tin tài chính
  total_budget DECIMAL(15,2),
  requested_funding DECIMAL(15,2),
  co_funding_amount DECIMAL(15,2),
  co_funding_ratio DECIMAL(5,2),  -- % vốn đối ứng
  
  -- Thời gian thực hiện
  implementation_start DATE,
  implementation_end DATE,
  implementation_months INT,
  
  -- Cam kết pháp lý
  no_duplicate_funding_declaration BOOLEAN DEFAULT FALSE,
  self_responsibility_declaration BOOLEAN DEFAULT FALSE,
  proper_use_declaration BOOLEAN DEFAULT FALSE,
  declaration_signed_at TIMESTAMP,
  
  -- Căn cứ pháp lý
  legal_basis_decree VARCHAR(100),  -- e.g. 'ND268/2025'
  legal_basis_article VARCHAR(50),  -- e.g. 'Dieu 11'
  
  -- SLA tracking
  submitted_at TIMESTAMP,
  eligibility_checked_at TIMESTAMP,
  review_started_at TIMESTAMP,
  review_completed_at TIMESTAMP,
  financial_appraisal_at TIMESTAMP,
  approved_at TIMESTAMP,
  contract_signed_at TIMESTAMP;

-- Constraint: đặt hàng phải có program_id
ALTER TABLE applications ADD CONSTRAINT chk_dat_hang_program
  CHECK (funding_mechanism != 'dat_hang' OR program_id IS NOT NULL);
```

### 4.2 Bảng `application_thuyet_minh` (mới)

```sql
CREATE TABLE application_thuyet_minh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  
  -- Tổng quan
  tinh_cap_thiet TEXT NOT NULL,
  tong_quan_trong_nuoc TEXT,
  tong_quan_quoc_te TEXT,
  tinh_moi_sang_tao TEXT NOT NULL,
  
  -- Mục tiêu
  muc_tieu_tong_quat TEXT NOT NULL,
  muc_tieu_cu_the JSONB NOT NULL,  -- string[]
  
  -- Hiệu quả
  hieu_qua_kinh_te TEXT,
  hieu_qua_xa_hoi TEXT,
  hieu_qua_moi_truong TEXT,
  kha_nang_ung_dung TEXT,
  
  -- Phương án tổ chức
  co_so_vat_chat TEXT,
  hop_tac_quoc_te TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Bảng `application_noi_dung` (nội dung thực hiện)

```sql
CREATE TABLE application_noi_dung (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  noi_dung_so INT NOT NULL,
  ten TEXT NOT NULL,
  mo_ta_chi_tiet TEXT,
  phuong_phap TEXT,
  san_pham_du_kien TEXT,
  nguoi_thuc_hien TEXT,
  thoi_gian_tu DATE,
  thoi_gian_den DATE,
  UNIQUE(application_id, noi_dung_so)
);
```

### 4.4 Bảng `application_san_pham` (sản phẩm đầu ra)

```sql
CREATE TABLE application_san_pham (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  loai VARCHAR(50) NOT NULL 
    CHECK (loai IN ('khoa_hoc', 'dao_tao', 'ung_dung', 'shtt')),
  ten TEXT NOT NULL,
  chi_tieu_chat_luong TEXT,
  yeu_cau_ky_thuat TEXT,
  so_luong INT,
  don_vi VARCHAR(50),
  quy_mo TEXT,
  dia_chi_ung_dung TEXT
);
```

### 4.5 Bảng `application_du_toan` (dự toán kinh phí)

```sql
CREATE TABLE application_du_toan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  hang_muc VARCHAR(50) NOT NULL
    CHECK (hang_muc IN ('cong_lao_dong', 'nguyen_vat_lieu', 'thiet_bi',
                         'cong_tac_phi', 'hoi_thao', 'quan_ly', 'khac')),
  noi_dung TEXT NOT NULL,
  don_vi VARCHAR(50),
  so_luong DECIMAL(10,2),
  don_gia DECIMAL(15,2),
  thanh_tien DECIMAL(15,2) NOT NULL,
  nguon_nsnn DECIMAL(15,2),
  nguon_khac DECIMAL(15,2),
  ghi_chu TEXT
);
```

### 4.6 Bảng `application_nhom_nghien_cuu` (nhân sự)

```sql
CREATE TABLE application_nhom_nghien_cuu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  ho_ten VARCHAR(200) NOT NULL,
  hoc_vi VARCHAR(50),
  chuc_danh VARCHAR(100),
  don_vi_cong_tac VARCHAR(300),
  vai_tro VARCHAR(100) NOT NULL,  -- chủ nhiệm, thành viên, thư ký
  thoi_gian_tham_gia_thang INT,
  so_gio_quy_doi INT
);
```

### 4.7 Bảng `application_tien_do` (tiến độ/giai đoạn)

```sql
CREATE TABLE application_tien_do (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  giai_doan INT NOT NULL,
  noi_dung TEXT NOT NULL,
  san_pham TEXT,
  thoi_gian_tu DATE,
  thoi_gian_den DATE,
  kinh_phi DECIMAL(15,2),
  UNIQUE(application_id, giai_doan)
);
```

---

## 5. VALIDATION RULES (Business Logic)

### 5.1 Validation chung (cả Tài trợ & Đặt hàng)

```typescript
const validationRules = {
  // Cam kết bắt buộc
  declarations: {
    no_duplicate_funding: { required: true, value: true },
    self_responsibility: { required: true, value: true },
    proper_use: { required: true, value: true },
  },
  
  // Kinh phí
  budget: {
    total_must_equal_sum: true,  // tổng = NSNN + vốn đối ứng
    co_funding_min_ratio: 0.0,  // tùy chương trình
    max_nsnn_support: null,     // tùy chương trình
  },
  
  // Thời gian
  timeline: {
    min_months: 6,
    max_months: 60,  // 5 năm
    start_after_approval: true,
  },
  
  // Hồ sơ
  documents: {
    dkkd_required: true,
    ly_lich_khoa_hoc_required: true,
    min_noi_dung: 1,
    min_san_pham: 1,
    min_tien_do: 1,
  },
};
```

### 5.2 Validation riêng — Đặt hàng

```typescript
const datHangValidation = {
  program_id: { required: true },
  program_order_document: { required: true },
  // Sản phẩm phải match yêu cầu đặt hàng từ chương trình
  output_must_match_order: true,
  // Kinh phí không vượt khung chương trình
  budget_within_program_envelope: true,
};
```

### 5.3 Duplicate Funding Check (NĐ 77, Đ.3 khoản 5)

```typescript
// Kiểm tra trùng lặp hỗ trợ NSNN
async function checkDuplicateFunding(application) {
  // 1. Kiểm tra cùng tổ chức + cùng nội dung + nguồn NSNN khác
  const duplicates = await db.query(`
    SELECT * FROM applications 
    WHERE organization_id = $1 
    AND status IN ('approved', 'active', 'contract_signed')
    AND similarity(title, $2) > 0.7
    AND id != $3
  `, [application.org_id, application.title, application.id]);
  
  // 2. Kiểm tra cross-fund (liên quỹ)
  // TODO: API integration với hệ thống quản lý nhiệm vụ KH&CN quốc gia
  
  return { hasDuplicate: duplicates.length > 0, matches: duplicates };
}
```

---

## 6. WORKFLOW STATE MACHINE — Điều 11 trong context

```
[call_published] 
    → [accepting_applications]  ← Điều 10
        → [submitted]  ← Điều 11 (HỒ SƠ NỘP)
            → [eligibility_screening]
                → [duplicate_check]
                    → [admin_review]  
                        → [council_review | expert_review | org_review]  ← Điều 12
                            → [financial_appraisal]  ← Điều 13
                                → [director_approval]  ← Điều 14
                                    → [approved → public_disclosure]
                                        → [contract_drafting → contract_signed]  ← Điều 15
```

### SLA cho bước Điều 11:

| Hành động | Thời hạn | Alert |
|---|---|---|
| Thời gian nhận hồ sơ (call open) | ≥ 30 ngày | Cảnh báo 5 ngày trước đóng |
| Kiểm tra tính hợp lệ hồ sơ | 5 ngày làm việc | Overdue alert |
| Yêu cầu bổ sung hồ sơ | 1 lần, 10 ngày để bổ sung | Auto-reject nếu quá hạn |

---

## 7. FRONTEND FORM DESIGN (UX)

### 7.1 Multi-step wizard

```
Step 1: Thông tin chung (loại nhiệm vụ, lĩnh vực, thời gian)
Step 2: Tổ chức chủ trì (auto-fill từ profile DN)
Step 3: Chủ nhiệm nhiệm vụ (chọn từ danh sách hoặc thêm mới)
Step 4: Mục tiêu & Nội dung thực hiện (dynamic form)
Step 5: Sản phẩm đầu ra (table input)
Step 6: Tiến độ thực hiện (timeline builder)
Step 7: Dự toán kinh phí (spreadsheet-like)
Step 8: Nhóm nghiên cứu (team builder)
Step 9: Tài liệu đính kèm (upload zone)
Step 10: Cam kết & Nộp (declarations + submit)
```

### 7.2 Conditional logic

- Nếu `funding_mechanism = 'dat_hang'` → hiện thêm field chương trình + văn bản giao
- Nếu `task_category = 'doi_moi_cong_nghe'` → hiện thêm section công nghệ chuyển giao
- Nếu `task_category = 'khoi_nghiep'` → hiện thêm section mô hình kinh doanh
- Nếu có đơn vị phối hợp → hiện upload văn bản xác nhận

---

## 8. KHUYẾN NGHỊ TRIỂN KHAI OMS

### 8.1 Priority (Immediate)

1. **DB Migration:** Tạo 6 bảng mới (thuyet_minh, noi_dung, san_pham, du_toan, nhom_nghien_cuu, tien_do)
2. **API:** CRUD endpoints cho từng bảng con, nested under `/applications/:id/`
3. **Frontend:** Multi-step form wizard với auto-save draft
4. **Validation:** Server-side validation theo rules Section 5
5. **Declaration module:** Checkbox cam kết + timestamp + IP log

### 8.2 Medium-term

1. **Template engine:** Mẫu biểu PDF export theo đúng format hành chính
2. **Duplicate check:** Similarity search + cross-reference
3. **Budget calculator:** Auto-sum, ratio check, ceiling check
4. **Program linkage:** Dropdown chương trình đã phê duyệt cho đặt hàng
5. **SLA engine:** Deadline tracking + notification triggers

### 8.3 Architecture decision

| Decision | Choice | Rationale |
|---|---|---|
| Form data storage | Relational (normalized tables) | ACID cho tài chính, query cho báo cáo |
| Dynamic fields | JSONB column per section | Linh hoạt theo loại nhiệm vụ |
| File storage | S3-compatible + metadata in DB | Scalable, virus scan, versioning |
| PDF generation | Server-side (Puppeteer/WeasyPrint) | Đảm bảo format hành chính chuẩn |
| Draft/autosave | Redis + periodic DB flush | UX tốt, không mất dữ liệu |

---

## 9. KẾT LUẬN

Điều 11 NĐ 268/2025 quy định **bộ hồ sơ đề xuất nhiệm vụ ĐMST** là điểm nhập liệu quan trọng nhất của OMS. Kết hợp với NĐ 77/2026:

- **Tài trợ:** Quỹ tự công bố → DN nộp → Giám đốc Quỹ phê duyệt. Linh hoạt, không cần chương trình.
- **Đặt hàng:** Phải gắn chương trình ĐMST quốc gia đã được phê duyệt → ràng buộc chặt hơn về đầu ra, kinh phí, thẩm quyền.

OMS cần:
1. Form wizard 10 bước với conditional logic theo loại nhiệm vụ + cơ chế tài trợ/đặt hàng
2. 6 bảng dữ liệu normalized cho thuyết minh chi tiết
3. Validation engine tuân thủ pháp lý
4. Declaration/attestation module với audit trail
5. SLA tracking từ thời điểm nộp
6. PDF export theo mẫu hành chính chuẩn

---

*Logged to: bmad_memory/plans/dieu-11-nd268-form-analysis.md*  
*Cross-ref: plans/nghi-dinh-268-2025-analysis.md, plans/nghi-dinh-77-2026-analysis.md*
