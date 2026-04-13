import type { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);

  if (err.message.includes('Only JPEG') || err.message.includes('File too large')) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  const status = (err as Error & { status?: number }).status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
