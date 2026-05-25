import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import { emailService } from '../services/email.js';
import { CANONICAL_TO_LEGACY, SELF_REGISTER_ROLES } from '../types/roles.js';
import type { CanonicalRole } from '../types/roles.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[AUTH-ROUTES] JWT_SECRET not set — using fallback!');
    }
    return 'natif-oms-secret-key-change-in-production';
  }
  return secret;
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://oms.natif.vn';

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars[crypto.randomInt(chars.length)];
  }
  return pw;
}

// ============================================================
// REGISTER — no password, info only → pending_verification
// ============================================================
export async function register(req: Request, res: Response) {
  const { email, full_name, phone, company, account_type, canonical_role, organization_name, tax_code } = req.body;

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email và họ tên là bắt buộc' });
  }

  const existing = await pool.query('SELECT id, account_status FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    const st = existing.rows[0].account_status;
    if (st === 'active') return res.status(409).json({ error: 'Email đã được đăng ký và kích hoạt' });
    if (st === 'pending_verification') return res.status(409).json({ error: 'Email đã đăng ký, vui lòng kiểm tra hộp thư để kích hoạt tài khoản' });
  }

  const targetRole = (canonical_role || (account_type === 'expert' ? 'independent_expert' : 'external_partner')) as CanonicalRole;
  if (!SELF_REGISTER_ROLES.includes(targetRole)) {
    return res.status(403).json({ error: 'Vai trò này chỉ được tạo bởi quản trị hệ thống' });
  }

  const legacyRole = CANONICAL_TO_LEGACY[targetRole];
  const resolvedAccountType = targetRole === 'independent_expert' ? 'expert' : 'external';
  const accountStatus = 'pending_verification';

  // Generate activation token (URL-safe)
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationTokenHash = crypto.createHash('sha256').update(activationToken).digest('hex');
  const activationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  // Placeholder password hash (user cannot login until activated)
  const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

  const result = await pool.query(
    `INSERT INTO users (
       email, password_hash, full_name, phone, company, role, legacy_role,
       canonical_role, account_type, account_status, organization_name, tax_code,
       verification_code, verification_expires_at
     )
     VALUES ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id, email, full_name, role, canonical_role, account_type, account_status, created_at`,
    [
      email, placeholderHash, full_name, phone || null, company || organization_name || null,
      legacyRole, targetRole, resolvedAccountType, accountStatus, organization_name || company || null,
      tax_code || null, activationTokenHash, activationExpiresAt,
    ]
  );

  const user = result.rows[0];

  // Send activation email
  const activationUrl = `${FRONTEND_URL}/auth/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
  const html = `<p>Kính gửi <strong>${full_name}</strong>,</p>
<p>Tài khoản ${targetRole === 'independent_expert' ? 'chuyên gia' : 'doanh nghiệp/đối tác'} của bạn đã được tạo trên hệ thống NATIF OMS.</p>
<p>Vui lòng nhấn vào liên kết bên dưới để kích hoạt tài khoản và nhận mật khẩu đăng nhập:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="${activationUrl}" style="background:#1f3892;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
    Kích hoạt tài khoản
  </a>
