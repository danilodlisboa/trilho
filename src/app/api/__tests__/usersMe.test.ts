import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from '../users/me/route';
import { GET as exportGET } from '../users/me/export/route';
import { auth } from '@/auth';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Card } from '@/models/Card';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn(),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    find: vi.fn(),
  },
}));

describe('/api/users/me API Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('PUT /api/users/me Profile Update', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const req = new Request('http://localhost/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when name is missing', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_1', email: 'user@example.com' } } as any);
      const req = new Request('http://localhost/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Name is required.');
    });

    it('updates profile successfully with 200 status', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: '507f1f77bcf86cd799439011', email: 'user@example.com' } } as any);
      vi.mocked(User.findOneAndUpdate).mockResolvedValueOnce({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Updated Name',
        email: 'user@example.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Updated',
        isVerified: true,
      } as any);

      const req = new Request('http://localhost/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.name).toBe('Updated Name');
    });
  });

  describe('GET /api/users/me/export Personal Data Export', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const res = await exportGET();
      expect(res.status).toBe(401);
    });

    it('exports personal data as structured JSON file attachment', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: '507f1f77bcf86cd799439011', email: 'user@example.com' } } as any);
      vi.mocked(User.findOne).mockResolvedValueOnce({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Maria Oliveira',
        email: 'user@example.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        isVerified: true,
        createdAt: new Date('2026-08-01'),
      } as any);

      vi.mocked(Board.find).mockResolvedValueOnce([
        {
          _id: { toString: () => 'board_1' },
          title: 'Project Board',
          description: 'Kanban board',
          ownerId: { toString: () => '507f1f77bcf86cd799439011' },
          createdAt: new Date('2026-08-02'),
        },
      ] as any);

      vi.mocked(Card.find).mockResolvedValueOnce([
        {
          _id: { toString: () => 'card_1' },
          boardId: { toString: () => 'board_1' },
          title: 'Design Task',
          description: 'Task description',
          priority: 'high',
          dueDate: new Date('2026-08-15'),
          customFields: [],
        },
      ] as any);

      const res = await exportGET();
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="trilho-personal-data.json"');

      const data = await res.json();
      expect(data.dataSubject.email).toBe('user@example.com');
      expect(data.boards).toHaveLength(1);
      expect(data.assignedCards).toHaveLength(1);
    });
  });
});
