import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKanbanStore } from '../useKanbanStore';

describe('useKanbanStore Unit Tests', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      boards: [],
      activeBoard: null,
      columns: [],
      cards: [],
      users: [],
      isLoadingBoards: true,
      fetchError: null,
      saveStatus: 'idle',
      saveStatusMessage: 'Idle',
      searchQuery: '',
      selectedPriority: 'all',
      selectedAssignee: 'all',
      selectedCardModal: null,
      isCreateBoardModalOpen: false,
    });
    vi.restoreAllMocks();
  });

  it('should initialize with default state values', () => {
    const state = useKanbanStore.getState();
    expect(state.boards).toEqual([]);
    expect(state.activeBoard).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedPriority).toBe('all');
    expect(state.isCreateBoardModalOpen).toBe(false);
  });

  it('should update search query, priority, and assignee filters', () => {
    const { setSearchQuery, setSelectedPriority, setSelectedAssignee } = useKanbanStore.getState();
    setSearchQuery('bug fix');
    setSelectedPriority('high');
    setSelectedAssignee('user_123');

    expect(useKanbanStore.getState().searchQuery).toBe('bug fix');
    expect(useKanbanStore.getState().selectedPriority).toBe('high');
    expect(useKanbanStore.getState().selectedAssignee).toBe('user_123');
  });

  it('should fetch boards list and load board details', async () => {
    const mockBoards = [{ _id: 'b1', title: 'Board 1', ownerId: 'u1', members: [] }];
    const mockBoardData = {
      board: mockBoards[0],
      columns: [{ _id: 'c1', boardId: 'b1', title: 'To Do', order: 0 }],
      cards: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/boards') {
        return Promise.resolve({ ok: true, json: async () => mockBoards });
      }
      if (url.startsWith('/api/boards/')) {
        return Promise.resolve({ ok: true, json: async () => mockBoardData });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await useKanbanStore.getState().fetchBoards();
    await useKanbanStore.getState().fetchBoardDetails('b1');

    expect(useKanbanStore.getState().boards).toEqual(mockBoards);
    expect(useKanbanStore.getState().activeBoard).toEqual(mockBoards[0]);
    expect(useKanbanStore.getState().columns).toHaveLength(1);
  });

  it('should fetch users list', async () => {
    const mockUsers = [{ _id: 'u1', name: 'Alice', email: 'alice@example.com' }];
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => mockUsers });

    await useKanbanStore.getState().fetchUsers();

    expect(useKanbanStore.getState().users).toEqual(mockUsers);
  });

  it('should create a new board and select it', async () => {
    const newBoard = { _id: 'b_new', title: 'New Project', description: 'Desc', ownerId: 'u1', members: [] };
    const defaultCols = [{ _id: 'c1', boardId: 'b_new', title: 'To Do', order: 0 }];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ board: newBoard, columns: defaultCols }),
    });

    await useKanbanStore.getState().createBoard('New Project', 'Desc');

    expect(useKanbanStore.getState().activeBoard).toEqual(newBoard);
    expect(useKanbanStore.getState().columns).toEqual(defaultCols);
    expect(useKanbanStore.getState().isCreateBoardModalOpen).toBe(false);
    expect(useKanbanStore.getState().saveStatus).toBe('saved');
  });

  it('should update board title', async () => {
    useKanbanStore.setState({
      activeBoard: { _id: 'b1', title: 'Old Title', ownerId: 'u1', members: [] },
    });

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

    await useKanbanStore.getState().updateBoardTitle('b1', 'Updated Title');

    expect(useKanbanStore.getState().activeBoard?.title).toBe('Updated Title');
  });

  it('should delete a board and handle remaining active board', async () => {
    useKanbanStore.setState({
      boards: [
        { _id: 'b1', title: 'Board 1', ownerId: 'u1', members: [] },
        { _id: 'b2', title: 'Board 2', ownerId: 'u1', members: [] },
      ],
      activeBoard: { _id: 'b1', title: 'Board 1', ownerId: 'u1', members: [] },
    });

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          board: { _id: 'b2', title: 'Board 2', ownerId: 'u1', members: [] },
          columns: [],
          cards: [],
        }),
      });

    await useKanbanStore.getState().deleteBoard('b1');

    expect(useKanbanStore.getState().boards).toHaveLength(1);
    expect(useKanbanStore.getState().boards[0]._id).toBe('b2');
  });

  it('should create, rename, and delete a column', async () => {
    useKanbanStore.setState({
      activeBoard: { _id: 'b1', title: 'Board 1', ownerId: 'u1', members: [] },
      columns: [],
    });

    const newCol = { _id: 'c1', boardId: 'b1', title: 'In Progress', order: 0 };
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => newCol });

    await useKanbanStore.getState().createColumn('In Progress');
    expect(useKanbanStore.getState().columns).toEqual([newCol]);

    // Rename column
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    await useKanbanStore.getState().renameColumn('c1', 'Review');
    expect(useKanbanStore.getState().columns[0].title).toBe('Review');

    // Delete column
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    await useKanbanStore.getState().deleteColumn('c1');
    expect(useKanbanStore.getState().columns).toHaveLength(0);
  });

  it('should create and delete a card', async () => {
    useKanbanStore.setState({
      activeBoard: { _id: 'b1', title: 'Board 1', ownerId: 'u1', members: [] },
      cards: [],
    });

    const newCard = { _id: 'card1', boardId: 'b1', columnId: 'c1', title: 'Task 1', priority: 'medium', checklist: [], order: 0 };
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => newCard });

    await useKanbanStore.getState().createCard('c1', 'Task 1');
    expect(useKanbanStore.getState().cards).toEqual([newCard]);

    // Delete card
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    await useKanbanStore.getState().deleteCard('card1');
    expect(useKanbanStore.getState().cards).toHaveLength(0);
  });

  it('should handle optimistic card movement cross-column', () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    useKanbanStore.setState({
      cards: [
        { _id: 'card1', boardId: 'b1', columnId: 'col1', title: 'Task 1', priority: 'medium', checklist: [], order: 0 },
        { _id: 'card2', boardId: 'b1', columnId: 'col2', title: 'Task 2', priority: 'high', checklist: [], order: 0 },
      ],
    });

    const { moveCardOptimistic } = useKanbanStore.getState();
    moveCardOptimistic('card1', 'col1', 'col2', 0, 1);

    const updatedCards = useKanbanStore.getState().cards;
    const card1 = updatedCards.find((c) => c._id === 'card1');
    expect(card1?.columnId).toBe('col2');
    expect(card1?.order).toBe(1);
  });

  it('should handle optimistic vertical card reordering within the same column', () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    useKanbanStore.setState({
      cards: [
        { _id: 'card1', boardId: 'b1', columnId: 'col1', title: 'Task 1', priority: 'medium', checklist: [], order: 0 },
        { _id: 'card2', boardId: 'b1', columnId: 'col1', title: 'Task 2', priority: 'high', checklist: [], order: 1 },
      ],
    });

    const { moveCardOptimistic } = useKanbanStore.getState();
    moveCardOptimistic('card2', 'col1', 'col1', 1, 0);

    const updatedCards = useKanbanStore.getState().cards;
    expect(updatedCards[0]._id).toBe('card2');
    expect(updatedCards[0].order).toBe(0);
    expect(updatedCards[1]._id).toBe('card1');
    expect(updatedCards[1].order).toBe(1);
  });
});
