import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;
      const validated = schema.parse(data);

      if (target === 'body') req.body = validated;
      else if (target === 'query') req.query = validated;
      else req.params = validated;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0]?.message || 'Request payload validation failed',
            details: err.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
      }
      next(err);
    }
  };
}
