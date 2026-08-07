import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../columns/reorder/route';
import { Column } from '@/models/Column';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Column', () => ({
  Column: {
    bulkWrite: vi.fn().mockResolvedValue({ modifiedCount: 2 }),
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

  it('reorders columns successfully', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_1' } } as any);

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
