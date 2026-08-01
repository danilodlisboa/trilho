import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KanbanCard from '../KanbanCard';
import { ICardData, useKanbanStore } from '@/store/useKanbanStore';

// Mock @hello-pangea/dnd Draggable
vi.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }: { children: Function }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

describe('KanbanCard Component Unit Tests', () => {
  const mockCard: ICardData = {
    _id: 'card_100',
    boardId: 'board_1',
    columnId: 'col_1',
    title: 'Implement Unit Testing',
    description: 'Add Vitest tests for components and stores.',
    priority: 'high',
    dueDate: '2030-12-31',
    assigneeId: { _id: 'user_1', name: 'John Doe', email: 'john@example.com' },
    checklist: [
      { id: 'chk_1', text: 'Write store test', completed: true },
      { id: 'chk_2', text: 'Write card test', completed: false },
    ],
    order: 0,
  };

  it('renders card title, priority badge, and checklist count correctly', () => {
    render(<KanbanCard card={mockCard} index={0} />);

    expect(screen.getByText('Implement Unit Testing')).toBeInTheDocument();
    expect(screen.getByText('Add Vitest tests for components and stores.')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders assignee initial when avatar is not provided', () => {
    render(<KanbanCard card={mockCard} index={0} />);
    expect(screen.getByTitle('Assigned to John Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('triggers setSelectedCardModal in Zustand store when clicked', () => {
    render(<KanbanCard card={mockCard} index={0} />);

    const cardElement = screen.getByText('Implement Unit Testing').closest('div');
    if (cardElement) {
      fireEvent.click(cardElement);
    }

    expect(useKanbanStore.getState().selectedCardModal).toEqual(mockCard);
  });
});
