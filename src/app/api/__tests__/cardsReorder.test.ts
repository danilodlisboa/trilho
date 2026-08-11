import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../cards/reorder/route';
import { auth } from '@/auth';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Card', () => ({
  Card: {
    find: vi.fn(),
    bulkWrite: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn(),
  },
}));

describe('API Route /api/cards/reorder Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when cards array is missing or empty', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
    const req = new Request('http://localhost/api/cards/reorder', {
      method: 'POST',
      body: JSON.stringify({ cards: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 403 Forbidden when trying to reorder cards from an unauthorized board (IDOR prevention)', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_attacker' } } as any);
    vi.mocked(Card.find).mockResolvedValueOnce([
      { _id: 'card_1', boardId: 'board_victim' },
    ] as any);
    vi.mocked(Board.find).mockResolvedValueOnce([] as any); // Returns 0 authorized boards for user_attacker

    const req = new Request('http://localhost/api/cards/reorder', {
      method: 'POST',
      body: JSON.stringify({ cards: [{ id: 'card_1', columnId: 'col_1', order: 0 }] }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain('Forbidden');
  });

  it('performs bulkWrite update for reordered cards when authorized', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);
    vi.mocked(Card.find).mockResolvedValueOnce([
      { _id: 'card_1', boardId: 'b1' },
      { _id: 'card_2', boardId: 'b1' },
    ] as any);
    vi.mocked(Board.find).mockResolvedValueOnce([{ _id: 'b1', ownerId: 'u1', members: [] }] as any);

    const reorderPayload = [
      { id: 'card_1', columnId: 'col_1', order: 0 },
      { id: 'card_2', columnId: 'col_1', order: 1 },
    ];

    const req = new Request('http://localhost/api/cards/reorder', {
      method: 'POST',
      body: JSON.stringify({ cards: reorderPayload }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Cards reordered successfully.');
    expect(Card.bulkWrite).toHaveBeenCalledTimes(1);
  });
});
