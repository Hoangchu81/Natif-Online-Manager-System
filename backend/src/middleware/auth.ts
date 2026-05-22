import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  file?: Express.Multer.File;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Không có token xác thực' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Yêu cầu quyền quản trị' });
  }
  next();
}

export function requireExpert(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'expert') {
    return res.status(403).json({ error: 'Yêu cầu quyền chuyên gia' });
  }
  next();
}
