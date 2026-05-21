import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

const VALID_TRANSITIONS: Record<string, { roles: string[]; to: string[] }> = {
  submitted: { roles: ['clerk', 'admin'], to: ['received'] },
  received: { roles: ['clerk', 'admin'], to: ['assigned'] },
  assigned: { roles: ['officer', 'admin'], to: ['preliminary_review'] },
  preliminary_review: { roles: ['officer', 'admin'], to: ['expert_review', 'returned'] },
  expert_review: { roles: ['officer', 'admin'], to: ['summarized'] },
  summarized: { roles: ['dept_head', 'admin'], to: ['dept_approved', 'dept_rejected', 'returned'] },
  dept_approved: { roles: ['director', 'admin'], to: ['approved', 'rejected', 'returned'] },
  dept_rejected: { roles: ['director', 'admin'], to: ['rejected', 'returned'] },
};

export async function transition(req: AuthRequest, res: Response) {
  const { application_id, to_status, notes } = req.body;

  if (!application_id || !to_status) {
    return res.status(400).json({ error: 'Thiếu application_id hoặc to_status' });
  }

  const app = await pool.query('SELECT id, status FROM applications WHERE id = $1', [application_id]);
  if (!app.rows.length) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

  const currentStatus = app.rows[0].status;
  const rule = VALID_TRANSITIONS[currentStatus];

  if (!rule) {
    return res.status(400).json({ error: `Không thể chuyển trạng thái từ '${currentStatus}'` });
  }

  if (!rule.roles.includes(req.userRole!)) {
    return res.status(403).json({ error: 'Không có quyền chuyển trạng thái này' });
  }

  if (!rule.to.includes(to_status)) {
    return res.status(400).json({ error: `Không thể chuyển từ '${currentStatus}' sang '${to_status}'` });
  }

  await pool.query(
    'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
    [to_status, application_id]
  );

  await pool.query(
    `INSERT INTO application_workflow (application_id, from_status, to_status, action_by, action_role, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [application_id, currentStatus, to_status, req.userId, req.userRole, notes || null]
  );

  res.json({ message: 'Chuyển trạng thái thành công', from: currentStatus, to: to_status });
}

export async function getHistory(req: AuthRequest, res: Response) {
  const { applicationId } = req.params;
  const result = await pool.query(
    `SELECT aw.*, u.full_name as action_by_name
     FROM application_workflow aw
     LEFT JOIN users u ON aw.action_by = u.id
     WHERE aw.application_id = $1
     ORDER BY aw.created_at ASC`,
    [applicationId]
  );
  res.json({ data: result.rows });
}
