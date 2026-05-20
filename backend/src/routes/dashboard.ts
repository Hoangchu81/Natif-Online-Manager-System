import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'submitted') as pending_review,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved'), 0) as total_approved_budget,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved') * 0.3, 0) as total_disbursed_estimate
    FROM applications
  `);

  const byProgram = await pool.query(`
    SELECT program_type, COUNT(*) as count, COALESCE(SUM(budget_requested),0) as budget
    FROM applications GROUP BY program_type ORDER BY count DESC
  `);

  const recent = await pool.query(`
    SELECT a.id, a.title, a.status, a.program_type, a.company_name, a.created_at,
           u.full_name as user_name
    FROM applications a LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 5
  `);

  res.json({
    stats: {
      total_applications: parseInt(stats.rows[0].total),
      pending_review: parseInt(stats.rows[0].pending_review),
      approved: parseInt(stats.rows[0].approved),
      rejected: parseInt(stats.rows[0].rejected),
      total_approved_budget: parseFloat(stats.rows[0].total_approved_budget),
      total_disbursed_estimate: parseFloat(stats.rows[0].total_disbursed_estimate),
    },
    by_program: byProgram.rows,
    recent_applications: recent.rows,
  });
}

export async function getUserStats(req: AuthRequest, res: Response) {
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'submitted') as pending,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'draft') as drafts,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved'), 0) as total_approved
    FROM applications WHERE user_id = $1
  `, [req.userId]);

  const apps = await pool.query(`
    SELECT id, title, program_type, status, budget_requested, created_at, submitted_at
    FROM applications WHERE user_id = $1 ORDER BY created_at DESC
  `, [req.userId]);

  res.json({
    stats: {
      total: parseInt(stats.rows[0].total),
      pending: parseInt(stats.rows[0].pending),
      approved: parseInt(stats.rows[0].approved),
      drafts: parseInt(stats.rows[0].drafts),
      total_approved: parseFloat(stats.rows[0].total_approved),
    },
    applications: apps.rows,
  });
}
