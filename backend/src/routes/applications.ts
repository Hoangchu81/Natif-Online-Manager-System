import type { AuthRequest } from '../middleware/auth.js';
import type { Response } from 'express';
import pool from '../config/database.js';
import type { Application } from '../types/index.js';

export async function getApplications(req: AuthRequest, res: Response) {
  const { status, program_type, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT a.*, u.full_name as user_name, u.email as user_email
    FROM applications a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (req.userRole !== 'admin') {
    query += ` AND a.user_id = $${paramIdx++}`;
    params.push(req.userId!);
  }

  if (status) {
    query += ` AND a.status = $${paramIdx++}`;
    params.push(status as string);
  }

  if (program_type) {
    query += ` AND a.program_type = $${paramIdx++}`;
    params.push(program_type as string);
  }

  const countResult = await pool.query(query.replace('SELECT a.*, u.full_name as user_name, u.email as user_email', 'SELECT COUNT(*)'), params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY a.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(Number(limit), offset);

  const result = await pool.query(query, params);

  res.json({
    data: result.rows,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
}

export async function getApplication(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT a.*, u.full_name as user_name, u.email as user_email
     FROM applications a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = $1`,
    [id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  const app = result.rows[0];
  if (req.userRole !== 'admin' && app.user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }

  res.json(app);
}

export async function createApplication(req: AuthRequest, res: Response) {
  const {
    program_type, company_name, tax_code, contact_name,
    contact_email, contact_phone, title, description, budget_requested,
  } = req.body;

  if (!program_type || !company_name || !tax_code || !contact_name || !contact_email || !title || budget_requested === undefined) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  const validTypes = ['interest_subsidy', 'sponsorship', 'voucher', 'ecosystem'];
  if (!validTypes.includes(program_type)) {
    return res.status(400).json({ error: 'Loại chương trình không hợp lệ' });
  }

  const result = await pool.query(
    `INSERT INTO applications
      (user_id, program_type, company_name, tax_code, contact_name, contact_email, contact_phone, title, description, budget_requested, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft')
     RETURNING *`,
    [req.userId || null, program_type, company_name, tax_code, contact_name, contact_email, contact_phone || '', title, description || '', budget_requested]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateApplication(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, reviewer_notes } = req.body;

  const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  if (req.userRole !== 'admin') {
    if (existing.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Không có quyền sửa' });
    }
    if (existing.rows[0].status !== 'draft') {
      return res.status(400).json({ error: 'Chỉ có thể sửa hồ sơ ở trạng thái nháp' });
    }
  }

  let query = 'UPDATE applications SET updated_at = NOW()';
  const params: (string | number)[] = [];
  let idx = 1;

  if (req.userRole === 'admin' && status) {
    query += `, status = $${idx++}`;
    params.push(status);
    if (status === 'submitted') query += `, submitted_at = NOW()`;
    if (status === 'approved' || status === 'rejected') query += `, reviewed_at = NOW()`;
  }

  if (req.userRole === 'admin' && reviewer_notes !== undefined) {
    query += `, reviewer_notes = $${idx++}`;
    params.push(reviewer_notes);
  }

  if (req.userRole !== 'admin') {
    const fields = ['program_type', 'company_name', 'tax_code', 'contact_name', 'contact_email', 'contact_phone', 'title', 'description', 'budget_requested'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        query += `, ${f} = $${idx++}`;
        params.push(req.body[f]);
      }
    }
  }

  query += ` WHERE id = $${idx++} RETURNING *`;
  params.push(id);

  const result = await pool.query(query, params);
  res.json(result.rows[0]);
}

export async function deleteApplication(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  if (req.userRole !== 'admin' && existing.rows[0].user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền xóa' });
  }

  if (existing.rows[0].status !== 'draft') {
    return res.status(400).json({ error: 'Chỉ có thể xóa hồ sơ ở trạng thái nháp' });
  }

  await pool.query('DELETE FROM applications WHERE id = $1', [id]);
  res.json({ message: 'Đã xóa hồ sơ' });
}

export async function submitApplication(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

  if (existing.rows[0].user_id !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  const result = await pool.query(
    `UPDATE applications SET status = 'submitted', submitted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  res.json(result.rows[0]);
}
