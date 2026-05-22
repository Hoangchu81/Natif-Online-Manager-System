import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status IN ('submitted','received','director_review','dept_assigned')) as pending,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status IN ('preliminary_review','action_taken','council_evaluation','summarized')) as under_review,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved'), 0) as total_approved_budget,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved') * 0.3, 0) as total_disbursed_estimate
    FROM applications
  `);

  const byProgram = await pool.query(`
    SELECT program_type, COUNT(*) as count, COALESCE(SUM(budget_requested),0) as budget
    FROM applications GROUP BY program_type ORDER BY count DESC
  `);

  const byStatus = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM applications GROUP BY status ORDER BY count DESC
  `);

  const recent = await pool.query(`
    SELECT a.id, a.title, a.status, a.program_type, a.company_name, a.created_at,
           u.full_name as user_name
    FROM applications a LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 10
  `);

  res.json({
    stats: {
      total_applications: parseInt(stats.rows[0].total),
      pending: parseInt(stats.rows[0].pending),
      approved: parseInt(stats.rows[0].approved),
      rejected: parseInt(stats.rows[0].rejected),
      under_review: parseInt(stats.rows[0].under_review),
      total_approved_budget: parseFloat(stats.rows[0].total_approved_budget),
      total_disbursed_estimate: parseFloat(stats.rows[0].total_disbursed_estimate),
    },
    by_program: byProgram.rows,
    by_status: byStatus.rows,
    recent_applications: recent.rows,
  });
}

export async function getUserStats(req: AuthRequest, res: Response) {
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'draft') as drafts,
      COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
      COUNT(*) FILTER (WHERE status IN ('received','director_review','dept_assigned','preliminary_review','action_taken','council_evaluation','summarized')) as under_review,
      COUNT(*) FILTER (WHERE status = 'dept_approved') as awaiting_final,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'returned' OR status = 'supplementary_requested') as returned,
      COALESCE(SUM(budget_requested) FILTER (WHERE status = 'approved'), 0) as total_approved
    FROM applications WHERE user_id = $1
  `, [req.userId]);

  const apps = await pool.query(`
    SELECT a.id, a.title, a.program_type, a.status, a.budget_requested,
           a.created_at, a.submitted_at, a.scenario,
           u.full_name as officer_name,
           dh.full_name as dept_head_name,
           c.name as council_name
    FROM applications a
    LEFT JOIN users u ON a.officer_id = u.id
    LEFT JOIN users dh ON a.dept_head_id = dh.id
    LEFT JOIN councils c ON c.application_id = a.id
    WHERE a.user_id = $1
    ORDER BY a.created_at DESC
  `, [req.userId]);

  res.json({
    stats: {
      total: parseInt(stats.rows[0].total),
      drafts: parseInt(stats.rows[0].drafts),
      submitted: parseInt(stats.rows[0].submitted),
      under_review: parseInt(stats.rows[0].under_review),
      awaiting_final: parseInt(stats.rows[0].awaiting_final),
      approved: parseInt(stats.rows[0].approved),
      rejected: parseInt(stats.rows[0].rejected),
      returned: parseInt(stats.rows[0].returned),
      total_approved: parseFloat(stats.rows[0].total_approved),
    },
    applications: apps.rows,
  });
}
