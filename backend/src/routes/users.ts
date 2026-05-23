import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['admin', 'moderator', 'enterprise', 'expert', 'officer', 'dept_head', 'director', 'clerk'];

export async function listUsers(req: AuthRequest, res: Response) {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT u.id, u.email, u.full_name, u.role, u.company, u.phone,
           u.is_active, u.deleted_at, u.created_at, u.updated_at,
           u.email_verified_at,
           COUNT(*) OVER() as _total
    FROM users u
    WHERE u.deleted_at IS NULL
  `;
  const params: (string | number)[] = [];
  let idx = 1;

  if (role && VALID_ROLES.includes(role as string)) {
    query += ` AND u.role = $${idx++}`;
    params.push(role as string);
  }

  if (status === 'active') {
    query += ` AND u.is_active = true`;
  } else if (status === 'inactive') {
    query += ` AND u.is_active = false`;
  }

  if (search) {
    query += ` AND (u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  query += ` ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);
  const total = result.rows.length > 0 ? parseInt(result.rows[0]._total) : 0;

  res.json({
    data: result.rows.map(r => { const { _total, ...rest } = r; return rest; }),
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}

export async function getUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT id, email, full_name, role, company, phone, is_active, deleted_at,
            created_at, updated_at, email_verified_at
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }
  res.json(result.rows[0]);
}

export async function changeRole(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ' });
  }

  // Cannot change own role
  if (id === req.userId) {
    return res.status(400).json({ error: 'Không thể tự thay đổi vai trò của mình' });
  }

  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, email, full_name, role`,
    [role, id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }
  res.json(result.rows[0]);
}

export async function toggleStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { is_active } = req.body;

  if (id === req.userId) {
    return res.status(400).json({ error: 'Không thể tự vô hiệu hóa tài khoản của mình' });
  }

  const result = await pool.query(
    `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, email, full_name, is_active`,
    [is_active === true || is_active === 'true', id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }
  res.json(result.rows[0]);
}

export async function softDelete(req: AuthRequest, res: Response) {
  const { id } = req.params;

  if (id === req.userId) {
    return res.status(400).json({ error: 'Không thể tự xóa tài khoản của mình' });
  }

  const existing = await pool.query(
    `SELECT id, email FROM users WHERE id = $1 AND deleted_at IS NULL`, [id]
  );
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }

  // Soft delete: mark deleted_at, anonymize email, deactivate
  const deletedEmail = `deleted_${id}@deleted.local`;
  await pool.query(
    `UPDATE users SET
       deleted_at = NOW(), is_active = false,
       email = $1, full_name = 'Tài khoản đã xóa',
       phone = NULL, company = NULL
     WHERE id = $2`,
    [deletedEmail, id]
  );

  res.json({ message: 'Đã xóa tài khoản' });
}

export const userRoutes = { listUsers, getUser, changeRole, toggleStatus, softDelete };
