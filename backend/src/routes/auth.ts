import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'natif-oms-secret-key-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export async function register(req: Request, res: Response) {
  const { email, password, full_name, phone, company } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, mật khẩu và họ tên là bắt buộc' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    return res.status(409).json({ error: 'Email đã được đăng ký' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, phone, company, role)
     VALUES ($1,$2,$3,$4,$5,'user') RETURNING id, email, full_name, role, created_at`,
    [email, password_hash, full_name, phone || null, company || null]
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!result.rows.length) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, phone: user.phone, company: user.company },
  });
}

export async function getProfile(req: any, res: Response) {
  const result = await pool.query(
    'SELECT id, email, full_name, role, phone, company, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  res.json(result.rows[0]);
}

export async function updateProfile(req: any, res: Response) {
  const { full_name, phone, company } = req.body;
  const result = await pool.query(
    `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), company = COALESCE($3, company), updated_at = NOW()
     WHERE id = $4 RETURNING id, email, full_name, role, phone, company, created_at`,
    [full_name, phone, company, req.userId]
  );
  res.json(result.rows[0]);
}
