import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Middleware Security Headers Unit Tests', () => {
  it('applies Content-Security-Policy and security headers to Next.js responses in dev mode', () => {
    const req = new NextRequest('http://localhost/dashboard');
    const res = middleware(req);

    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("https://api.dicebear.com");
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('applies strict CSP omitting unsafe-eval in production mode', () => {
    const origEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const req = new NextRequest('http://localhost/dashboard');
      const res = middleware(req);
      const csp = res.headers.get('Content-Security-Policy') || '';
      expect(csp).toContain("script-src 'self' 'nonce-");
      expect(csp).toContain("'strict-dynamic'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain("style-src-attr 'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it('correctly sets security headers on redirect responses for root unauthenticated requests', () => {
    const req = new NextRequest('http://localhost/');
    const res = middleware(req);

    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost/login');
    expect(csp).toContain("default-src 'self'");
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('redirects unauthenticated users attempting to access /dashboard to /login', () => {
    const req = new NextRequest('http://localhost/dashboard');
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost/login?callbackUrl=%2Fdashboard');
  });
});
