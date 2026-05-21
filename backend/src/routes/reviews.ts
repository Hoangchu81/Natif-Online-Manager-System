import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export async function createReview(req: AuthRequest, res: Response) {
  const {
    assignment_id, application_id,
    score_innovation, score_feasibility, score_impact, score_budget, score_team,
    recommendation, strengths, weaknesses, comments
  } = req.body;

  if (!assignment_id || !application_id) {
    return res.status(400).json({ error: 'Thiếu assignment_id hoặc application_id' });
  }

  const assignment = await pool.query(
    'SELECT * FROM expert_assignments WHERE id = $1 AND expert_id = $2',
    [assignment_id, req.userId]
  );
  if (!assignment.rows.length) {
    return res.status(403).json({ error: 'Không tìm thấy assignment hoặc không có quyền' });
  }

  const existing = await pool.query(
    'SELECT id FROM expert_reviews WHERE assignment_id = $1 AND expert_id = $2',
    [assignment_id, req.userId]
  );
  if (existing.rows.length) {
    return res.status(400).json({ error: 'Đã gửi đánh giá cho assignment này' });
  }

  const overall = ((score_innovation || 0) + (score_feasibility || 0) + (score_impact || 0) + (score_budget || 0) + (score_team || 0)) / 5;

  const result = await pool.query(
    `INSERT INTO expert_reviews
      (assignment_id, expert_id, application_id, score_innovation, score_feasibility,
       score_impact, score_budget, score_team, overall_score, recommendation,
       strengths, weaknesses, comments, submitted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW()) RETURNING *`,
    [assignment_id, req.userId, application_id, score_innovation, score_feasibility,
     score_impact, score_budget, score_team, overall.toFixed(1), recommendation,
     strengths, weaknesses, comments]
  );

  await pool.query(
    "UPDATE expert_assignments SET status = 'completed' WHERE id = $1",
    [assignment_id]
  );

  res.status(201).json(result.rows[0]);
}

export async function listReviews(req: AuthRequest, res: Response) {
  const { application_id, expert_id } = req.query;
  let query = `
    SELECT er.*, u.full_name as expert_name, a.title as application_title
    FROM expert_reviews er
    JOIN users u ON er.expert_id = u.id
    JOIN applications a ON er.application_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (req.userRole === 'expert') {
    query += ` AND er.expert_id = $${idx++}`;
    params.push(req.userId);
  } else if (expert_id) {
    query += ` AND er.expert_id = $${idx++}`;
    params.push(expert_id);
  }

  if (application_id) {
    query += ` AND er.application_id = $${idx++}`;
    params.push(application_id);
  }

  query += ' ORDER BY er.created_at DESC';
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function getReview(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT er.*, u.full_name as expert_name, a.title as application_title
     FROM expert_reviews er
     JOIN users u ON er.expert_id = u.id
     JOIN applications a ON er.application_id = a.id
     WHERE er.id = $1`,
    [id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy' });

  if (req.userRole === 'expert' && result.rows[0].expert_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  res.json(result.rows[0]);
}
