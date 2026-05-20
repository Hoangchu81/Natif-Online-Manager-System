import type { Request, Response } from 'express';
import pool from '../config/database.js';

export async function listPrograms(req: Request, res: Response) {
  const { active_only } = req.query;
  let query = 'SELECT * FROM programs';
  const params: string[] = [];
  if (active_only === 'true') {
    query += ' WHERE is_active = true';
  }
  query += ' ORDER BY created_at ASC';
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function getProgram(req: Request, res: Response) {
  const { slug } = req.params;
  const result = await pool.query('SELECT * FROM programs WHERE slug = $1', [slug]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy chương trình' });
  res.json(result.rows[0]);
}

export async function getProgramByType(req: Request, res: Response) {
  const { type } = req.params;
  const result = await pool.query('SELECT * FROM programs WHERE slug = $1 AND is_active = true', [type]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy chương trình' });
  res.json(result.rows[0]);
}
