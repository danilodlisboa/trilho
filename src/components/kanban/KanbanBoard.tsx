'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useKanbanStore } from '@/store/useKanbanStore';
import KanbanColumn from './KanbanColumn';
import DefaultFieldsModal from '../modals/DefaultFieldsModal';
import { Plus, X, Layers, Tag } from 'lucide-react';

export default function KanbanBoard() {
  const {
    activeBoard,
    columns,
    cards,
    moveCardOptimistic,
    moveColumnOptimistic,
    createColumn,
    searchQuery,
    selectedPriority,
    selectedAssignee,
    setIsDefaultFieldsModalOpen,
  } = useKanbanStore();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'COLUMN') {
      if (activeBoard) {
        moveColumnOptimistic(activeBoard._id, source.index, destination.index);
      }
      return;
    }

    moveCardOptimistic(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleCreateColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColTitle.trim()) {
      createColumn(newColTitle.trim());
      setNewColTitle('');
      setIsAddingColumn(false);
    }
  };

  // Filter cards based on Search Query, Priority, and Assignee
  const getFilteredCardsForColumn = (columnId: string) => {
    return cards
      .filter((card) => {
        if (card.columnId !== columnId) return false;

        // Filter by search query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchesTitle = card.title.toLowerCase().includes(query);
          const matchesDesc = card.description ? card.description.toLowerCase().includes(query) : false;
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Filter by priority
        if (selectedPriority !== 'all' && card.priority !== selectedPriority) {
          return false;
        }

        // Filter by assignee
        if (selectedAssignee !== 'all') {
          const assigneeIdStr =
            typeof card.assigneeId === 'object' && card.assigneeId ? card.assigneeId._id : card.assigneeId;
          if (assigneeIdStr !== selectedAssignee) return false;
        }

        return true;
      })
      .sort((a, b) => a.order - b.order);
  };

  if (!activeBoard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-200 mb-2">No board selected</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Select a board in the sidebar or create a new project to get started.
        </p>
      </div>
    );
  }

  // Sort columns by order
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-5 items-start min-h-[calc(100vh-12rem)] pb-4">
            <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-5 items-start"
                >
                  {sortedColumns.map((col, index) => {
                    const colCards = getFilteredCardsForColumn(col._id);
                    return <KanbanColumn key={col._id} column={col} cards={colCards} index={index} />;
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add New Column Box */}
            <div className="w-60 shrink-0">
              {isAddingColumn ? (
                <form
                  onSubmit={handleCreateColumnSubmit}
                  className="bg-slate-900 border border-blue-500/80 rounded-2xl p-4 space-y-3 shadow-xl"
                >
                  <h4 className="font-bold text-sm text-slate-200">New Column</h4>
                  <input
                    type="text"
                    placeholder="Column name (ex: Testing, Deploy)..."
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
                    >
                      Save Column
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-14 bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 text-slate-400 hover:text-blue-400 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition" />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      <DefaultFieldsModal />
    </>
  );
}
