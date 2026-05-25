import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { CANONICAL_ROLES, ADMIN_ROLES, ROLE_LABELS } from '../types/roles.js';
import type { CanonicalRole } from '../types/roles.js';

export async function listUsers(req: AuthRequest, res: Response) {
  const { role, canonical_role, status, account_status, account_type, search, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT u.id, u.email, u.full_name, u.role, u.canonical_role, u.account_type,
           u.account_status, u.company, u.organization_name, u.phone, u.department,
           u.position_title, u.is_active, u.deleted_at, u.created_at, u.updated_at,
           u.email_verified_at, u.last_login_at, u.invited_at,
           COUNT(*) OVER() as _total
    FROM users u
    WHERE u.deleted_at IS NULL
  `;
  const params: (string | number)[] = [];
  let idx = 1;

  if (canonical_role && CANONICAL_ROLES.includes(canonical_role as CanonicalRole)) {
    query += ` AND u.canonical_role = $${idx++}`;
    params.push(canonical_role as string);
  } else if (role) {
    query += ` AND u.role = $${idx++}`;
    params.push(role as string);
  }

  if (account_status) {
    query += ` AND u.account_status = $${idx++}`;
    params.push(account_status as string);
  } else if (status === 'active') {
    query += ` AND u.is_active = true`;
  } else if (status === 'inactive') {
    query += ` AND u.is_active = false`;
  }

  if (account_type) {
    query += ` AND u.account_type = $${idx++}`;
    params.push(account_type as string);
  }

  if (search) {
    query += ` AND (u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.organization_name ILIKE $${idx})`;
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
    `SELECT id, email, full_name, role, canonical_role, account_type, account_status,
            company, organization_name, organization_type, tax_code, department,
            position_title, phone, is_active, deleted_at, created_at, updated_at,
            email_verified_at, last_login_at, invited_at, invitation_accepted_at
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
  const { canonical_role, role } = req.body;

  // Prefer canonical_role, fallback to legacy role
  const targetRole = canonical_role || role;
  if (!targetRole || !CANONICAL_ROLES.includes(targetRole as CanonicalRole)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ', valid_roles: CANONICAL_ROLES });
  }

  if (id === req.userId) {
    return res.status(400).json({ error: 'Không thể tự thay đổi vai trò của mình' });
  }

  const result = await pool.query(
    `UPDATE users SET canonical_role = $1, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING id, email, full_name, canonical_role, account_status`,
    [targetRole, id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }

  // Log activity
  await pool.query(
    `INSERT INTO account_activity_logs (user_id, actor_id, action, new_value)
     VALUES ($1, $2, 'role_changed', $3)`,
    [id, req.userId, JSON.stringify({ canonical_role: targetRole })]
  );

  res.json(result.rows[0]);
}

export async function toggleStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { is_active, account_status } = req.body;

  if (id === req.userId) {
    return res.status(400).json({ error: 'Không thể tự vô hiệu hóa tài khoản của mình' });
  }

  let newStatus: string;
  let newActive: boolean;

  if (account_status) {
    newStatus = account_status;
    newActive = account_status === 'active';
  } else {
    newActive = is_active === true || is_active === 'true';
    newStatus = newActive ? 'active' : 'deactivated';
  }

  const result = await pool.query(
    `UPDATE users SET is_active = $1, account_status = $2, updated_at = NOW()
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING id, email, full_name, is_active, account_status`,
    [newActive, newStatus, id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }

  // Log activity
  await pool.query(
    `INSERT INTO account_activity_logs (user_id, actor_id, action, new_value)
     VALUES ($1, $2, 'status_changed', $3)`,
    [id, req.userId, JSON.stringify({ account_status: newStatus, is_active: newActive })]
  );

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

  const deletedEmail = `deleted_${id}@deleted.local`;
  await pool.query(
    `UPDATE users SET
       deleted_at = NOW(), is_active = false, account_status = 'deleted',
       email = $1, full_name = 'Tài khoản đã xóa',
       phone = NULL, company = NULL, organization_name = NULL
     WHERE id = $2`,
    [deletedEmail, id]
  );

  // Log activity
  await pool.query(
    `INSERT INTO account_activity_logs (user_id, actor_id, action, old_value)
     VALUES ($1, $2, 'account_deleted', $3)`,
    [id, req.userId, JSON.stringify({ email: existing.rows[0].email })]
  );

  res.json({ message: 'Đã xóa tài khoản' });
}

export async function getRoleLabels(_req: AuthRequest, res: Response) {
  res.json({ roles: ROLE_LABELS, canonical_roles: CANONICAL_ROLES });
}

export const userRoutes = { listUsers, getUser, changeRole, toggleStatus, softDelete, getRoleLabels };
