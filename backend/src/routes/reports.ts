import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

interface PeriodParams {
  year?: string;
  quarter?: string;
  month?: string;
  from?: string;
  to?: string;
}

function parsePeriod(query: PeriodParams): { start: Date; end: Date; label: string } | null {
  const now = new Date();
  const year = query.year ? parseInt(query.year) : now.getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) return null;

  if (query.month) {
    const month = parseInt(query.month);
    if (isNaN(month) || month < 1 || month > 12) return null;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end, label: `Tháng ${month}/${year}` };
  }

  if (query.quarter) {
    const q = parseInt(query.quarter);
    if (isNaN(q) || q < 1 || q > 4) return null;
    const start = new Date(year, (q - 1) * 3, 1);
    const end = new Date(year, q * 3, 0, 23, 59, 59);
    return { start, end, label: `Q${q}/${year}` };
  }

  if (query.from && query.to) {
    const start = new Date(query.from);
    const end = new Date(query.to);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return { start, end, label: `${query.from} → ${query.to}` };
  }

  // Default: current year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);
  return { start, end, label: `Năm ${year}` };
}

export async function getIOOI(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
    month: req.query.month as string,
    from: req.query.from as string,
    to: req.query.to as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const { rows: inputRows } = await pool.query(`
    SELECT
      COALESCE(SUM(budget_requested) / 1000000000, 0) as total_budget_requested,
      COUNT(*) as applications_received,
      COUNT(DISTINCT submitted_at >= $1 AND submitted_at <= $2 OR NULL) as submitted_count
    FROM applications
    WHERE deleted_at IS NULL
  `, [period.start, period.end]);

  const { rows: expertRows } = await pool.query(`
    SELECT COUNT(DISTINCT expert_id) as experts_participated
    FROM expert_assignments ea
    JOIN applications a ON ea.application_id = a.id
    WHERE a.deleted_at IS NULL
      AND ea.created_at >= $1 AND ea.created_at <= $2
  `, [period.start, period.end]);

  const { rows: councilRows } = await pool.query(`
    SELECT COUNT(*) as council_meetings
    FROM council_meetings
    WHERE created_at >= $1 AND created_at <= $2
  `, [period.start, period.end]);

  const { rows: outputRows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'approved') as applications_approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejections,
      COUNT(*) as total_processed,
      COALESCE(AVG(
        CASE WHEN status IN ('approved', 'rejected') AND submitted_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (
          COALESCE(reviewed_at, updated_at) - submitted_at
        )) / 86400
        ELSE NULL END
      ), 0) as avg_processing_days
    FROM applications
    WHERE deleted_at IS NULL
      AND submitted_at >= $1 AND submitted_at <= $2
  `, [period.start, period.end]);

  const { rows: disbursementRows } = await pool.query(`
    SELECT COALESCE(SUM(amount) / 1000000000, 0) as total_disbursed, COUNT(*) as disbursement_count
    FROM disbursements
    WHERE disbursement_date >= $1 AND disbursement_date <= $2
  `, [period.start, period.end]);

  const { rows: outcomeRows } = await pool.query(`
    SELECT
      COUNT(DISTINCT company_name) FILTER (WHERE status = 'approved') as enterprises_supported,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_count
    FROM applications
    WHERE deleted_at IS NULL
      AND submitted_at >= $1 AND submitted_at <= $2
  `, [period.start, period.end]);

  const { rows: reportRows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'submitted') as reports_submitted,
      COUNT(*) as total_reports
    FROM project_reports
    WHERE created_at >= $1 AND created_at <= $2
  `, [period.start, period.end]);

  const totalProcessed = Number(outputRows[0]?.total_processed) || 0;
  const approved = Number(outputRows[0]?.applications_approved) || 0;
  const totalReports = Number(reportRows[0]?.total_reports) || 0;
  const submittedReports = Number(reportRows[0]?.reports_submitted) || 0;

  res.json({
    period: period.label,
    period_start: period.start.toISOString(),
    period_end: period.end.toISOString(),
    input: {
      total_budget_requested: Number(inputRows[0]?.total_budget_requested) || 0,
      applications_received: Number(inputRows[0]?.applications_received) || 0,
      experts_participated: Number(expertRows[0]?.experts_participated) || 0,
      council_meetings: Number(councilRows[0]?.council_meetings) || 0,
    },
    output: {
      applications_approved: approved,
      approval_rate: totalProcessed > 0 ? Math.round((approved / totalProcessed) * 1000) / 10 : 0,
      total_disbursed: Number(disbursementRows[0]?.total_disbursed) || 0,
      disbursement_count: Number(disbursementRows[0]?.disbursement_count) || 0,
      avg_processing_days: Math.round(Number(outputRows[0]?.avg_processing_days) * 10) / 10 || 0,
      rejections: Number(outputRows[0]?.rejections) || 0,
      total_processed: totalProcessed,
    },
    outcome: {
      enterprises_supported: Number(outcomeRows[0]?.enterprises_supported) || 0,
      projects_approved: Number(outcomeRows[0]?.approved_count) || 0,
      reports_submitted: submittedReports,
      reports_total: totalReports,
      reports_overdue_rate: totalReports > 0
        ? Math.round(((totalReports - submittedReports) / totalReports) * 1000) / 10
        : 0,
    },
    impact: {
      jobs_created_estimated: 0,
      revenue_increase_estimated: 0,
      new_products: 0,
      technology_transfers: 0,
    },
  });
}

