import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export async function createAssignment(req: AuthRequest, res: Response) {
  const { application_id, expert_id, deadline } = req.body;
  if (!application_id || !expert_id) {
    return res.status(400).json({ error: 'Thiếu application_id hoặc expert_id' });
  }

  const expert = await pool.query('SELECT id, role FROM users WHERE id = $1', [expert_id]);
  if (!expert.rows.length || expert.rows[0].role !== 'expert') {
    return res.status(400).json({ error: 'User không phải chuyên gia' });
  }

  const existing = await pool.query(
    'SELECT id FROM expert_assignments WHERE application_id = $1 AND expert_id = $2',
    [application_id, expert_id]
  );
  if (existing.rows.length) {
    return res.status(400).json({ error: 'Chuyên gia đã được gán cho hồ sơ này' });
  }

  const result = await pool.query(
    `INSERT INTO expert_assignments (application_id, expert_id, assigned_by, deadline)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [application_id, expert_id, req.userId, deadline || null]
  );
  res.status(201).json(result.rows[0]);
}

export async function listAssignments(req: AuthRequest, res: Response) {
  const { expert_id, application_id, status } = req.query;
  let query = `
    SELECT ea.*, a.title as application_title, a.company_name, a.program_type, a.budget_requested, a.status as application_status,
           u.full_name as expert_name, u.email as expert_email,
           ab.full_name as assigned_by_name
    FROM expert_assignments ea
    JOIN applications a ON ea.application_id = a.id
    JOIN users u ON ea.expert_id = u.id
    LEFT JOIN users ab ON ea.assigned_by = ab.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (req.userRole === 'expert') {
    query += ` AND ea.expert_id = $${idx++}`;
    params.push(req.userId);
  } else if (expert_id) {
    query += ` AND ea.expert_id = $${idx++}`;
    params.push(expert_id);
  }

  if (application_id) {
    query += ` AND ea.application_id = $${idx++}`;
    params.push(application_id);
  }

  if (status) {
    query += ` AND ea.status = $${idx++}`;
    params.push(status);
  }

  query += ' ORDER BY ea.created_at DESC';
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function updateAssignment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await pool.query('SELECT * FROM expert_assignments WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy' });

  if (req.userRole === 'expert' && existing.rows[0].expert_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  if (req.userRole === 'expert' && !['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Chuyên gia chỉ có thể chấp nhận hoặc từ chối' });
  }

  const result = await pool.query(
    'UPDATE expert_assignments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  res.json(result.rows[0]);
}

export async function deleteAssignment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM expert_assignments WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ message: 'Đã hủy gán' });
}
