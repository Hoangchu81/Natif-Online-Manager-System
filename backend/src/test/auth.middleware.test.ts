import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Set test env before importing modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

const TEST_SECRET = process.env.JWT_SECRET;

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    mockNext = vi.fn();
  });

  it('rejects request without authorization header', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Không có token xác thực' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('rejects request with invalid token format', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    mockReq.headers.authorization = 'InvalidFormat token123';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('rejects expired token', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    const expiredToken = jwt.sign({ userId: '123', role: 'user' }, TEST_SECRET, { expiresIn: '-1h' });
    mockReq.headers.authorization = `Bearer ${expiredToken}`;
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('accepts valid token and extracts user info', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    const validToken = jwt.sign({ userId: 'user-123', role: 'admin' }, TEST_SECRET, { expiresIn: '1h' });
    mockReq.headers.authorization = `Bearer ${validToken}`;
    authenticate(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe('user-123');
    expect(mockReq.userRole).toBe('admin');
  });
});

describe('Role Authorization', () => {
  it('requireRole allows authorized roles', async () => {
    const { requireRole } = await import('../middleware/auth.js');
    const mockReq: any = { userRole: 'admin' };
    const mockRes: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const mockNext = vi.fn();
    const middleware = requireRole('admin', 'moderator');
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('requireRole denies unauthorized roles', async () => {
    const { requireRole } = await import('../middleware/auth.js');
    const mockReq: any = { userRole: 'user' };
    const mockRes: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const mockNext = vi.fn();
    const middleware = requireRole('admin', 'moderator');
    middleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Không có quyền truy cập' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
