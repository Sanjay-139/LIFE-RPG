import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (env.NODE_ENV !== 'test') {
    console.error(`[Error] ${code} (${statusCode}):`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {})
    }
  });
}
