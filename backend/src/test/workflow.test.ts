import { describe, it, expect } from 'vitest';
import { workflowTransitionSchema } from '../validators/index.js';

describe('Workflow Validators', () => {
  describe('workflowTransitionSchema', () => {
    it('accepts valid transition data', () => {
      const valid = {
        application_id: '550e8400-e29b-41d4-a716-446655440000',
        to_status: 'received',
        notes: 'Tiep nhan ho so',
      };
      expect(() => workflowTransitionSchema.parse(valid)).not.toThrow();
    });

    it('accepts transition without notes', () => {
      const valid = {
        application_id: '550e8400-e29b-41d4-a716-446655440000',
        to_status: 'approved',
      };
      expect(() => workflowTransitionSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid UUID for application_id', () => {
      const invalid = {
        application_id: 'not-a-uuid',
        to_status: 'received',
      };
      expect(() => workflowTransitionSchema.parse(invalid)).toThrow();
    });

    it('rejects missing application_id', () => {
      const invalid = { to_status: 'received' };
      expect(() => workflowTransitionSchema.parse(invalid)).toThrow();
    });

    it('rejects missing to_status', () => {
      const invalid = {
        application_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => workflowTransitionSchema.parse(invalid)).toThrow();
    });
  });
});
