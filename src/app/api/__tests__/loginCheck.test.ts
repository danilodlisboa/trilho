import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../auth/login-check/route';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

describe('POST /api/auth/login-check API Route Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = new Request('http://localhost/api/auth/login-check', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Email and password are required.');
  });

  it('returns 401 when user is not found', async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce(null);

    const req = new Request('http://localhost/api/auth/login-check', {
      method: 'POST',
      body: JSON.stringify({ email: 'unknown@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Invalid email or password.');
  });

  it('returns 401 when password is wrong', async () => {
    const mockHash = await bcrypt.hash('correct_password', 10);
    vi.mocked(User.findOne).mockResolvedValueOnce({
      email: 'user@example.com',
      passwordHash: mockHash,
      isVerified: true,
    } as any);

    const req = new Request('http://localhost/api/auth/login-check', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'wrong_password' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Invalid email or password.');
  });

  it('returns 403 UNVERIFIED_EMAIL when user is not verified', async () => {
    const mockHash = await bcrypt.hash('correct_password', 10);
    vi.mocked(User.findOne).mockResolvedValueOnce({
      email: 'unverified@example.com',
      passwordHash: mockHash,
      isVerified: false,
    } as any);

    const req = new Request('http://localhost/api/auth/login-check', {
      method: 'POST',
      body: JSON.stringify({ email: 'unverified@example.com', password: 'correct_password' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('UNVERIFIED_EMAIL');
    expect(data.message).toContain('Account email not verified');
  });

  it('returns 200 ok when credentials and verification are valid', async () => {
    const mockHash = await bcrypt.hash('correct_password', 10);
    vi.mocked(User.findOne).mockResolvedValueOnce({
      email: 'verified@example.com',
      passwordHash: mockHash,
      isVerified: true,
    } as any);

    const req = new Request('http://localhost/api/auth/login-check', {
      method: 'POST',
      body: JSON.stringify({ email: 'verified@example.com', password: 'correct_password' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});
