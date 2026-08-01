import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../boards/route';
import { auth } from '@/auth';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { User } from '@/models/User';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/models/Column', () => ({
  Column: {
    create: vi.fn(),
  },
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

describe('API Route /api/boards Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/boards', () => {
    it('returns 401 when user is unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized.');
    });

    it('returns boards list for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: 'user_123', email: 'test@example.com' },
      } as any);

      vi.mocked(User.findOne).mockResolvedValueOnce({ _id: 'user_123' } as any);

      const mockBoards = [
        { _id: 'b1', title: 'Board 1', ownerId: 'user_123', members: [] },
      ];

      vi.mocked(Board.find).mockReturnValueOnce({
        populate: vi.fn().mockReturnValueOnce({
          sort: vi.fn().mockResolvedValueOnce(mockBoards),
        }),
      } as any);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockBoards);
    });
  });

  describe('POST /api/boards', () => {
    it('returns 400 when board title is empty', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: 'user_123', email: 'test@example.com' },
      } as any);

      const req = new Request('http://localhost/api/boards', {
        method: 'POST',
        body: JSON.stringify({ title: '' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Board title is required.');
    });

    it('creates board and default columns with 201 status', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: 'user_123', email: 'test@example.com' },
      } as any);

      vi.mocked(User.findOne).mockResolvedValueOnce({ _id: 'user_123' } as any);

      const createdBoard = { _id: 'board_new', title: 'New Project', ownerId: 'user_123' };
      vi.mocked(Board.create).mockResolvedValueOnce(createdBoard as any);
      vi.mocked(Column.create).mockImplementation(async (colData) => colData as any);

      vi.mocked(Board.findById).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(createdBoard),
      } as any);

      const req = new Request('http://localhost/api/boards', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Project', description: 'Test description' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.board).toEqual(createdBoard);
      expect(data.columns).toHaveLength(4);
      expect(data.columns[0].title).toBe('To Do');
    });
  });
});
