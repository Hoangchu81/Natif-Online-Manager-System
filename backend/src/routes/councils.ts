import type { AuthRequest } from '../middleware/auth.js';
import type { Response } from 'express';
import pool from '../config/database.js';

// List councils (for dept_head to manage their applications' councils)
export async function listCouncils(req: AuthRequest, res: Response) {
  const { application_id } = req.query;

  let query = `
    SELECT c.*,
           a.title as application_title, a.company_name,
           (SELECT COUNT(*) FROM council_members WHERE council_id = c.id) as member_count
    FROM councils c
    JOIN applications a ON c.application_id = a.id
    WHERE 1=1
  `;
  const params: string[] = [];
  let idx = 1;

  if (application_id) {
    query += ` AND c.application_id = $${idx++}`;
    params.push(application_id as string);
  }

  if (req.userRole === 'dept_head') {
    query += ` AND a.dept_head_id = $${idx++}`;
    params.push(req.userId!);
  }

  query += ` ORDER BY c.created_at DESC`;
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

// Get single council with members
export async function getCouncil(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const council = await pool.query(
    `SELECT c.*, a.title as application_title, a.company_name, a.status as application_status
     FROM councils c JOIN applications a ON c.application_id = a.id WHERE c.id = $1`,
    [id]
  );
  if (!council.rows.length) return res.status(404).json({ error: 'Không tìm thấy hội đồng' });

  const members = await pool.query(
    `SELECT cm.*, u.full_name as user_name, u.email as user_email
     FROM council_members cm LEFT JOIN users u ON cm.user_id = u.id
     WHERE cm.council_id = $1 ORDER BY cm.created_at`,
    [id]
  );

  const meetings = await pool.query(
    `SELECT cm.*, u.full_name as created_by_name
     FROM council_meetings cm LEFT JOIN users u ON cm.created_by = u.id
     WHERE cm.council_id = $1 ORDER BY cm.meeting_date DESC NULLS LAST`,
    [id]
  );

  res.json({
    ...council.rows[0],
    members: members.rows,
    meetings: meetings.rows,
  });
}

// Create council
export async function createCouncil(req: AuthRequest, res: Response) {
  const { application_id, name, evaluation_deadline, notes } = req.body;

  if (!application_id) {
    return res.status(400).json({ error: 'Thiếu application_id' });
  }

  // Verify application exists and user has permission
  const app = await pool.query('SELECT * FROM applications WHERE id = $1', [application_id]);
  if (!app.rows.length) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

  if (req.userRole !== 'admin' && req.userRole !== 'dept_head') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  // Check if council already exists
  const existing = await pool.query('SELECT id FROM councils WHERE application_id = $1', [application_id]);
  if (existing.rows.length) {
    return res.status(400).json({ error: 'Hội đồng đã tồn tại cho hồ sơ này' });
  }

  const result = await pool.query(
    `INSERT INTO councils (application_id, name, evaluation_deadline, notes, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [application_id, name || null, evaluation_deadline || null, notes || null, req.userId]
  );

  res.status(201).json(result.rows[0]);
}

// Update council
export async function updateCouncil(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, evaluation_deadline, notes } = req.body;

  const existing = await pool.query('SELECT * FROM councils WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy hội đồng' });

  const result = await pool.query(
    `UPDATE councils SET name = COALESCE($1, name), evaluation_deadline = COALESCE($2, evaluation_deadline),
     notes = COALESCE($3, notes), updated_at = NOW() WHERE id = $4 RETURNING *`,
    [name, evaluation_deadline, notes, id]
  );

  res.json(result.rows[0]);
}

// Delete council
export async function deleteCouncil(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT * FROM councils WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy hội đồng' });

  await pool.query('DELETE FROM councils WHERE id = $1', [id]);
  res.json({ message: 'Đã xóa hội đồng' });
}

// --- Council Members ---

export async function addCouncilMember(req: AuthRequest, res: Response) {
  const { council_id, user_id, expert_name, expert_email, role, responsibility } = req.body;

  if (!council_id || !role) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  const validRoles = ['chairman', 'member', 'secretary', 'enterprise_rep'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ' });
  }

  const council = await pool.query('SELECT * FROM councils WHERE id = $1', [council_id]);
  if (!council.rows.length) return res.status(404).json({ error: 'Không tìm thấy hội đồng' });

  const result = await pool.query(
    `INSERT INTO council_members (council_id, user_id, expert_name, expert_email, role, responsibility)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [council_id, user_id || null, expert_name || null, expert_email || null, role, responsibility || null]
  );

  res.status(201).json(result.rows[0]);
}

export async function removeCouncilMember(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await pool.query('DELETE FROM council_members WHERE id = $1', [id]);
  res.json({ message: 'Đã xóa thành viên' });
}

// --- Council Meetings ---

export async function addCouncilMeeting(req: AuthRequest, res: Response) {
  const { council_id, application_id, meeting_date, meeting_location, attendees, discussion_summary, recommendation, recommendation_notes } = req.body;

  if (!council_id || !application_id) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  const validRecs = ['approve', 'reject', 'revise', 'defer'];
  if (recommendation && !validRecs.includes(recommendation)) {
    return res.status(400).json({ error: 'Kết luận không hợp lệ' });
  }

  const result = await pool.query(
    `INSERT INTO council_meetings
     (council_id, application_id, meeting_date, meeting_location, attendees, discussion_summary, recommendation, recommendation_notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [council_id, application_id, meeting_date || null, meeting_location || null, attendees || null,
     discussion_summary || null, recommendation || null, recommendation_notes || null, req.userId]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateCouncilMeeting(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { meeting_date, meeting_location, attendees, discussion_summary, recommendation, recommendation_notes } = req.body;

  const result = await pool.query(
    `UPDATE council_meetings SET
     meeting_date = COALESCE($1, meeting_date),
     meeting_location = COALESCE($2, meeting_location),
     attendees = COALESCE($3, attendees),
     discussion_summary = COALESCE($4, discussion_summary),
     recommendation = COALESCE($5, recommendation),
     recommendation_notes = COALESCE($6, recommendation_notes),
     updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [meeting_date, meeting_location, attendees, discussion_summary, recommendation, recommendation_notes, id]
  );

  res.json(result.rows[0]);
}

export async function getCouncilMeetings(req: AuthRequest, res: Response) {
  const { council_id } = req.query;
  const result = await pool.query(
    `SELECT cm.*, u.full_name as created_by_name
     FROM council_meetings cm LEFT JOIN users u ON cm.created_by = u.id
     WHERE $1::text IS NULL OR cm.council_id = $1
     ORDER BY cm.meeting_date DESC NULLS LAST`,
    [council_id || null]
  );
  res.json({ data: result.rows });
}
