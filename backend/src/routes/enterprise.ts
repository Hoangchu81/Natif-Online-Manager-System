import type { AuthRequest } from '../middleware/auth.js';
import type { Response } from 'express';
import pool from '../config/database.js';

// Document checklist templates per program type (Điều 11, Nghị định 268/2025)
export const DOCUMENT_CHECKLISTS: Record<string, Array<{ type: string; label: string; required: boolean; description: string }>> = {
  sponsorship: [
    { type: 'don_dang_ky', label: 'Đơn đăng ký (Mẫu I.1)', required: true, description: 'Đơn đăng ký thực hiện nhiệm vụ theo Mẫu số I.1 Phụ lục I' },
    { type: 'thuyet_minh_nhiem_vu', label: 'Thuyết minh nhiệm vụ (Mẫu I.2-I.5)', required: true, description: 'Thuyết minh nhiệm vụ tương ứng theo Mẫu số I.2, I.3, I.4 hoặc I.5 Phụ lục I' },
    { type: 'tu_cach_phap_ly', label: 'Tài liệu tư cách pháp lý', required: true, description: 'Quyết định thành lập hoặc Điều lệ hoạt động được cơ quan có thẩm quyền phê duyệt' },
    { type: 'cam_ket', label: 'Văn bản cam kết (Mẫu I.6)', required: true, description: 'Cam kết chỉ tiếp nhận duy nhất một nguồn kinh phí cho cùng nội dung theo Mẫu I.6' },
    { type: 'ho_so_du_an', label: 'Hồ sơ dự án đầu tư', required: false, description: 'Áp dụng đối với nhiệm vụ đổi mới công nghệ có yêu cầu' },
    { type: 'tai_lieu_khac', label: 'Tài liệu bổ sung khác', required: false, description: 'Theo yêu cầu của cơ quan quản lý nhiệm vụ ĐMST' },
  ],
  interest_subsidy: [
    { type: 'don_dang_ky', label: 'Đơn đăng ký', required: true, description: 'Đơn đăng ký theo quy định của Quỹ' },
    { type: 'giay_phep_kinh_doanh', label: 'Giấy phép kinh doanh', required: true, description: 'Bản sao có chứng thực Giấy phép kinh doanh' },
    { type: 'bao_cao_tai_chinh', label: 'Báo cáo tài chính', required: true, description: 'Báo cáo tài chính 02 năm gần nhất' },
    { type: 'ho_so_vay', label: 'Hồ sơ vay vốn', required: true, description: 'Hợp đồng tín dụng đã ký với ngân hàng' },
    { type: 'cam_ket', label: 'Cam kết sử dụng vốn', required: true, description: 'Cam kết sử dụng vốn đúng mục đích' },
    { type: 'tai_lieu_khac', label: 'Tài liệu bổ sung', required: false, description: 'Theo yêu cầu của Quỹ' },
  ],
  voucher: [
    { type: 'don_dang_ky', label: 'Đơn đăng ký', required: true, description: 'Đơn đăng ký theo Mẫu III.1 Phụ lục III' },
    { type: 'giay_phep_kinh_doanh', label: 'Giấy phép kinh doanh', required: true, description: 'Bản sao có chứng thực' },
    { type: 'de_xuat_dich_vu', label: 'Đề xuất dịch vụ', required: true, description: 'Đề xuất dịch vụ KH&CN theo mẫu' },
    { type: 'hop_dong_mau', label: 'Hợp đồng mẫu', required: true, description: 'Hợp đồng cung cấp dịch vụ mẫu' },
    { type: 'tai_lieu_khac', label: 'Tài liệu bổ sung', required: false, description: 'Theo yêu cầu' },
  ],
  ecosystem: [
    { type: 'don_dang_ky', label: 'Đơn đăng ký', required: true, description: 'Đơn đăng ký tham gia theo quy định' },
    { type: 'giay_phep_kinh_doanh', label: 'Giấy phép kinh doanh', required: true, description: 'Bản sao có chứng thực' },
    { type: 'ho_so_nhan_vien', label: 'Hồ sơ nhân viên', required: true, description: 'Danh sách nhân sự tham gia dự án' },
    { type: 'tam_nhin_du_an', label: 'Tầm nhìn dự án', required: true, description: 'Mô tả tầm nhìn và kế hoạch thực hiện' },
    { type: 'tai_lieu_khac', label: 'Tài liệu bổ sung', required: false, description: 'Theo yêu cầu' },
  ],
};

// --- Enterprise Profile ---

export async function getProfile(req: AuthRequest, res: Response) {
  const result = await pool.query(
    `SELECT ep.*, u.email, u.full_name, u.is_verified
     FROM enterprise_profiles ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.user_id = $1`,
    [req.userId]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Chưa có hồ sơ doanh nghiệp. Vui lòng tạo hồ sơ.' });
  }
  res.json(result.rows[0]);
}

