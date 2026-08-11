import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, PUT, DELETE } from '../columns/route';
import { auth } from '@/auth';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Board', () => ({
  Board: {
    findById: vi.fn(),
  },
}));

vi.mock('@/models/Column', () => ({
  Column: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    deleteMany: vi.fn(),
  },
}));

describe('API Route /api/columns Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/columns', () => {
    it('returns 400 when missing boardId or title', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const req = new Request('http://localhost/api/columns', {
        method: 'POST',
        body: JSON.stringify({ boardId: 'b1', title: '' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('creates column successfully', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);
      vi.mocked(Column.countDocuments).mockResolvedValueOnce(2);
      const createdCol = { _id: 'col_new', boardId: 'b1', title: 'Review', order: 2 };
      vi.mocked(Column.create).mockResolvedValueOnce(createdCol as any);

      const req = new Request('http://localhost/api/columns', {
        method: 'POST',
        body: JSON.stringify({ boardId: 'b1', title: 'Review' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual(createdCol);
    });
  });

  describe('PUT /api/columns', () => {
    it('updates column title and order', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const existingCol = { _id: 'col_1', boardId: { toString: () => 'b1' }, title: 'Col 1' };
      const updatedCol = { _id: 'col_1', title: 'Renamed Title', order: 0 };

      vi.mocked(Column.findById).mockResolvedValueOnce(existingCol as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);
      vi.mocked(Column.findByIdAndUpdate).mockResolvedValueOnce(updatedCol as any);

      const req = new Request('http://localhost/api/columns', {
        method: 'PUT',
        body: JSON.stringify({ columnId: 'col_1', title: 'Renamed Title' }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(updatedCol);
    });
  });

  describe('DELETE /api/columns', () => {
    it('deletes column and its cards', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const existingCol = { _id: 'col_1', boardId: { toString: () => 'b1' }, title: 'Col 1' };

      vi.mocked(Column.findById).mockResolvedValueOnce(existingCol as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);

      const req = new Request('http://localhost/api/columns?columnId=col_1', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Column deleted successfully.');
      expect(Card.deleteMany).toHaveBeenCalledWith({ columnId: 'col_1' });
      expect(Column.findByIdAndDelete).toHaveBeenCalledWith('col_1');
    });
  });
});
