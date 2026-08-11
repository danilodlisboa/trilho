import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../users/route';
import { auth } from '@/auth';
import { User } from '@/models/User';
import { Board } from '@/models/Board';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

describe('API Route /api/users Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when unauthorized', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns list of users sorted by name', async () => {
    const validId = '66ab32101234567890abcdef';
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: validId } } as any);
    vi.mocked(User.findOne).mockResolvedValueOnce({ _id: validId } as any);
    vi.mocked(Board.find).mockResolvedValueOnce([{ ownerId: validId, members: [] }] as any);

    const mockUsers = [
      { _id: validId, name: 'Alice', email: 'alice@example.com' },
    ];

    vi.mocked(User.find).mockReturnValueOnce({
      sort: vi.fn().mockResolvedValueOnce(mockUsers),
    } as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockUsers);
  });
});
