import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'failed_login'
  | 'create_application'
  | 'update_application'
  | 'delete_application'
  | 'submit_application'
  | 'create_review'
  | 'workflow_transition'
  | 'create_assignment'
  | 'delete_assignment'
  | 'profile_update';

interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
}

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

export function logAudit(
  action: AuditAction,
  details?: string
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: authReq.userId,
      userRole: authReq.userRole,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details,
    };

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('[AUDIT]', JSON.stringify(entry));
      } else if (action === 'failed_login' || res.statusCode === 401 || res.statusCode === 403) {
        console.log('[AUDIT-FAIL]', JSON.stringify(entry));
      }
      return originalJson(body);
    };

    next();
  };
}
