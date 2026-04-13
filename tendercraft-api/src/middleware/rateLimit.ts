import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TOKENS = 10;
const REFILL_INTERVAL_MS = 60_000; // 1 minute

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS;
  if (refill > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    res.status(429).json({ success: false, error: 'Too many requests. Try again in a minute.' });
    return;
  }

  bucket.tokens--;
  next();
}
