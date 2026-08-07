import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../boards/[boardId]/custom-fields/route';
import { PUT, PATCH, DELETE } from '../boards/[boardId]/custom-fields/[fieldId]/route';
import { Board } from '@/models/Board';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';
import { auth } from '@/auth';

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

vi.mock('@/models/Card', () => ({
  Card: {
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 0 }),
  },
}));

vi.mock('@/models/CustomFieldDefinition', () => ({
  CustomFieldDefinition: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

describe('Custom Fields API Routes Tests', () => {
  const mockOwnerId = 'user_owner_123';
  const mockBoardId = 'board_123';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 Unauthorized when session is missing', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const req = new Request('http://localhost/api/boards/board_123/custom-fields');
    const res = await GET(req, { params: Promise.resolve({ boardId: 'board_123' }) });
    expect(res.status).toBe(401);
  });

  it('returns 403 Forbidden when user is not a board member', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'stranger_user' } } as any);
    vi.mocked(Board.findById).mockResolvedValueOnce({
      _id: mockBoardId,
      ownerId: { toString: () => mockOwnerId },
      members: [{ toString: () => 'member_456' }],
    } as any);

    const req = new Request('http://localhost/api/boards/board_123/custom-fields');
    const res = await GET(req, { params: Promise.resolve({ boardId: mockBoardId }) });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain('Forbidden');
  });

  it('creates custom field successfully for authorized board member', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: mockOwnerId } } as any);
    vi.mocked(Board.findById).mockResolvedValueOnce({
      _id: mockBoardId,
      ownerId: { toString: () => mockOwnerId },
      members: [],
    } as any);

    vi.mocked(CustomFieldDefinition.create).mockResolvedValueOnce({
      _id: 'cf_1',
      boardId: mockBoardId,
      name: 'Environment',
      fieldType: 'select',
      options: ['Production', 'Staging'],
      isDefault: true,
      defaultValue: 'Staging',
    } as any);

    const req = new Request(`http://localhost/api/boards/${mockBoardId}/custom-fields`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Environment',
        fieldType: 'select',
        options: ['Production', 'Staging'],
        isDefault: true,
        defaultValue: 'Staging',
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ boardId: mockBoardId }) });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.name).toBe('Environment');
    expect(data.isDefault).toBe(true);
  });
});
