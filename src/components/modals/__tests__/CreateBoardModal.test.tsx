import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CreateBoardModal from '../CreateBoardModal';
import { useKanbanStore } from '@/store/useKanbanStore';

describe('CreateBoardModal Unit Tests', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      isCreateBoardModalOpen: true,
      saveStatus: 'idle',
    });
    vi.restoreAllMocks();
  });

  it('renders modal content when open', () => {
    render(<CreateBoardModal />);

    expect(screen.getByText('Create New Board')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Trilho Mobile App/i)).toBeInTheDocument();
  });

  it('does not render modal content when closed', () => {
    useKanbanStore.setState({ isCreateBoardModalOpen: false });
    const { container } = render(<CreateBoardModal />);

    expect(container.firstChild).toBeNull();
  });

  it('submits form with board title and description', async () => {
    const createBoardSpy = vi.fn().mockResolvedValue(undefined);
    useKanbanStore.setState({ createBoard: createBoardSpy });

    render(<CreateBoardModal />);

    const titleInput = screen.getByPlaceholderText(/Trilho Mobile App/i);
    const descInput = screen.getByPlaceholderText(/Describe the main goal/i);
    const submitButton = screen.getByRole('button', { name: /Create Board/i });

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Sprint 2026' } });
      fireEvent.change(descInput, { target: { value: 'Next-gen features development' } });
      fireEvent.click(submitButton);
    });

    expect(createBoardSpy).toHaveBeenCalledWith('Sprint 2026', 'Next-gen features development');
  });

  it('closes modal when Cancel button is clicked', () => {
    render(<CreateBoardModal />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(useKanbanStore.getState().isCreateBoardModalOpen).toBe(false);
  });
});
