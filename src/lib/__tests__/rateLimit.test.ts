import { describe, it, expect } from 'vitest';
import { isRateLimited } from '../rateLimit';

describe('isRateLimited utility', () => {
  it('should allow requests within limit and block when exceeded', () => {
    const key = 'test-ip-' + Date.now();
    
    // Allow first 3 requests
    expect(isRateLimited(key, 3, 60000)).toBe(false);
    expect(isRateLimited(key, 3, 60000)).toBe(false);
    expect(isRateLimited(key, 3, 60000)).toBe(false);

    // 4th request should be rate-limited
    expect(isRateLimited(key, 3, 60000)).toBe(true);
  });
});
