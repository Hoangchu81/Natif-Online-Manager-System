import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';
import { notificationService } from '../services/notification.js';

/**
 * Workflow transitions based on Nghị định 268/2025/NĐ-CP
 *
 * Path: draft→submitted→received→director_review→dept_assigned→preliminary_review→action_taken→council_evaluation→summarized→dept_approved→approved
 *
 * Key branch: action_taken can go to:
 *   - survey_conducted → council_evaluation
 *   - supplementary_requested → preliminary_review (after enterprise uploads supplement)
 *   - rejected (final)
 *   - council_evaluation (skip survey, go directly)
 */
const VALID_TRANSITIONS: Record<string, { roles: string[]; to: string[] }> = {
  submitted: { roles: ['clerk', 'admin'], to: ['received'] },
  received: { roles: ['clerk', 'admin'], to: ['director_review'] },
  director_review: { roles: ['director', 'admin'], to: ['dept_assigned', 'returned'] },
  dept_assigned: { roles: ['dept_head', 'admin'], to: ['preliminary_review', 'returned'] },
  preliminary_review: { roles: ['officer', 'dept_head', 'admin'], to: ['action_taken', 'returned'] },
  action_taken: { roles: ['director', 'admin'], to: ['council_evaluation', 'survey_conducted', 'supplementary_requested', 'rejected'] },
  supplementary_requested: { roles: ['enterprise', 'admin'], to: ['preliminary_review'] },
  survey_conducted: { roles: ['dept_head', 'admin'], to: ['council_evaluation'] },
  council_evaluation: { roles: ['officer', 'admin'], to: ['summarized'] },
  summarized: { roles: ['dept_head', 'admin'], to: ['dept_approved', 'returned'] },
  dept_approved: { roles: ['director', 'admin'], to: ['approved', 'rejected', 'returned'] },
};

export async function transition(req: AuthRequest, res: Response) {
  const {
    application_id,
    to_status,
    notes,
    dept_head_id,
    officer_id,
    scenario,
    proposal_notes,
    director_decision_notes,
  } = req.body;

  if (!application_id || !to_status) {
    return res.status(400).json({ error: 'Thiếu application_id hoặc to_status' });
  }

  const app = await pool.query('SELECT id, status, user_id FROM applications WHERE id = $1', [application_id]);
  if (!app.rows.length) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

  const currentStatus = app.rows[0].status;
  const rule = VALID_TRANSITIONS[currentStatus];

  if (!rule) {
    return res.status(400).json({ error: `Không thể chuyển trạng thái từ '${currentStatus}'` });
  }

  if (!rule.roles.includes(req.userRole!)) {
    return res.status(403).json({ error: 'Không có quyền thực hiện thao tác này' });
  }

  // Enterprise can only transition their own applications
  if (req.userRole === 'enterprise' && app.rows[0].user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền thao tác hồ sơ này' });
  }

  if (!rule.to.includes(to_status)) {
    return res.status(400).json({ error: `Không thể chuyển từ '${currentStatus}' sang '${to_status}'` });
  }

  // Build update fields based on transition
  const updates: string[] = ['status = $1', 'updated_at = NOW()'];
  const params: unknown[] = [to_status];
  let paramIdx = 2;

  if (dept_head_id && to_status === 'dept_assigned') {
    updates.push(`dept_head_id = $${paramIdx++}`);
    params.push(dept_head_id);
  }

  if (officer_id && to_status === 'preliminary_review') {
    updates.push(`officer_id = $${paramIdx++}`);
    params.push(officer_id);
  }

  if (scenario && to_status === 'action_taken') {
    updates.push(`scenario = $${paramIdx++}`);
    params.push(scenario);
  }

  if ((proposal_notes || notes) && to_status === 'action_taken') {
    updates.push(`proposal_notes = $${paramIdx++}`);
    params.push(proposal_notes || notes);
  }

  if (director_decision_notes && to_status === 'council_evaluation') {
    updates.push(`director_decision_notes = $${paramIdx++}`);
    params.push(director_decision_notes);
  }

  if (to_status === 'survey_conducted') {
    updates.push(`survey_completed_at = NOW()`);
  }

  if (notes && to_status !== 'action_taken') {
    updates.push(`reviewer_notes = $${paramIdx++}`);
    params.push(notes);
  }

  params.push(application_id);

  await pool.query(
    `UPDATE applications SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
    params
  );

  await pool.query(
    `INSERT INTO application_workflow (application_id, from_status, to_status, action_by, action_role, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [application_id, currentStatus, to_status, req.userId, req.userRole, notes || null]
  );

  // Send workflow notification
  const updatedApp = await pool.query('SELECT * FROM applications WHERE id = $1', [application_id]);
  const appData = updatedApp.rows[0];
  const deptHead = dept_head_id
    ? await pool.query<{ id: string; email: string; full_name: string }>(
        'SELECT id, email, full_name FROM users WHERE id = $1', [dept_head_id])
    : { rows: [] };

  notificationService.notifyWorkflowTransition(pool, {
    id: appData.id,
    title: appData.title,
    company_name: appData.company_name,
    contact_email: appData.contact_email,
    contact_name: appData.contact_name,
    status: appData.status,
    scenario: appData.scenario || scenario,
    proposal_notes: appData.proposal_notes || proposal_notes || notes,
    director_decision_notes: appData.director_decision_notes || director_decision_notes,
    supplementary_deadline: appData.supplementary_deadline,
  }, to_status, {
    enterpriseId: appData.user_id,
    deptHeadId: dept_head_id,
    deptHeadEmail: deptHead.rows[0]?.email,
    deptHeadName: deptHead.rows[0]?.full_name,
  }).catch(err => console.error('[NOTIFICATION] workflow transition failed:', err));

  res.json({ message: 'Chuyển trạng thái thành công', from: currentStatus, to: to_status });
}

export async function getHistory(req: AuthRequest, res: Response) {
  const { applicationId } = req.params;

  // Access check: enterprise can only see own app history
  if (req.userRole === 'enterprise') {
    const appCheck = await pool.query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
    if (!appCheck.rows.length || appCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
  }

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
