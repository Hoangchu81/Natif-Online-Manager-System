import type { Request, Response, NextFunction } from 'express';

/**
 * Standard API response envelope.
 * All successful responses: { data, pagination? }
 * All error responses: { error, code?, details? }
 */

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  pagination?: ApiPagination;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Send a successful response with standard envelope.
 */
export function sendSuccess<T>(res: Response, data: T, pagination?: ApiPagination, status = 200): void {
  const body: ApiSuccessResponse<T> = { data };
  if (pagination) body.pagination = pagination;
  res.status(status).json(body);
}

/**
 * Send an error response with standard envelope.
 */
export function sendError(res: Response, error: string, status = 400, code?: string, details?: unknown): void {
  const body: ApiErrorResponse = { error };
  if (code) body.code = code;
  if (details) body.details = details;
  res.status(status).json(body);
}

/**
 * Build pagination object from query params and total count.
 */
export function buildPagination(query: { page?: string | number; limit?: string | number }, total: number): { pagination: ApiPagination; offset: number; limitNum: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const offset = (page - 1) * limitNum;
  return {
    pagination: { total, page, limit: limitNum, pages: Math.ceil(total / limitNum) },
    offset,
    limitNum,
  };
}

/**
 * Global error handler middleware.
 * Must be registered AFTER all routes.
 */
export function globalErrorHandler(err: Error & { status?: number; code?: string }, _req: Request, res: Response, _next: NextFunction): void {
  // Multer file size / type errors
  if (err.message && (err.message.includes('LIMIT_FILE_SIZE') || err.message.includes('Chỉ hỗ trợ'))) {
    sendError(res, err.message, 400, 'FILE_VALIDATION_ERROR');
    return;
  }

  // Zod / validation errors
  if (err.name === 'ZodError') {
    sendError(res, 'Dữ liệu không hợp lệ', 400, 'VALIDATION_ERROR', err);
    return;
  }

  // Known status errors
  if (err.status && err.status >= 400 && err.status < 500) {
    sendError(res, err.message || 'Bad request', err.status, err.code);
    return;
  }

  // Unexpected errors
  console.error('[ERROR]', err.message, err.stack);
  const isDev = process.env.NODE_ENV !== 'production';
  sendError(res, 'Lỗi server nội bộ', 500, 'INTERNAL_ERROR', isDev ? { detail: err.message } : undefined);
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'API endpoint not found', 404, 'NOT_FOUND');
}
