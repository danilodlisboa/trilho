import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../seed/route';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', () => ({
  User: {
    deleteMany: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockImplementation(async (userData) => ({
      _id: `user_${Math.random()}`,
      ...userData,
    })),
  },
}));

vi.mock('@/models/Board', () => ({
  Board: {
    deleteMany: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockImplementation(async (boardData) => ({
      _id: `board_${Math.random()}`,
      ...boardData,
    })),
  },
}));

vi.mock('@/models/Column', () => ({
  Column: {
    deleteMany: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockImplementation(async (colData) => ({
      _id: `col_${Math.random()}`,
      ...colData,
    })),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    deleteMany: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue([]),
  },
}));

describe('API Route /api/seed Unit Tests', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns 403 when process.env.NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Seed disabled in production.');
  });

  it('populates database with demo seed datasets in non-production', async () => {
    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Database seeded successfully!');
    expect(data.adminEmail).toBe('admin@trilho.com');
    expect(data.boardsCount).toBe(3);
    expect(User.deleteMany).toHaveBeenCalled();
    expect(Board.deleteMany).toHaveBeenCalled();
  });
});