export async function getApplicationReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
    month: req.query.month as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const result = await pool.query(`
    SELECT
      a.status,
      a.program_type,
      COUNT(*) as count,
      SUM(budget_requested) / 1000000000 as total_budget_bn
    FROM applications a
    WHERE a.deleted_at IS NULL
      AND a.submitted_at >= $1 AND a.submitted_at <= $2
    GROUP BY a.status, a.program_type
    ORDER BY a.status, a.program_type
  `, [period.start, period.end]);

  res.json({ data: result.rows, period: period.label });
}

export async function getDisbursementReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const result = await pool.query(`
    SELECT
      EXTRACT(YEAR FROM d.disbursement_date) as year,
      EXTRACT(MONTH FROM d.disbursement_date) as month,
      COUNT(*) as count,
      SUM(d.amount) as total_amount,
      AVG(d.amount) as avg_amount
    FROM disbursements d
    WHERE d.disbursement_date >= $1 AND d.disbursement_date <= $2
    GROUP BY EXTRACT(YEAR FROM d.disbursement_date), EXTRACT(MONTH FROM d.disbursement_date)
    ORDER BY year, month
  `, [period.start, period.end]);

  res.json({ data: result.rows, period: period.label });
}

export async function getExpertReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const result = await pool.query(`
    SELECT
      u.full_name as expert_name,
      COUNT(DISTINCT ea.application_id) as assignments_count,
      COUNT(er.id) as reviews_completed,
      AVG(er.overall_score) as avg_score
    FROM expert_assignments ea
    JOIN users u ON ea.expert_id = u.id
    LEFT JOIN expert_reviews er ON er.expert_id = ea.expert_id
    WHERE ea.created_at >= $1 AND ea.created_at <= $2
    GROUP BY u.id, u.full_name
    ORDER BY reviews_completed DESC
    LIMIT 50
  `, [period.start, period.end]);

  res.json({ data: result.rows, period: period.label });
}

export async function getCouncilReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const result = await pool.query(`
    SELECT
      a.title as application_title,
      c.evaluation_deadline,
      cm.role as recommendation,
      COUNT(cm2.id) as member_count,
      a.status
    FROM councils c
    JOIN applications a ON c.application_id = a.id
    LEFT JOIN council_members cm ON cm.council_id = c.id AND cm.role IN ('chairman')
    LEFT JOIN council_members cm2 ON cm2.council_id = c.id
    WHERE c.created_at >= $1 AND c.created_at <= $2
    GROUP BY a.id, c.id, cm.role
    ORDER BY c.created_at DESC
  `, [period.start, period.end]);

  res.json({ data: result.rows, period: period.label });
}

export async function getTimelineReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });

  const result = await pool.query(`
    WITH stage_durations AS (
      SELECT
        aw.application_id,
        aw.to_status,
        EXTRACT(EPOCH FROM (
          LEAD(aw.created_at) OVER (PARTITION BY aw.application_id ORDER BY aw.created_at) - aw.created_at
        )) / 86400 as days_at_stage
      FROM application_workflow aw
      JOIN applications a ON aw.application_id = a.id
      WHERE aw.created_at >= $1 AND aw.created_at <= $2
        AND a.deleted_at IS NULL
    )
    SELECT
      to_status as status,
      AVG(days_at_stage) as avg_days_at_stage
    FROM stage_durations
    WHERE days_at_stage IS NOT NULL
    GROUP BY to_status
    ORDER BY avg_days_at_stage DESC
  `, [period.start, period.end]);

  res.json({ data: result.rows, period: period.label });
}

export async function exportReport(req: AuthRequest, res: Response) {
  const period = parsePeriod({
    year: req.query.year as string,
    quarter: req.query.quarter as string,
  });
  if (!period) return res.status(400).json({ error: 'Tham số thời gian không hợp lệ' });
  const format = req.query.format || 'json';

  if (format === 'json') {
    const iooi = await getIOOI(req, res);
    return;
  }

  res.status(400).json({ error: 'Export format not supported. Use json.' });
}

export const reportRoutes = { getIOOI, getApplicationReport, getDisbursementReport, getExpertReport, getCouncilReport, getTimelineReport, exportReport };
