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

  beforeEach(() => {
    useKanbanStore.setState({
      selectedCardModal: mockCard,
      users: [{ _id: 'user_1', name: 'Alice', email: 'alice@example.com' }],
      fetchUsers: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  it('renders modal with card details and checklist progress', () => {
    render(<CardDetailModal />);

    expect(screen.getByDisplayValue('Implement Authentication')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Use NextAuth v5')).toBeInTheDocument();
    expect(screen.getByText('1/2 completed (50%)')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
  });

  it('adds a new subtask to the checklist', async () => {
    const updateCardSpy = vi.fn();
    useKanbanStore.setState({ updateCard: updateCardSpy });

    render(<CardDetailModal />);

    const input = screen.getByPlaceholderText('Add sub-task...');
    const addButton = screen.getByRole('button', { name: /Add/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Subtask 3' } });
      fireEvent.click(addButton);
    });

    expect(updateCardSpy).toHaveBeenCalledWith('card_1', expect.objectContaining({
      checklist: expect.arrayContaining([
        expect.objectContaining({ text: 'Subtask 3', completed: false }),
      ]),
    }));
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
