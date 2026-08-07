interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Simple in-memory rate limiter helper for API routes
export function isRateLimited(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count += 1;
  return false;
}

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}
