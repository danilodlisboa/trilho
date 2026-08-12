import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../users/me/route';
import { auth } from '@/auth';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', () => ({
  User: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn(),
    deleteOne: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('@/models/Column', () => ({
  Column: {
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/models/Card', () => ({
  Card: {
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('@/models/CustomFieldDefinition', () => ({
  CustomFieldDefinition: {
    deleteMany: vi.fn(),
  },
}));

describe('DELETE /api/users/me Account Erasure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const req = new Request('http://localhost/api/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmEmail: 'user@example.com' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when confirmEmail does not match', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_1', email: 'user@example.com' } } as any);
    const req = new Request('http://localhost/api/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmEmail: 'wrong@example.com' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email confirmation does not match account email.');
  });

  it('deletes sole-owned boards and user account successfully', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: '507f1f77bcf86cd799439011', email: 'user@example.com' } } as any);
    vi.mocked(User.findOne).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      email: 'user@example.com',
    } as any);

    // Sole owner board
    vi.mocked(Board.find).mockResolvedValueOnce([
      {
        _id: { toString: () => 'board_sole' },
        ownerId: '507f1f77bcf86cd799439011',
        members: [],
      },
    ] as any);

    const req = new Request('http://localhost/api/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmEmail: 'user@example.com' }),
    });
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    expect(Column.deleteMany).toHaveBeenCalledWith({ boardId: 'board_sole' });
    expect(Card.deleteMany).toHaveBeenCalledWith({ boardId: 'board_sole' });
    expect(CustomFieldDefinition.deleteMany).toHaveBeenCalledWith({ boardId: 'board_sole' });
    expect(Board.deleteOne).toHaveBeenCalledWith({ _id: { toString: expect.any(Function) } });
    expect(User.deleteOne).toHaveBeenCalled();
  });

  it('transfers ownership to first member for shared boards', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: '507f1f77bcf86cd799439011', email: 'user@example.com' } } as any);
    vi.mocked(User.findOne).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      email: 'user@example.com',
    } as any);

    const saveFn = vi.fn();
    vi.mocked(Board.find).mockResolvedValueOnce([
      {
        _id: { toString: () => 'board_shared' },
        ownerId: '507f1f77bcf86cd799439011',
        members: ['507f1f77bcf86cd799439022', '507f1f77bcf86cd799439011'],
        save: saveFn,
      },
    ] as any);

    const req = new Request('http://localhost/api/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmEmail: 'user@example.com' }),
    });
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    expect(saveFn).toHaveBeenCalled();
    expect(User.deleteOne).toHaveBeenCalled();
  });
});
