import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, PUT, DELETE } from '../cards/route';
import { auth } from '@/auth';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';

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

vi.mock('@/models/CustomFieldDefinition', () => ({
  CustomFieldDefinition: {
    find: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

describe('API Route /api/cards Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CustomFieldDefinition.find).mockResolvedValue([] as any);
  });

  describe('POST /api/cards', () => {
    it('returns 400 when required fields are missing', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const req = new Request('http://localhost/api/cards', {
        method: 'POST',
        body: JSON.stringify({ title: '' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when priority string is invalid', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);

      const req = new Request('http://localhost/api/cards', {
        method: 'POST',
        body: JSON.stringify({ boardId: 'b1', columnId: 'c1', title: 'New Task', priority: 'invalid_enum' }),
      });

      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid priority. Must be high, medium, or low.');
    });

    it('creates card successfully', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);
      vi.mocked(Card.countDocuments).mockResolvedValueOnce(0);
      const createdCard = { _id: 'card_new', title: 'New Task', priority: 'high' };

      vi.mocked(Card.create).mockResolvedValueOnce(createdCard as any);
      vi.mocked(Card.findById).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(createdCard),
      } as any);

      const req = new Request('http://localhost/api/cards', {
        method: 'POST',
        body: JSON.stringify({ boardId: 'b1', columnId: 'c1', title: 'New Task', priority: 'high' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual(createdCard);
    });
  });

  describe('PUT /api/cards', () => {
    it('updates card properties', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const existingCard = { _id: 'card_1', boardId: 'b1', title: 'Task 1' };
      const updatedCard = { _id: 'card_1', title: 'Updated Title', priority: 'low' };

      vi.mocked(Card.findById).mockResolvedValueOnce(existingCard as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);
      vi.mocked(Card.findByIdAndUpdate).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(updatedCard),
      } as any);

      const req = new Request('http://localhost/api/cards', {
        method: 'PUT',
        body: JSON.stringify({ cardId: 'card_1', title: 'Updated Title', priority: 'low' }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(updatedCard);
    });
  });

  describe('DELETE /api/cards', () => {
    it('deletes card by ID', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
      const existingCard = { _id: 'card_1', boardId: 'b1', title: 'Task 1' };
      vi.mocked(Card.findById).mockResolvedValueOnce(existingCard as any);
      vi.mocked(Board.findById).mockResolvedValueOnce({ ownerId: 'u1', members: [] } as any);

      const req = new Request('http://localhost/api/cards?cardId=card_1', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Card deleted successfully.');
      expect(Card.findByIdAndDelete).toHaveBeenCalledWith('card_1');
    });
  });
});
