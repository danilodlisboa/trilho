import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../register/route';
import { User } from '@/models/User';

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

describe('POST /api/register API Route Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: '' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('All fields are required.');
  });

  it('returns 400 when password is too short', async () => {
    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: '123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Password must be between 6 and 128 characters.');
  });

  it('returns 400 when email format is invalid', async () => {
    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'invalid-email-string', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid email format.');
  });

  it('returns 400 when email is already registered', async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce({ _id: 'existing_id', email: 'test@example.com' } as any);

    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('This email is already registered.');
  });

  it('registers user successfully with 201 status', async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce(null);
    vi.mocked(User.create).mockResolvedValueOnce({
      _id: { toString: () => 'user_123' },
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test%20User',
    } as any);

    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe('User registered successfully! Please check your email to verify your account.');
    expect(data.user.id).toBe('user_123');
    expect(data.user.email).toBe('test@example.com');
  });
});
