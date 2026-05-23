import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import pool from '../config/database.js';

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

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

async function writeAuditToDb(
  applicationId: string | null,
  userId: string | undefined,
  action: string,
  details: Record<string, unknown>,
  ip: string,
  userAgent: string | undefined
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO application_audit_logs (application_id, user_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5::inet, $6)`,
      [applicationId, userId || null, action, JSON.stringify(details), ip === 'unknown' ? null : ip, userAgent || null]
    );
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log', err instanceof Error ? err.message : String(err));
  }
}

export function logAudit(
  action: AuditAction,
  opts?: { getApplicationId?: (req: Request) => string | null }
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const applicationId = opts?.getApplicationId?.(req) || (req.params.id ?? req.params.applicationId ?? null);

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        writeAuditToDb(applicationId, authReq.userId, action, { status: res.statusCode }, ip, userAgent);
      } else if (action === 'failed_login' || res.statusCode === 401 || res.statusCode === 403) {
        writeAuditToDb(applicationId, authReq.userId, `${action}.failed`, { status: res.statusCode }, ip, userAgent);
      }
      return originalJson(body);
    };

    next();
  };
}
