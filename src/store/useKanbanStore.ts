import { create } from 'zustand';

export interface IUserRef {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ICardData {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string | null;
  assigneeId?: IUserRef | string | null;
  checklist: IChecklistItem[];
  order: number;
}

export interface IColumnData {
  _id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface IBoardData {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: IUserRef[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface KanbanStoreState {
  // Data State
  boards: IBoardData[];
  activeBoard: IBoardData | null;
  columns: IColumnData[];
  cards: ICardData[];
  users: IUserRef[];

  // UI State
  saveStatus: SaveStatus;
  saveStatusMessage: string;
  searchQuery: string;
  selectedPriority: 'all' | 'high' | 'medium' | 'low';
  selectedAssignee: string; // 'all' or userId
  selectedCardModal: ICardData | null;
  isCreateBoardModalOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  setSelectedAssignee: (assigneeId: string) => void;
  setSelectedCardModal: (card: ICardData | null) => void;
  setIsCreateBoardModalOpen: (isOpen: boolean) => void;

  // Async API & State Actions
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (boardId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  createBoard: (title: string, description: string) => Promise<void>;
  updateBoardTitle: (boardId: string, title: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  createColumn: (title: string) => Promise<void>;
  renameColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;

  createCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<ICardData>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  // Optimistic Move & Reorder Card
  moveCardOptimistic: (
    cardId: string,
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
}

export const useKanbanStore = create<KanbanStoreState>((set, get) => ({
  boards: [],
  activeBoard: null,
  columns: [],
  cards: [],
  users: [],

  saveStatus: 'idle',
  saveStatusMessage: 'Idle',
  searchQuery: '',
  selectedPriority: 'all',
  selectedAssignee: 'all',
  selectedCardModal: null,
  isCreateBoardModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  setSelectedAssignee: (assigneeId) => set({ selectedAssignee: assigneeId }),
  setSelectedCardModal: (card) => set({ selectedCardModal: card }),
  setIsCreateBoardModalOpen: (isOpen) => set({ isCreateBoardModalOpen: isOpen }),

  fetchBoards: async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const boards = await res.json();
        set({ boards });
        if (boards.length > 0 && !get().activeBoard) {
          get().fetchBoardDetails(boards[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    }
  },

  fetchUsers: async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        set({ users });
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  },

  fetchBoardDetails: async (boardId: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Loading board...' });
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          activeBoard: data.board,
          columns: data.columns,
          cards: data.cards,
          saveStatus: 'saved',
          saveStatusMessage: 'Saved to DB',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Failed to load board' });
      }
    } catch (err) {
      console.error('Failed to fetch board details:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  createBoard: async (title: string, description: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Creating board...' });
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedBoards = [data.board, ...get().boards];
        set({
          boards: updatedBoards,
          activeBoard: data.board,
          columns: data.columns,
          cards: [],
          saveStatus: 'saved',
          saveStatusMessage: 'Board created',
          isCreateBoardModalOpen: false,
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error creating board' });
      }
    } catch (err) {
      console.error('Error creating board:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  updateBoardTitle: async (boardId: string, title: string) => {
    const active = get().activeBoard;
    if (active && active._id === boardId) {
      set({ activeBoard: { ...active, title } });
    }

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Saving title...' });
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved to DB' });
        get().fetchBoards();
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error updating title' });
      }
    } catch (err) {
      console.error('Error updating board title:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  deleteBoard: async (boardId: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Deleting board...' });
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const remainingBoards = get().boards.filter((b) => b._id !== boardId);
        set({ boards: remainingBoards });
        if (remainingBoards.length > 0) {
          get().fetchBoardDetails(remainingBoards[0]._id);
        } else {
          set({ activeBoard: null, columns: [], cards: [] });
        }
        set({ saveStatus: 'saved', saveStatusMessage: 'Board deleted' });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error deleting board' });
      }
    } catch (err) {
      console.error('Error deleting board:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  createColumn: async (title: string) => {
    const active = get().activeBoard;
    if (!active) return;

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Creating column...' });
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: active._id, title }),
      });

      if (res.ok) {
        const newCol = await res.json();
        set({
          columns: [...get().columns, newCol],
          saveStatus: 'saved',
          saveStatusMessage: 'Saved to DB',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error creating column' });
      }
    } catch (err) {
      console.error('Error creating column:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  renameColumn: async (columnId: string, title: string) => {
    const updatedCols = get().columns.map((c) => (c._id === columnId ? { ...c, title } : c));
    set({ columns: updatedCols });

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Renaming column...' });
      const res = await fetch('/api/columns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, title }),
      });

      if (res.ok) {
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved to DB' });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error renaming column' });
      }
    } catch (err) {
      console.error('Error renaming column:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  deleteColumn: async (columnId: string) => {
    const remainingCols = get().columns.filter((c) => c._id !== columnId);
    const remainingCards = get().cards.filter((c) => c.columnId !== columnId);
    set({ columns: remainingCols, cards: remainingCards });

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Deleting column...' });
      const res = await fetch(`/api/columns?columnId=${columnId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved to DB' });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error deleting column' });
      }
    } catch (err) {
      console.error('Error deleting column:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  createCard: async (columnId: string, title: string) => {
    const active = get().activeBoard;
    if (!active) return;

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Creating card...' });
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: active._id, columnId, title }),
      });

      if (res.ok) {
        const newCard = await res.json();
        set({
          cards: [...get().cards, newCard],
          saveStatus: 'saved',
          saveStatusMessage: 'Saved to DB',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error creating card' });
      }
    } catch (err) {
      console.error('Error creating card:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  updateCard: async (cardId: string, updates: Partial<ICardData>) => {
    const currentCards = get().cards;
    const updatedCards = currentCards.map((c) => (c._id === cardId ? { ...c, ...updates } : c));
    set({ cards: updatedCards });

    if (get().selectedCardModal?._id === cardId) {
      set({ selectedCardModal: { ...get().selectedCardModal!, ...updates } });
    }

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Saving card...' });
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, ...updates }),
      });

      if (res.ok) {
        const updatedCardFromDb = await res.json();
        set({
          cards: get().cards.map((c) => (c._id === cardId ? updatedCardFromDb : c)),
          selectedCardModal: get().selectedCardModal?._id === cardId ? updatedCardFromDb : get().selectedCardModal,
          saveStatus: 'saved',
          saveStatusMessage: 'Saved to DB',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error updating card' });
      }
    } catch (err) {
      console.error('Error updating card:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  deleteCard: async (cardId: string) => {
    const remainingCards = get().cards.filter((c) => c._id !== cardId);
    set({ cards: remainingCards, selectedCardModal: null });

    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Deleting card...' });
      const res = await fetch(`/api/cards?cardId=${cardId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved to DB' });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error deleting card' });
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  moveCardOptimistic: (cardId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    const allCards = [...get().cards];

    // Filter cards by column and sort by order
    const sourceCards = allCards
      .filter((c) => c.columnId === sourceColumnId)
      .sort((a, b) => a.order - b.order);

    const destCards =
      sourceColumnId === destColumnId
        ? sourceCards
        : allCards.filter((c) => c.columnId === destColumnId).sort((a, b) => a.order - b.order);

    const draggedCard = allCards.find((c) => c._id === cardId);
    if (!draggedCard) return;

    if (sourceColumnId === destColumnId) {
      // Reorder within the same column
      sourceCards.splice(sourceIndex, 1);
      sourceCards.splice(destIndex, 0, draggedCard);
      sourceCards.forEach((card, idx) => {
        card.order = idx;
      });
    } else {
      // Move between different columns
      draggedCard.columnId = destColumnId;
      sourceCards.splice(sourceIndex, 1);
      destCards.splice(destIndex, 0, draggedCard);

      sourceCards.forEach((card, idx) => {
        card.order = idx;
      });
      destCards.forEach((card, idx) => {
        card.order = idx;
      });
    }

    set({ cards: [...allCards], saveStatus: 'saving', saveStatusMessage: 'Saving reorder...' });

    // Prepare batch update payload for API
    const updatedCardsToSync = allCards.map((c) => ({
      id: c._id,
      columnId: c.columnId,
      order: c.order,
    }));

    fetch('/api/cards/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: updatedCardsToSync }),
    })
      .then((res) => {
        if (res.ok) {
          set({ saveStatus: 'saved', saveStatusMessage: 'Saved to DB' });
        } else {
          set({ saveStatus: 'error', saveStatusMessage: 'Reorder sync failed' });
        }
      })
      .catch((err) => {
        console.error('Reorder sync error:', err);
        set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
      });
  },
}));
