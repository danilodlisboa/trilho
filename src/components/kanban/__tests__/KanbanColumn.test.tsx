import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import KanbanColumn from '../KanbanColumn';
import { useKanbanStore, IColumnData } from '@/store/useKanbanStore';

// Mock @hello-pangea/dnd Droppable and Draggable
vi.mock('@hello-pangea/dnd', () => ({
  Droppable: ({ children }: { children: Function }) =>
    children(
      {
        innerRef: vi.fn(),
        droppableProps: {},
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
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

describe('KanbanColumn Component Unit Tests', () => {
  const mockColumn: IColumnData = {
    _id: 'col_1',
    boardId: 'b1',
    title: 'In Progress',
    order: 0,
  };

  beforeEach(() => {
    useKanbanStore.setState({
      renameColumn: vi.fn(),
      deleteColumn: vi.fn(),
      createCard: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  it('renders column title and card counter', () => {
    render(<KanbanColumn column={mockColumn} cards={[]} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('allows renaming column title on click and enter key', async () => {
    const renameColumnSpy = vi.fn();
    useKanbanStore.setState({ renameColumn: renameColumnSpy });

    render(<KanbanColumn column={mockColumn} cards={[]} />);

    const titleElement = screen.getByText('In Progress');
    fireEvent.click(titleElement);

    const input = screen.getByDisplayValue('In Progress');
    fireEvent.change(input, { target: { value: 'Review' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(renameColumnSpy).toHaveBeenCalledWith('col_1', 'Review');
  });

  it('opens add card input and submits new card title', async () => {
    const createCardSpy = vi.fn();
    useKanbanStore.setState({ createCard: createCardSpy });

    render(<KanbanColumn column={mockColumn} cards={[]} />);

    const addCardBtn = screen.getByText('Add Card');
    fireEvent.click(addCardBtn);

    const cardInput = screen.getByPlaceholderText('Card title...');
    fireEvent.change(cardInput, { target: { value: 'New Test Card' } });

    const submitBtn = screen.getByRole('button', { name: 'Add Card' });
    fireEvent.click(submitBtn);

    expect(createCardSpy).toHaveBeenCalledWith('col_1', 'New Test Card');
  });
});