export async function createProfile(req: AuthRequest, res: Response) {
  if (req.userRole !== 'enterprise' && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Chỉ tài khoản doanh nghiệp mới được tạo hồ sơ' });
  }

  const existing = await pool.query(
    'SELECT id FROM enterprise_profiles WHERE user_id = $1',
    [req.userId]
  );
  if (existing.rows.length) {
    return res.status(400).json({ error: 'Hồ sơ doanh nghiệp đã tồn tại. Vui lòng cập nhật.' });
  }

  const {
    company_name, tax_code, company_address, district, city,
    phone, email, website, company_type, founding_date,
    business_lines, employee_count, charter_capital, total_assets,
    rep_name, rep_position, rep_id_no, rep_id_issued_date, rep_id_issued_place,
    rep_phone, rep_email,
    bank_name, bank_branch, bank_account_no, bank_account_name,
    doc_dkkd_url,
  } = req.body;

  if (!company_name || !tax_code) {
    return res.status(400).json({ error: 'Thiếu tên công ty hoặc mã số thuế' });
  }

  const result = await pool.query(
    `INSERT INTO enterprise_profiles
     (user_id, company_name, tax_code, company_address, district, city,
      phone, email, website, company_type, founding_date,
      business_lines, employee_count, charter_capital, total_assets,
      rep_name, rep_position, rep_id_no, rep_id_issued_date, rep_id_issued_place,
      rep_phone, rep_email, bank_name, bank_branch, bank_account_no, bank_account_name,
      doc_dkkd_url, verification_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,'submitted')
     RETURNING *`,
    [req.userId, company_name, tax_code, company_address, district, city,
     phone, email, website, company_type, founding_date,
     business_lines, employee_count, charter_capital, total_assets,
     rep_name, rep_position, rep_id_no, rep_id_issued_date, rep_id_issued_place,
     rep_phone, rep_email, bank_name, bank_branch, bank_account_no, bank_account_name,
     doc_dkkd_url]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const existing = await pool.query(
    'SELECT id, verification_status FROM enterprise_profiles WHERE user_id = $1',
    [req.userId]
  );

  const allowedFields = [
    'company_name', 'tax_code', 'company_address', 'district', 'city',
    'phone', 'email', 'website', 'company_type', 'founding_date',
    'business_lines', 'employee_count', 'charter_capital', 'total_assets',
    'rep_name', 'rep_position', 'rep_id_no', 'rep_id_issued_date', 'rep_id_issued_place',
    'rep_phone', 'rep_email',
    'bank_name', 'bank_branch', 'bank_account_no', 'bank_account_name',
    'doc_dkkd_url',
  ];

  const updates: string[] = ['updated_at = NOW()'];
  const params: unknown[] = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      params.push(req.body[field]);
    }
  }

  // If profile was rejected, allow re-submission
  if (existing.rows.length && existing.rows[0].verification_status === 'rejected') {
    updates.push(`verification_status = 'submitted'`);
  }

  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Chưa có hồ sơ. Vui lòng tạo trước.' });
  }

  params.push(req.userId);
  const result = await pool.query(
    `UPDATE enterprise_profiles SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    params
  );

  res.json(result.rows[0]);
}

// --- Admin: List & Verify Enterprise Profiles ---

export async function listProfiles(req: AuthRequest, res: Response) {
  if (req.userRole !== 'admin' && req.userRole !== 'clerk') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  const { status, search } = req.query;
  let query = `
    SELECT ep.*, u.email, u.full_name, u.is_verified, u.created_at as user_created_at
    FROM enterprise_profiles ep
    JOIN users u ON ep.user_id = u.id
    WHERE 1=1
  `;
  const params: string[] = [];
  let idx = 1;

  if (status) {
    query += ` AND ep.verification_status = $${idx++}`;
    params.push(status as string);
  }

  if (search) {
    query += ` AND (ep.company_name ILIKE $${idx} OR ep.tax_code ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  query += ` ORDER BY ep.created_at DESC`;
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function verifyProfile(req: AuthRequest, res: Response) {
  if (req.userRole !== 'admin' && req.userRole !== 'clerk') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  const { id } = req.params;
  const { action, notes } = req.body; // action: 'verify' | 'reject'

  if (!['verify', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action phải là "verify" hoặc "reject"' });
  }

  const newStatus = action === 'verify' ? 'verified' : 'rejected';

  await pool.query(
    `UPDATE enterprise_profiles
     SET verification_status = $1, verification_notes = $2, verified_at = NOW(), verified_by = $3
     WHERE id = $4`,
    [newStatus, notes || null, req.userId, id]
  );

  if (action === 'verify') {
    await pool.query(
      `UPDATE users SET is_verified = TRUE, verified_at = NOW(), verified_by = $1 WHERE id = (SELECT user_id FROM enterprise_profiles WHERE id = $2)`,
      [req.userId, id]
    );
  }

  res.json({ message: `Hồ sơ đã được ${action === 'verify' ? 'phê duyệt' : 'từ chối'}` });
}
