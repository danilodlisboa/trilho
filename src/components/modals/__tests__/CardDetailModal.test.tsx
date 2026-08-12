import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CardDetailModal from '../CardDetailModal';
import { useKanbanStore, ICardData } from '@/store/useKanbanStore';

describe('CardDetailModal Unit Tests', () => {
  const mockCard: ICardData = {
    _id: 'card_1',
    boardId: 'b1',
    columnId: 'c1',
    title: 'Implement Authentication',
    description: 'Use NextAuth v5',
    priority: 'high',
    dueDate: '2026-12-31',
    assigneeId: 'user_1',
    checklist: [
      { id: '1', text: 'Subtask 1', completed: false },
      { id: '2', text: 'Subtask 2', completed: true },
    ],
    order: 0,
  };

  const mockCardNoChecklist: ICardData = {
    ...mockCard,
    _id: 'card_2',
    checklist: [],
  };

  beforeEach(() => {
    useKanbanStore.setState({
      selectedCardModal: mockCard,
      users: [{ _id: 'user_1', name: 'Alice', email: 'alice@example.com' }],
      fetchUsers: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      setSelectedCardModal: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  it('renders modal with card details and checklist progress when checklist exists', () => {
    render(<CardDetailModal />);

    expect(screen.getByDisplayValue('Implement Authentication')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Use NextAuth v5')).toBeInTheDocument();
    expect(screen.getByText('1/2 completed (50%)')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
  });

  it('renders Add Sub-tasks Checklist button when card has no checklist', () => {
    useKanbanStore.setState({ selectedCardModal: mockCardNoChecklist });
    render(<CardDetailModal />);

    expect(screen.getByRole('button', { name: /Add Sub-tasks Checklist/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Add sub-task...')).not.toBeInTheDocument();
  });

  it('attaches checklist when Add Sub-tasks Checklist button is clicked', async () => {
    useKanbanStore.setState({ selectedCardModal: mockCardNoChecklist });
    render(<CardDetailModal />);

    const attachBtn = screen.getByRole('button', { name: /Add Sub-tasks Checklist/i });
    await act(async () => {
      fireEvent.click(attachBtn);
    });

    expect(screen.getByPlaceholderText('Add sub-task...')).toBeInTheDocument();
  });

  it('adds a new subtask to local checklist and calls updateCard on Save & Close', async () => {
    const updateCardSpy = vi.fn();
    const setSelectedCardModalSpy = vi.fn();
    useKanbanStore.setState({ updateCard: updateCardSpy, setSelectedCardModal: setSelectedCardModalSpy });

    render(<CardDetailModal />);

    const input = screen.getByPlaceholderText('Add sub-task...');
    const addButton = screen.getByRole('button', { name: /Add/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Subtask 3' } });
      fireEvent.click(addButton);
    });

    // Before clicking Save & Close, updateCard should NOT have been called
    expect(updateCardSpy).not.toHaveBeenCalled();

    // Click Save & Close button
    const saveButton = screen.getByRole('button', { name: /Save & Close/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(updateCardSpy).toHaveBeenCalledWith('card_1', expect.objectContaining({
      checklist: expect.arrayContaining([
        expect.objectContaining({ text: 'Subtask 3', completed: false }),
      ]),
    }));
    expect(setSelectedCardModalSpy).toHaveBeenCalledWith(null);
  });

  it('triggers confirmation dialog when closing via backdrop click with unsaved changes', async () => {
    const setSelectedCardModalSpy = vi.fn();
    useKanbanStore.setState({ setSelectedCardModal: setSelectedCardModalSpy });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const { container } = render(<CardDetailModal />);

    const titleInput = screen.getByPlaceholderText('Card Title...');
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    });

    // Click backdrop overlay (container's first element)
    const backdrop = container.firstChild as HTMLElement;
    await act(async () => {
      fireEvent.click(backdrop);
    });

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to close without saving?');
    // Since confirm returned false, modal should stay open (setSelectedCardModal not called with null)
    expect(setSelectedCardModalSpy).not.toHaveBeenCalledWith(null);
  });

  it('triggers deleteCard confirmation when delete icon is clicked', () => {
    const deleteCardSpy = vi.fn();
    useKanbanStore.setState({ deleteCard: deleteCardSpy });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CardDetailModal />);

    const deleteBtn = screen.getByTitle('Delete Card');
    fireEvent.click(deleteBtn);

    expect(deleteCardSpy).toHaveBeenCalledWith('card_1');
  });
});