</p>
<p style="font-size:12px;color:#666;">Liên kết có hiệu lực trong 48 giờ. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>`;

  emailService.send(email, '[NATIF] Kích hoạt tài khoản', html)
    .catch(err => console.error('[AUTH] Failed to send activation email:', err));

  res.status(201).json({
    user,
    message: 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản và nhận mật khẩu.',
  });
}

// ============================================================
// ACTIVATE ACCOUNT — click email link → generate password → send via email
// ============================================================
export async function activateAccount(req: Request, res: Response) {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({ error: 'Thiếu token hoặc email' });
  }

  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

  const user = await pool.query(
    `SELECT id, full_name, email, account_status, verification_code, verification_expires_at
     FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  if (!user.rows.length) {
    return res.status(400).json({ error: 'Không tìm thấy tài khoản' });
  }

  const u = user.rows[0];

  if (u.account_status === 'active') {
    return res.status(400).json({ error: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập.', already_active: true });
  }

  // verification_code stores the activation token hash
  if (!u.verification_code || u.verification_code !== tokenHash) {
    return res.status(400).json({ error: 'Token kích hoạt không hợp lệ' });
  }

  if (u.verification_expires_at && new Date(u.verification_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Token kích hoạt đã hết hạn. Vui lòng đăng ký lại.' });
  }

  // Generate default password
  const defaultPassword = generatePassword(10);
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  await pool.query(
    `UPDATE users SET
       password_hash = $1,
       account_status = 'active',
       email_verified_at = NOW(),
       verification_code = NULL,
       verification_expires_at = NULL,
       is_verified = true,
       verified_at = NOW(),
       updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, u.id]
  );

  // Send password via email
  const loginUrl = `${FRONTEND_URL}/login`;
  const pwHtml = `<p>Kính gửi <strong>${u.full_name}</strong>,</p>
<p>Tài khoản của bạn đã được kích hoạt thành công trên hệ thống NATIF OMS.</p>
<p>Thông tin đăng nhập:</p>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px 16px;background:#f3f4f6;font-weight:bold;">Email:</td><td style="padding:8px 16px;">${u.email}</td></tr>
  <tr><td style="padding:8px 16px;background:#f3f4f6;font-weight:bold;">Mật khẩu:</td><td style="padding:8px 16px;font-family:monospace;font-size:16px;color:#1f3892;">${defaultPassword}</td></tr>
</table>
<p>⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>
<p><a href="${loginUrl}" style="background:#1f3892;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;">Đăng nhập ngay</a></p>`;

  emailService.send(u.email, '[NATIF] Tài khoản đã kích hoạt — Thông tin đăng nhập', pwHtml)
    .catch(err => console.error('[AUTH] Failed to send password email:', err));

  res.json({
    message: 'Tài khoản đã được kích hoạt thành công! Mật khẩu đăng nhập đã được gửi qua email.',
    activated: true,
  });
}

// ============================================================
// RESEND ACTIVATION — for pending_verification accounts
// ============================================================
export async function resendActivation(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

  const user = await pool.query(
    'SELECT id, full_name, email, account_status, canonical_role FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  const genericMsg = 'Nếu email tồn tại và chưa kích hoạt, liên kết kích hoạt đã được gửi lại.';
  if (!user.rows.length || user.rows[0].account_status !== 'pending_verification') {
    return res.json({ message: genericMsg });
  }

  const u = user.rows[0];
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationTokenHash = crypto.createHash('sha256').update(activationToken).digest('hex');
  const activationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await pool.query(
    'UPDATE users SET verification_code = $1, verification_expires_at = $2 WHERE id = $3',
    [activationTokenHash, activationExpiresAt, u.id]
  );

  const activationUrl = `${FRONTEND_URL}/auth/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
  const html = `<p>Kính gửi <strong>${u.full_name}</strong>,</p>
<p>Nhấn vào liên kết bên dưới để kích hoạt tài khoản NATIF OMS:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="${activationUrl}" style="background:#1f3892;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
    Kích hoạt tài khoản
  </a>
</p>
<p style="font-size:12px;color:#666;">Liên kết có hiệu lực trong 48 giờ.</p>`;

  emailService.send(u.email, '[NATIF] Kích hoạt tài khoản (gửi lại)', html)
    .catch(err => console.error('[AUTH] Failed to resend activation email:', err));

  res.json({ message: genericMsg });
}

// ============================================================
// LOGIN — unchanged logic
// ============================================================
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  if (!result.rows.length) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }

  const user = result.rows[0];

  // Block login for non-active accounts
  if (user.account_status === 'pending_verification') {
    return res.status(403).json({
      error: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.',
      needs_activation: true,
    });
  }
  if (user.account_status === 'suspended' || user.account_status === 'deactivated') {
    return res.status(403).json({ error: 'Tài khoản đã bị tạm khóa hoặc vô hiệu hóa. Liên hệ quản trị viên.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const canonicalRole = user.canonical_role || (user.role === 'expert' ? 'independent_expert' : user.role === 'enterprise' ? 'external_partner' : user.role === 'director' ? 'natif_executive' : user.role === 'dept_head' ? 'department_manager' : user.role === 'clerk' ? 'admin_desk' : user.role === 'officer' ? 'grants_orders_specialist' : 'chief_system_architect');
  const token = jwt.sign({ userId: user.id, role: user.role, canonicalRole }, getJwtSecret(), { expiresIn: 7 * 24 * 60 * 60 });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      canonical_role: canonicalRole,
      account_type: user.account_type,
      account_status: user.account_status,
      phone: user.phone,
      company: user.company,
      organization_name: user.organization_name,
    },
  });
}

// ============================================================
// PROFILE
// ============================================================
export async function getProfile(req: any, res: Response) {
  const result = await pool.query(
    'SELECT id, email, full_name, role, canonical_role, account_type, account_status, phone, company, organization_name, tax_code, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  res.json(result.rows[0]);
}

export async function updateProfile(req: any, res: Response) {
  const { full_name, phone, company } = req.body;
  const result = await pool.query(
    `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), company = COALESCE($3, company), organization_name = COALESCE($3, organization_name), updated_at = NOW()
     WHERE id = $4 RETURNING id, email, full_name, role, canonical_role, account_type, account_status, phone, company, organization_name, created_at`,
    [full_name, phone, company, req.userId]
  );
  res.json(result.rows[0]);
}

// ============================================================
// CHANGE PASSWORD
// ============================================================
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

// ============================================================
// FORGOT PASSWORD — email-based (unchanged)
// ============================================================
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

  const user = await pool.query(
    'SELECT id, full_name, email, reset_attempts, last_reset_attempt_at FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  const genericMsg = 'Nếu email tồn tại, mã xác nhận đã được gửi';
  if (!user.rows.length) {
    return res.json({ message: genericMsg });
  }

  const u = user.rows[0];

  // Rate limit: max 5 attempts per hour
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

// ============================================================
// RESET PASSWORD — email code based (unchanged)
// ============================================================
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

  if ((u.reset_attempts || 0) >= 10) {
    await pool.query('UPDATE users SET reset_code = NULL, reset_expires_at = NULL WHERE id = $1', [u.id]);
    return res.status(400).json({ error: 'Mã xác nhận đã bị vô hiệu do quá nhiều lần thử sai' });
  }

  if (!u.reset_code) {
    return res.status(400).json({ error: 'Mã xác nhận không hợp lệ' });
  }

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

// ============================================================
// VERIFY EMAIL (legacy — kept for backward compat)
// ============================================================
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

// ============================================================
// RESEND VERIFICATION (legacy)
// ============================================================
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
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
