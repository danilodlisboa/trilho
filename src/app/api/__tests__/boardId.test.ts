import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '../boards/[boardId]/route';
import { auth } from '@/auth';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Board', () => ({
  Board: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock('@/models/Column', () => ({
  Column: {
    find: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    find: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

describe('API Route /api/boards/[boardId] Unit Tests', () => {
  const params = Promise.resolve({ boardId: 'board_123' });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/boards/[boardId]', () => {
    it('returns 401 when unauthorized', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const req = new Request('http://localhost/api/boards/board_123');

      const res = await GET(req, { params });
      expect(res.status).toBe(401);
    });

    it('returns 404 when board not found', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      vi.mocked(Board.findById).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(null),
      } as any);

      const req = new Request('http://localhost/api/boards/board_123');
      const res = await GET(req, { params });
      expect(res.status).toBe(404);
    });

    it('returns board details with columns and cards', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const mockBoard = { _id: 'board_123', title: 'Board 1' };
      const mockColumns = [{ _id: 'col_1', title: 'To Do' }];
      const mockCards = [{ _id: 'card_1', title: 'Task 1' }];

      vi.mocked(Board.findById).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(mockBoard),
      } as any);

      vi.mocked(Column.find).mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockColumns),
      } as any);

      vi.mocked(Card.find).mockReturnValueOnce({
        populate: vi.fn().mockReturnValueOnce({
          sort: vi.fn().mockResolvedValueOnce(mockCards),
        }),
      } as any);

      const req = new Request('http://localhost/api/boards/board_123');
      const res = await GET(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.board).toEqual(mockBoard);
      expect(data.columns).toEqual(mockColumns);
      expect(data.cards).toEqual(mockCards);
    });
  });

  describe('PUT /api/boards/[boardId]', () => {
    it('updates board title and description', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const updatedBoard = { _id: 'board_123', title: 'Updated Title', description: 'New Desc' };

      vi.mocked(Board.findByIdAndUpdate).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(updatedBoard),
      } as any);

      const req = new Request('http://localhost/api/boards/board_123', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title', description: 'New Desc' }),
      });

      const res = await PUT(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(updatedBoard);
    });
  });

  describe('DELETE /api/boards/[boardId]', () => {
    it('deletes board and associated columns and cards', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);

      const req = new Request('http://localhost/api/boards/board_123', {
        method: 'DELETE',
      });

      const res = await DELETE(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Board deleted successfully.');
      expect(Card.deleteMany).toHaveBeenCalledWith({ boardId: 'board_123' });
      expect(Column.deleteMany).toHaveBeenCalledWith({ boardId: 'board_123' });
      expect(Board.findByIdAndDelete).toHaveBeenCalledWith('board_123');
    });
  });
});
