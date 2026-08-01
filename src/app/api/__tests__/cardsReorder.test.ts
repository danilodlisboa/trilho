import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../cards/reorder/route';
import { auth } from '@/auth';
import { Card } from '@/models/Card';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Card', () => ({
  Card: {
    bulkWrite: vi.fn().mockResolvedValue(true),
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

  it('performs bulkWrite update for reordered cards', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'u1' } } as any);

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
