'use client';

import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { IColumnData, ICardData, useKanbanStore } from '@/store/useKanbanStore';
import KanbanCard from './KanbanCard';
import { Plus, MoreVertical, Trash2, Edit3, Check, X, GripHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  column: IColumnData;
  cards: ICardData[];
  index: number;
}

export default function KanbanColumn({ column, cards, index }: KanbanColumnProps) {
  const { renameColumn, deleteColumn, createCard } = useKanbanStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim() && titleInput !== column.title) {
      renameColumn(column._id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      createCard(column._id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-60 shrink-0 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col max-h-[calc(100vh-7.5rem)] shadow-xl ${
            snapshot.isDragging ? 'ring-2 ring-blue-500/50 shadow-2xl opacity-90' : ''
          }`}
        >
          {/* Column Header (Drag Handle) */}
          <div
            {...provided.dragHandleProps}
            className="p-3.5 border-b border-slate-800/60 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0 opacity-60 hover:opacity-100" />
              {isEditingTitle ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                    autoFocus
                    className="w-full bg-slate-800 text-white font-bold text-sm px-2 py-1 rounded border border-blue-500 outline-none"
                  />
                  <button onClick={handleTitleSubmit} className="p-1 text-emerald-400 hover:bg-slate-800 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h3
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="font-bold text-sm text-slate-100 truncate cursor-pointer hover:text-blue-400 transition"
                  title="Click to rename column"
                >
                  {column.title}
                </h3>
              )}

              {/* Card Counter Badge */}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                {cards.length}
              </span>
            </div>

            {/* Column Menu / Actions */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1 z-30 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditingTitle(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Rename Column</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm(`Delete column "${column.title}" and all its cards?`)) {
                        deleteColumn(column._id);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Column</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards List Droppable Container */}
          <Droppable droppableId={column._id} type="CARD">
            {(providedDroppable, snapshotDroppable) => (
              <div
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
                className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] transition-colors ${
                  snapshotDroppable.isDraggingOver ? 'bg-blue-950/20 border-2 border-dashed border-blue-500/40 rounded-xl' : ''
                }`}
              >
                {cards.map((card, idx) => (
                  <KanbanCard key={card._id} card={card} index={idx} />
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>

          {/* Column Footer: Add Card Trigger */}
          <div className="p-3 border-t border-slate-800/60">
            {isAddingCard ? (
              <form onSubmit={handleCreateCardSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Card title..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-blue-500/80 text-white text-xs rounded-xl p-2.5 outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-lg transition"
                  >
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-850/60 transition text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Add Card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
