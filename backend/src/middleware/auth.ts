import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CANONICAL_ROLES, CANONICAL_TO_LEGACY, LEGACY_TO_CANONICAL, ADMIN_ROLES, INTERNAL_ROLES, EXPERT_ROLES } from '../types/roles.js';
import type { CanonicalRole, LegacyRole } from '../types/roles.js';

let _jwtSecret: string | null = null;
function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[AUTH] JWT_SECRET not set — using fallback. Set JWT_SECRET in .env!');
    }
    _jwtSecret = 'natif-oms-secret-key-change-in-production';
  } else {
    _jwtSecret = secret;
  }
  return _jwtSecret;
}

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;           // legacy role for backward compat
  canonicalRole?: CanonicalRole;
  file?: Express.Multer.File;
}

interface JwtPayload {
  userId: string;
  role: string;
  canonicalRole?: CanonicalRole;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Không có token xác thực' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as JwtPayload;
    req.userId = payload.userId;

    // Support both legacy and canonical role in JWT
    if (payload.canonicalRole && CANONICAL_ROLES.includes(payload.canonicalRole)) {
      req.canonicalRole = payload.canonicalRole;
      req.userRole = CANONICAL_TO_LEGACY[payload.canonicalRole];
    } else {
      // Legacy JWT — derive canonical from legacy
      req.userRole = payload.role;
      const legacyRole = payload.role as LegacyRole;
      req.canonicalRole = LEGACY_TO_CANONICAL[legacyRole] || 'external_partner';
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

/**
 * Require one of the specified canonical roles.
 * Also accepts legacy role strings for backward compat.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const canonical = req.canonicalRole;
    const legacy = req.userRole;

    // Check canonical role match
    if (canonical && roles.includes(canonical)) return next();
    // Check legacy role match
    if (legacy && roles.includes(legacy)) return next();

    return res.status(403).json({ error: 'Không có quyền truy cập' });
  };
}

/**
 * Require admin-level canonical roles.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.canonicalRole && ADMIN_ROLES.includes(req.canonicalRole)) {
    return next();
  }
  // Legacy fallback
  if (req.userRole === 'admin') return next();
  return res.status(403).json({ error: 'Yêu cầu quyền quản trị' });
}

/**
 * Require any internal staff role.
 */
export function requireInternal(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.canonicalRole && INTERNAL_ROLES.includes(req.canonicalRole)) {
    return next();
  }
  return res.status(403).json({ error: 'Yêu cầu quyền nhân viên nội bộ' });
}

/**
 * Require expert-class roles.
 */
export function requireExpert(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.canonicalRole && EXPERT_ROLES.includes(req.canonicalRole)) {
    return next();
  }
  if (req.userRole === 'expert') return next();
  return res.status(403).json({ error: 'Yêu cầu quyền chuyên gia' });
}

/**
 * Require NATIF executive (director-level).
 */
export function requireExecutive(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.canonicalRole === 'natif_executive') return next();
  if (req.userRole === 'director') return next();
  return res.status(403).json({ error: 'Yêu cầu quyền lãnh đạo NATIF' });
}
