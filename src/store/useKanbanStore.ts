import { create } from 'zustand';
import { signOut } from 'next-auth/react';

const checkUnauthorized = (res: Response) => {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      signOut({ callbackUrl: '/login' }).then(() => {
        window.location.href = '/login';
      }).catch(() => {
        window.location.href = '/login';
      });
    }
    return true;
  }
  return false;
};

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

export interface ICustomFieldValue {
  fieldId: string;
  value: string;
}

export interface ICustomFieldDefinition {
  _id: string;
  boardId: string;
  name: string;
  fieldType: 'text' | 'number' | 'select' | 'date';
  options: string[];
  isDefault: boolean;
  defaultValue?: string;
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
  customFields?: ICustomFieldValue[];
  order: number;
}

export interface IBoardInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy?: string;
  createdAt: string;
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
  invitations?: IBoardInvitation[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface KanbanStoreState {
  // Data State
  boards: IBoardData[];
  pendingInvitations: IBoardData[];
  activeBoard: IBoardData | null;
  columns: IColumnData[];
  cards: ICardData[];
  customFields: ICustomFieldDefinition[];
  users: IUserRef[];

  // UI State
  isLoadingBoards: boolean;
  fetchError: string | null;
  saveStatus: SaveStatus;
  saveStatusMessage: string;
  searchQuery: string;
  selectedPriority: 'all' | 'high' | 'medium' | 'low';
  selectedAssignee: string; // 'all' or userId
  selectedCardModal: ICardData | null;
  isCreateBoardModalOpen: boolean;
  isDefaultFieldsModalOpen: boolean;
  isSidebarContracted: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  setSelectedAssignee: (assigneeId: string) => void;
  setSelectedCardModal: (card: ICardData | null) => void;
  setIsCreateBoardModalOpen: (isOpen: boolean) => void;
  setIsDefaultFieldsModalOpen: (isOpen: boolean) => void;
  setIsSidebarContracted: (contracted: boolean) => void;
  toggleSidebarContracted: () => void;

  // Async API & State Actions
  fetchBoards: () => Promise<void>;
  fetchPendingInvitations: () => Promise<void>;
  fetchBoardDetails: (boardId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  createBoard: (title: string, description: string) => Promise<IBoardData | undefined>;
  updateBoardTitle: (boardId: string, title: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  inviteMember: (boardId: string, email: string) => Promise<{ ok: boolean; error?: string }>;
  acceptInvitation: (boardId: string) => Promise<void>;
  declineInvitation: (boardId: string) => Promise<void>;
  removeMemberOrInvite: (boardId: string, identifier: string) => Promise<void>;

  createColumn: (title: string) => Promise<void>;
  renameColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;

  createCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<ICardData>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  // Custom Fields Actions
  fetchCustomFields: (boardId: string) => Promise<void>;
  createCustomField: (
    boardId: string,
    name: string,
    fieldType: string,
    options?: string[],
    isDefault?: boolean,
    defaultValue?: string
  ) => Promise<void>;
  updateCustomField: (
    boardId: string,
    fieldId: string,
    updates: Partial<ICustomFieldDefinition>
  ) => Promise<void>;
  deleteCustomField: (boardId: string, fieldId: string) => Promise<void>;
  toggleDefaultCustomField: (
    boardId: string,
    fieldId: string,
    isDefault: boolean,
    defaultValue?: string
  ) => Promise<void>;

  // Optimistic Move & Reorder
  moveColumnOptimistic: (boardId: string, sourceIndex: number, destIndex: number) => void;
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
  pendingInvitations: [],
  activeBoard: null,
  columns: [],
  cards: [],
  customFields: [],
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
  isDefaultFieldsModalOpen: false,
  isSidebarContracted: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  setSelectedAssignee: (assigneeId) => set({ selectedAssignee: assigneeId }),
  setSelectedCardModal: (card) => set({ selectedCardModal: card }),
  setIsCreateBoardModalOpen: (isOpen) => set({ isCreateBoardModalOpen: isOpen }),
  setIsDefaultFieldsModalOpen: (isOpen) => set({ isDefaultFieldsModalOpen: isOpen }),
  setIsSidebarContracted: (contracted) => set({ isSidebarContracted: contracted }),
  toggleSidebarContracted: () => set((state) => ({ isSidebarContracted: !state.isSidebarContracted })),

  fetchBoards: async () => {
    set({ isLoadingBoards: true, fetchError: null });
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const boards = await res.json();
        set({ boards, isLoadingBoards: false, fetchError: null });
        if (boards.length > 0 && !get().activeBoard) {
          get().fetchBoardDetails(boards[0]._id);
        }
      } else {
        const isUnauth = checkUnauthorized(res);
        if (!isUnauth) {
          const errData = await res.json().catch(() => ({}));
          set({ isLoadingBoards: false, fetchError: errData.error || 'Failed to load workspace boards.' });
        } else {
          set({ isLoadingBoards: false });
        }
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      set({ isLoadingBoards: false, fetchError: 'Database connection error. Please try again.' });
    }
  },

  fetchPendingInvitations: async () => {
    try {
      const res = await fetch('/api/boards/invitations/pending');
      if (res.ok) {
        const pendingInvitations = await res.json();
        set({ pendingInvitations });
      }
    } catch (err) {
      console.error('Failed to fetch pending invitations:', err);
    }
  },

  inviteMember: async (boardId: string, email: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Sending invitation...' });
      const res = await fetch(`/api/boards/${boardId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        set({
          activeBoard: data,
          saveStatus: 'saved',
          saveStatusMessage: 'Invitation sent',
        });
        return { ok: true };
      } else {
        set({ saveStatus: 'error', saveStatusMessage: data.error || 'Failed to send invitation' });
        return { ok: false, error: data.error || 'Failed to send invitation' };
      }
    } catch (err: any) {
      console.error('Error inviting member:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
      return { ok: false, error: 'Connection error' };
    }
  },

  acceptInvitation: async (boardId: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Accepting invitation...' });
      const res = await fetch(`/api/boards/${boardId}/invitations/accept`, {
        method: 'POST',
      });

      if (res.ok) {
        await get().fetchBoards();
        await get().fetchPendingInvitations();
        await get().fetchBoardDetails(boardId);
        set({ saveStatus: 'saved', saveStatusMessage: 'Joined board' });
      } else {
        const data = await res.json();
        set({ saveStatus: 'error', saveStatusMessage: data.error || 'Failed to accept invitation' });
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  declineInvitation: async (boardId: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Declining invitation...' });
      const res = await fetch(`/api/boards/${boardId}/invitations/decline`, {
        method: 'POST',
      });

      if (res.ok) {
        await get().fetchPendingInvitations();
        set({ saveStatus: 'saved', saveStatusMessage: 'Invitation declined' });
      } else {
        const data = await res.json();
        set({ saveStatus: 'error', saveStatusMessage: data.error || 'Failed to decline invitation' });
      }
    } catch (err) {
      console.error('Error declining invitation:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  removeMemberOrInvite: async (boardId: string, identifier: string) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Updating members...' });
      const res = await fetch(`/api/boards/${boardId}/members/${encodeURIComponent(identifier)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedBoard = await res.json();
        set({
          activeBoard: updatedBoard,
          saveStatus: 'saved',
          saveStatusMessage: 'Member removed',
        });
      } else {
        const data = await res.json();
        set({ saveStatus: 'error', saveStatusMessage: data.error || 'Failed to remove member' });
      }
    } catch (err) {
      console.error('Error removing member:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  fetchUsers: async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        set({ users });
      } else {
        checkUnauthorized(res);
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
          saveStatusMessage: 'Saved',
        });
        await get().fetchCustomFields(boardId);
      } else {
        checkUnauthorized(res);
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
          customFields: [],
          saveStatus: 'saved',
          saveStatusMessage: 'Board created',
          isCreateBoardModalOpen: false,
        });
        return data.board;
      } else {
        checkUnauthorized(res);
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
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
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
          set({ activeBoard: null, columns: [], cards: [], customFields: [] });
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
          saveStatusMessage: 'Saved',
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
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
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
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
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
          saveStatusMessage: 'Saved',
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
          saveStatusMessage: 'Saved',
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
        set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Error deleting card' });
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  // Custom Fields Actions
  fetchCustomFields: async (boardId: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/custom-fields`);
      if (res?.ok) {
        const customFields = await res.json();
        set({ customFields });
      }
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
    }
  },

  createCustomField: async (boardId, name, fieldType, options = [], isDefault = false, defaultValue = '') => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Creating custom field...' });
      const res = await fetch(`/api/boards/${boardId}/custom-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, fieldType, options, isDefault, defaultValue }),
      });

      if (res.ok) {
        const newField = await res.json();
        set({
          customFields: [...get().customFields, newField],
          saveStatus: 'saved',
          saveStatusMessage: 'Custom field created',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Failed to create custom field' });
      }
    } catch (err) {
      console.error('Error creating custom field:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  updateCustomField: async (boardId, fieldId, updates) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Updating custom field...' });
      const res = await fetch(`/api/boards/${boardId}/custom-fields/${fieldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedField = await res.json();
        set({
          customFields: get().customFields.map((f) => (f._id === fieldId ? updatedField : f)),
          saveStatus: 'saved',
          saveStatusMessage: 'Custom field updated',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Failed to update custom field' });
      }
    } catch (err) {
      console.error('Error updating custom field:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  deleteCustomField: async (boardId, fieldId) => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Deleting custom field...' });
      const res = await fetch(`/api/boards/${boardId}/custom-fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        set({
          customFields: get().customFields.filter((f) => f._id !== fieldId),
          // Also strip deleted field from in-memory cards
          cards: get().cards.map((c) => ({
            ...c,
            customFields: c.customFields?.filter((cf) => cf.fieldId !== fieldId),
          })),
          saveStatus: 'saved',
          saveStatusMessage: 'Custom field deleted',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Failed to delete custom field' });
      }
    } catch (err) {
      console.error('Error deleting custom field:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  toggleDefaultCustomField: async (boardId, fieldId, isDefault, defaultValue = '') => {
    try {
      set({ saveStatus: 'saving', saveStatusMessage: 'Updating default field...' });
      const res = await fetch(`/api/boards/${boardId}/custom-fields/${fieldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault, defaultValue }),
      });

      if (res.ok) {
        const updatedField = await res.json();
        set({
          customFields: get().customFields.map((f) => (f._id === fieldId ? updatedField : f)),
          saveStatus: 'saved',
          saveStatusMessage: 'Default field updated',
        });
      } else {
        set({ saveStatus: 'error', saveStatusMessage: 'Failed to toggle default field' });
      }
    } catch (err) {
      console.error('Error toggling default custom field:', err);
      set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
    }
  },

  moveColumnOptimistic: (boardId, sourceIndex, destIndex) => {
    const cols = [...get().columns].sort((a, b) => a.order - b.order);
    const [movedCol] = cols.splice(sourceIndex, 1);
    cols.splice(destIndex, 0, movedCol);

    cols.forEach((col, idx) => {
      col.order = idx;
    });

    set({ columns: cols, saveStatus: 'saving', saveStatusMessage: 'Saving column order...' });

    const columnsToSync = cols.map((c) => ({
      id: c._id,
      order: c.order,
    }));

    fetch('/api/columns/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns: columnsToSync }),
    })
      .then((res) => {
        if (res.ok) {
          set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
        } else {
          set({ saveStatus: 'error', saveStatusMessage: 'Column reorder failed' });
        }
      })
      .catch((err) => {
        console.error('Column reorder sync error:', err);
        set({ saveStatus: 'error', saveStatusMessage: 'Connection error' });
      });
  },

  moveCardOptimistic: (cardId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    const allCards = [...get().cards];

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
      sourceCards.splice(sourceIndex, 1);
      sourceCards.splice(destIndex, 0, draggedCard);
      sourceCards.forEach((card, idx) => {
        card.order = idx;
      });
    } else {
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

    const updatedAllCards = [...allCards].sort((a, b) => a.order - b.order);
    set({ cards: updatedAllCards, saveStatus: 'saving', saveStatusMessage: 'Saving reorder...' });

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
          set({ saveStatus: 'saved', saveStatusMessage: 'Saved' });
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
