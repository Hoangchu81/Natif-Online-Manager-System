import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import { emailService } from '../services/email.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return 'natif-oms-secret-key-change-in-production';
  }
  return secret;
}
const JWT_SECRET = getJwtSecret();
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
     VALUES ($1,$2,$3,$4,$5,'enterprise') RETURNING id, email, full_name, role, created_at`,
    [email, password_hash, full_name, phone || null, company || null]
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });

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

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });

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

export async function changePassword(req: any, res: Response) {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
  if (!user.rows.length) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

  const valid = await bcrypt.compare(current_password, user.rows[0].password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }

  const hash = await bcrypt.hash(new_password, 12);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.userId]);

  res.json({ message: 'Đổi mật khẩu thành công' });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

  const user = await pool.query(
    'SELECT id, full_name, email, reset_attempts, last_reset_attempt_at FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  // Always return same response regardless of email existence
  const genericMsg = 'Nếu email tồn tại, mã xác nhận đã được gửi';
  if (!user.rows.length) {
    return res.json({ message: genericMsg });
  }

  const u = user.rows[0];

  // Rate limit: max 5 attempts per hour — return same generic message (no 429 leak)
  const attempts = u.reset_attempts || 0;
  const lastAttempt = u.last_reset_attempt_at ? new Date(u.last_reset_attempt_at) : null;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  if (lastAttempt && lastAttempt > oneHourAgo && attempts >= 5) {
    return res.json({ message: genericMsg });
  }

  const newAttempts = (lastAttempt && lastAttempt > oneHourAgo) ? attempts + 1 : 1;

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `UPDATE users SET reset_code = $1, reset_expires_at = $2, reset_attempts = $3, last_reset_attempt_at = NOW()
     WHERE id = $4`,
    [code, expiresAt, newAttempts, u.id]
  );

  const html = `<p>Kính gửi ${u.full_name},</p>
<p>Mã xác nhận đặt lại mật khẩu của bạn là:</p>
<h2 style="text-align:center; color:#1f3892; letter-spacing:4px;">${code}</h2>
<p>Mã có hiệu lực trong 15 phút.</p>
<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>`;

  emailService.send(u.email, '[NATIF] Mã đặt lại mật khẩu', html)
    .catch(err => console.error('[AUTH] Failed to send reset email:', err));

  res.json({ message: genericMsg });
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, new_password } = req.body;

  if (!email || !code || !new_password) {
    return res.status(400).json({ error: 'Email, mã xác nhận và mật khẩu mới là bắt buộc' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  const user = await pool.query(
    'SELECT id, reset_code, reset_expires_at, reset_attempts FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
  if (!user.rows.length) {
    return res.status(400).json({ error: 'Mã xác nhận không hợp lệ' });
  }

  const u = user.rows[0];

  // Brute-force protection: invalidate code after 5 failed verify attempts
  if ((u.reset_attempts || 0) >= 10) {
    await pool.query('UPDATE users SET reset_code = NULL, reset_expires_at = NULL WHERE id = $1', [u.id]);
    return res.status(400).json({ error: 'Mã xác nhận đã bị vô hiệu do quá nhiều lần thử sai' });
  }

  if (!u.reset_code) {
    return res.status(400).json({ error: 'Mã xác nhận không hợp lệ' });
  }

  // Timing-safe comparison
  const codeBuffer = Buffer.from(String(code).padEnd(6, '0'));
  const storedBuffer = Buffer.from(String(u.reset_code).padEnd(6, '0'));
  const codeMatch = codeBuffer.length === storedBuffer.length && crypto.timingSafeEqual(codeBuffer, storedBuffer);

  if (!codeMatch) {
    await pool.query('UPDATE users SET reset_attempts = COALESCE(reset_attempts, 0) + 1 WHERE id = $1', [u.id]);
    return res.status(400).json({ error: 'Mã xác nhận không đúng' });
  }

  if (new Date(u.reset_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Mã xác nhận đã hết hạn' });
  }

  const hash = await bcrypt.hash(new_password, 12);
  await pool.query(
    `UPDATE users SET password_hash = $1, reset_code = NULL, reset_expires_at = NULL,
     reset_attempts = 0, updated_at = NOW() WHERE id = $2`,
    [hash, u.id]
  );

  res.json({ message: 'Đặt lại mật khẩu thành công' });
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, code } = req.query;

  if (!email || !code) {
    return res.status(400).json({ error: 'Thiếu email hoặc mã xác nhận' });
  }

  const user = await pool.query(
    'SELECT id, verification_code, verification_expires_at FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
  if (!user.rows.length) {
    return res.status(400).json({ error: 'Không tìm thấy tài khoản' });
  }

  const u = user.rows[0];
  if (!u.verification_code || u.verification_code !== code) {
    return res.status(400).json({ error: 'Mã xác nhận không đúng' });
  }
  if (u.verification_expires_at && new Date(u.verification_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Mã xác nhận đã hết hạn' });
  }

  await pool.query(
    `UPDATE users SET email_verified_at = NOW(), verification_code = NULL, verification_expires_at = NULL WHERE id = $1`,
    [u.id]
  );

  res.json({ message: 'Xác minh email thành công' });
}

export async function resendVerification(req: any, res: Response) {
  const user = await pool.query(
    'SELECT id, email, full_name, email_verified_at FROM users WHERE id = $1',
    [req.userId]
  );
  if (!user.rows.length) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

  const u = user.rows[0];
  if (u.email_verified_at) {
    return res.status(400).json({ error: 'Email đã được xác minh' });
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await pool.query(
    'UPDATE users SET verification_code = $1, verification_expires_at = $2 WHERE id = $3',
    [code, expiresAt, u.id]
  );

  const html = `<p>Kính gửi ${u.full_name},</p>
<p>Mã xác minh email của bạn là:</p>
<h2 style="text-align:center; color:#1f3892; letter-spacing:4px;">${code}</h2>
<p>Mã có hiệu lực trong 24 giờ.</p>`;

  emailService.send(u.email, '[NATIF] Xác minh email', html)
    .catch(err => console.error('[AUTH] Failed to send verification email:', err));

  res.json({ message: 'Mã xác minh đã được gửi' });
}
