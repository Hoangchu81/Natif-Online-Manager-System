import type { AuthRequest } from '../middleware/auth.js';
import type { Response } from 'express';
import pool from '../config/database.js';
import { notificationService } from '../services/notification.js';

const STATUS_MAP: Record<string, string[]> = {
  clerk: ['submitted', 'received', 'director_review'],
  director: ['director_review', 'dept_assigned', 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized', 'dept_approved'],
  dept_head: ['dept_assigned', 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized', 'dept_approved'],
  officer: ['preliminary_review', 'action_taken', 'council_evaluation', 'summarized'],
  enterprise: [],
  expert: [],
  moderator: [],
};

export async function getApplications(req: AuthRequest, res: Response) {
  const { status, program_type, page = 1, limit = 10, my_assignments } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT a.*,
           u.full_name as user_name, u.email as user_email,
           o.full_name as officer_name,
           dh.full_name as dept_head_name,
           COUNT(*) OVER() as _total_count
    FROM applications a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN users o ON a.officer_id = o.id
    LEFT JOIN users dh ON a.dept_head_id = dh.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let paramIdx = 1;

  // Role-based filtering
  if (req.userRole === 'clerk') {
    query += ` AND a.status IN ($${paramIdx++}, $${paramIdx++}, $${paramIdx++})`;
    params.push('submitted', 'received', 'director_review');
  } else if (req.userRole === 'director') {
    query += ` AND a.status IN ($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`;
    params.push('director_review', 'dept_assigned', 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized', 'dept_approved');
  } else if (req.userRole === 'dept_head') {
    query += ` AND (a.dept_head_id = $${paramIdx++} OR a.dept_head_id IS NULL) AND a.status IN ($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`;
    params.push(req.userId!, 'dept_assigned', 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized', 'dept_approved');
  } else if (req.userRole === 'officer') {
    if (my_assignments === 'true') {
      query += ` AND a.officer_id = $${paramIdx++} AND a.status IN ($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`;
      params.push(req.userId!, 'preliminary_review', 'action_taken', 'council_evaluation', 'summarized');
    } else {
      query += ` AND a.status IN ($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`;
      params.push('preliminary_review', 'action_taken', 'council_evaluation', 'summarized');
    }
  } else if (req.userRole === 'enterprise' || req.userRole === 'expert' || req.userRole === 'moderator') {
    query += ` AND a.user_id = $${paramIdx++}`;
    params.push(req.userId!);
  }
  // admin sees all

  if (status) {
    query += ` AND a.status = $${paramIdx++}`;
    params.push(status as string);
  }

  if (program_type) {
    query += ` AND a.program_type = $${paramIdx++}`;
    params.push(program_type as string);
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);
  const total = result.rows.length > 0 ? parseInt(result.rows[0]._total_count) : 0;

  res.json({
    data: result.rows.map(r => { const { _total_count, ...rest } = r; return rest; }),
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}

export async function getApplication(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT a.*,
            u.full_name as user_name, u.email as user_email,
            o.full_name as officer_name,
            dh.full_name as dept_head_name
     FROM applications a
     LEFT JOIN users u ON a.user_id = u.id
     LEFT JOIN users o ON a.officer_id = o.id
     LEFT JOIN users dh ON a.dept_head_id = dh.id
     WHERE a.id = $1`,
    [id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  const app = result.rows[0];
  // Role-based access
  if (req.userRole !== 'admin' && req.userRole !== 'enterprise' && req.userRole !== 'expert' && req.userRole !== 'moderator') {
    // Staff roles: check assignment
    if (req.userRole === 'officer' && app.officer_id !== req.userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    if (req.userRole === 'dept_head' && app.dept_head_id !== req.userId && app.status !== 'dept_assigned') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
  } else if (req.userRole === 'enterprise' || req.userRole === 'expert' || req.userRole === 'moderator') {
    if (app.user_id !== req.userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
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

  // Send notification
  const app = result.rows[0];
  notificationService.notifyApplicationSubmitted(pool, {
    id: app.id,
    title: app.title,
    company_name: app.company_name,
    tax_code: app.tax_code,
    contact_name: app.contact_name,
    contact_email: app.contact_email,
    contact_phone: app.contact_phone,
    program_type: app.program_type,
    budget_requested: app.budget_requested,
    submitted_at: app.submitted_at,
    user_id: app.user_id,
  }).catch(err => console.error('[NOTIFICATION] submitApplication failed:', err));

  res.json(result.rows[0]);
}
