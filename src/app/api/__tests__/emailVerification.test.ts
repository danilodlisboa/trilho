import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as verifyPost } from '../auth/verify-email/route';
import { POST as resendPost } from '../auth/resend-verification/route';
import { User } from '@/models/User';
import { createSignedToken } from '@/lib/tokens';

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

describe('Email Verification API Routes Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/verify-email', () => {
    it('returns 400 when token is missing', async () => {
      const req = new Request('http://localhost/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await verifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Verification token is required.');
    });

    it('returns 400 when token is invalid or expired', async () => {
      const req = new Request('http://localhost/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid_token_string' }),
      });

      const res = await verifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid or expired verification token.');
    });

    it('verifies email successfully with valid token', async () => {
      const token = createSignedToken({ email: 'test@example.com', type: 'verify' }, 3600);
      const mockSave = vi.fn().mockResolvedValue(true);

      vi.mocked(User.findOne).mockResolvedValueOnce({
        email: 'test@example.com',
        isVerified: false,
        save: mockSave,
      } as any);

      const req = new Request('http://localhost/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      const res = await verifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Email verified successfully! You can now log in.');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('returns 400 when email is missing', async () => {
      const req = new Request('http://localhost/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await resendPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Email is required.');
    });

    it('sends fresh verification email for unverified user', async () => {
      vi.mocked(User.findOne).mockResolvedValueOnce({
        name: 'Test User',
        email: 'unverified@example.com',
        isVerified: false,
      } as any);

      const req = new Request('http://localhost/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: 'unverified@example.com' }),
      });

      const res = await resendPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Verification link sent! Please check your inbox.');
    });
  });
});
