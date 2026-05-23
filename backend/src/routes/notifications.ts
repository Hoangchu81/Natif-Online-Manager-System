import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export async function listNotifications(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, is_read } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = `SELECT * FROM notifications WHERE user_id = $1`;
  const params: (string | number)[] = [req.userId!];
  let idx = 2;

  if (is_read === 'true') {
    query += ` AND is_read = true`;
  } else if (is_read === 'false') {
    query += ` AND is_read = false`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 ${is_read === 'true' ? 'AND is_read = true' : is_read === 'false' ? 'AND is_read = false' : ''}`,
    [req.userId!]
  );
  const total = parseInt(countResult.rows[0].count);

  res.json({
    data: result.rows,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}

export async function markRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, req.userId]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy thông báo' });
  }
  res.json({ message: 'Đã đánh dấu đã đọc' });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [req.userId]
  );
  res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
}

export async function unreadCount(req: AuthRequest, res: Response) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
    [req.userId]
  );
  res.json({ count: parseInt(result.rows[0].count) });
}

export const notificationRoutes = { listNotifications, markRead, markAllRead, unreadCount };
