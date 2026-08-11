import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../columns/reorder/route';
import { Column } from '@/models/Column';
import { Board } from '@/models/Board';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Column', () => ({
  Column: {
    find: vi.fn(),
    bulkWrite: vi.fn().mockResolvedValue({ modifiedCount: 2 }),
  },
}));

vi.mock('@/models/Board', () => ({
  Board: {
    find: vi.fn(),
  },
}));

describe('POST /api/columns/reorder API Route Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when unauthorized', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const req = new Request('http://localhost/api/columns/reorder', {
      method: 'POST',
      body: JSON.stringify({ columns: [{ id: 'col1', order: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 Forbidden when trying to reorder columns belonging to an unauthorized board (IDOR prevention)', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'attacker' } } as any);
    vi.mocked(Column.find).mockResolvedValueOnce([
      { _id: 'col1', boardId: 'victim_board' },
    ] as any);
    vi.mocked(Board.find).mockResolvedValueOnce([] as any);

    const req = new Request('http://localhost/api/columns/reorder', {
      method: 'POST',
      body: JSON.stringify({ columns: [{ id: 'col1', order: 1 }] }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain('Forbidden');
  });

  it('reorders columns successfully when authorized', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_1' } } as any);
    vi.mocked(Column.find).mockResolvedValueOnce([
      { _id: 'col1', boardId: 'b1' },
      { _id: 'col2', boardId: 'b1' },
    ] as any);
    vi.mocked(Board.find).mockResolvedValueOnce([{ _id: 'b1', ownerId: 'user_1', members: [] }] as any);

    const req = new Request('http://localhost/api/columns/reorder', {
      method: 'POST',
      body: JSON.stringify({
        columns: [
          { id: 'col1', order: 1 },
          { id: 'col2', order: 0 },
        ],
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Columns reordered successfully.');
    expect(Column.bulkWrite).toHaveBeenCalled();
  });
});
