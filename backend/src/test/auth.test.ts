import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, createApplicationSchema } from '../validators/index.js';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const valid = {
        email: 'test@example.com',
        password: 'SecurePass123',
        full_name: 'Nguyen Van A',
        phone: '0912345678',
        company: 'Test Corp',
      };
      expect(() => registerSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid email', () => {
      const invalid = { email: 'not-an-email', password: 'SecurePass123', full_name: 'Test' };
      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('rejects short password', () => {
      const invalid = { email: 'test@example.com', password: '123', full_name: 'Test' };
      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('rejects short full_name', () => {
      const invalid = { email: 'test@example.com', password: 'SecurePass123', full_name: 'A' };
      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('accepts missing optional fields', () => {
      const valid = { email: 'test@example.com', password: 'SecurePass123', full_name: 'Test User' };
      expect(() => registerSchema.parse(valid)).not.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const valid = { email: 'test@example.com', password: 'anypassword' };
      expect(() => loginSchema.parse(valid)).not.toThrow();
    });

    it('rejects missing email', () => {
      const invalid = { password: 'anypassword' };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it('rejects missing password', () => {
      const invalid = { email: 'test@example.com' };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });
  });
});

describe('Application Validators', () => {
  describe('createApplicationSchema', () => {
    it('accepts valid application data', () => {
      const valid = {
        program_type: 'interest_subsidy',
        company_name: 'Cong Ty ABC',
        tax_code: '0123456789',
        contact_name: 'Nguyen Van A',
        contact_email: 'contact@abc.com',
        title: 'Du an doi moi cong nghe',
        budget_requested: 500000000,
      };
      expect(() => createApplicationSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid program_type', () => {
      const invalid = {
        program_type: 'invalid_type',
        company_name: 'ABC',
        tax_code: '0123456789',
        contact_name: 'Test',
        contact_email: 'test@test.com',
        title: 'Test Title',
        budget_requested: 100000,
      };
      expect(() => createApplicationSchema.parse(invalid)).toThrow();
    });

    it('rejects negative budget', () => {
      const invalid = {
        program_type: 'voucher',
        company_name: 'ABC',
        tax_code: '0123456789',
        contact_name: 'Test',
        contact_email: 'test@test.com',
        title: 'Test Title',
        budget_requested: -1000,
      };
      expect(() => createApplicationSchema.parse(invalid)).toThrow();
    });

    it('accepts valid program types', () => {
      const types = ['interest_subsidy', 'sponsorship', 'voucher', 'ecosystem'];
      types.forEach((type) => {
        const data = {
          program_type: type,
          company_name: 'ABC',
          tax_code: '0123456789',
          contact_name: 'Test',
          contact_email: 'test@test.com',
          title: 'Test Title',
          budget_requested: 100000,
        };
        expect(() => createApplicationSchema.parse(data)).not.toThrow();
      });
    });
  });
});
