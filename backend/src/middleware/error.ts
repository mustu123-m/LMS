import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { statusCode?: number; code?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message);

  // Mongoose duplicate key
  if (err.code === 11000) {
    res.status(400).json({ success: false, message: 'Duplicate value — this record already exists.' });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
