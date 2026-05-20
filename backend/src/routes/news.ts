import type { Request, Response } from 'express';
import pool from '../config/database.js';

export async function listNews(req: Request, res: Response) {
  const { category, limit = 10 } = req.query;
  let query = 'SELECT * FROM news WHERE 1=1';
  const params: (string | number)[] = [];
  let idx = 1;

  if (category) {
    query += ` AND category = $${idx++}`;
    params.push(category as string);
  }

  query += ` ORDER BY published_at DESC LIMIT $${idx}`;
  params.push(Number(limit));

  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function getNews(req: Request, res: Response) {
  const { slug } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE slug = $1', [slug]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result.rows[0]);
}

export async function listAnnouncements(req: Request, res: Response) {
  const result = await pool.query(
    "SELECT * FROM news WHERE category = 'announcement' ORDER BY published_at DESC LIMIT 10"
  );
  res.json({ data: result.rows });
}
