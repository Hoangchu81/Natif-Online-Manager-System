import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type Schema = z.ZodSchema<any>;

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: errors });
    }
    req.body = result.data;
    next();
  };
}
