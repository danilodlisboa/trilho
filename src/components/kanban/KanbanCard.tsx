'use client';

import { Draggable } from '@hello-pangea/dnd';
import { ICardData, useKanbanStore } from '@/store/useKanbanStore';
import { Calendar, CheckSquare, Clock } from 'lucide-react';

interface KanbanCardProps {
  card: ICardData;
  index: number;
}

export default function KanbanCard({ card, index }: KanbanCardProps) {
  const { setSelectedCardModal } = useKanbanStore();

  // Determine if due date is overdue
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;

  // Priority Badge Map
  const priorityBadgeMap = {
    high: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      label: 'High',
      dot: 'bg-rose-500',
    },
    medium: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      label: 'Medium',
      dot: 'bg-amber-500',
    },
    low: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      label: 'Low',
      dot: 'bg-emerald-500',
    },
  };

  const priorityStyle = priorityBadgeMap[card.priority] || priorityBadgeMap.medium;

  // Checklist counts
  const totalChecklist = card.checklist ? card.checklist.length : 0;
  const completedChecklist = card.checklist ? card.checklist.filter((item) => item.completed).length : 0;

  // Format due date string in en-US with time if available
  const formattedDueDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // Custom fields state from store
  const { customFields: boardCustomFields } = useKanbanStore();

  // Assignee helper
  const assignee = typeof card.assigneeId === 'object' && card.assigneeId ? card.assigneeId : null;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedCardModal(card)}
          className={`p-3.5 rounded-xl border bg-slate-900/90 hover:border-blue-500/50 cursor-pointer transition-all duration-150 group shadow-md ${
            snapshot.isDragging
              ? 'border-blue-500 shadow-2xl bg-slate-850 z-50 ring-2 ring-blue-500/30'
              : 'border-slate-800/80 hover:bg-slate-850/90'
          }`}
        >
          {/* Top Row: Priority Badge & Custom Field Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${priorityStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {priorityStyle.label}
            </span>

            {/* Custom Field Badges */}
            {card.customFields &&
              card.customFields.map((cf) => {
                const def = boardCustomFields.find((bcf) => bcf._id === cf.fieldId);
                if (!def || !cf.value) return null;
                return (
                  <span
                    key={cf.fieldId}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 max-w-[120px] truncate"
                    title={`${def.name}: ${cf.value}`}
                  >
                    {def.name}: {cf.value}
                  </span>
                );
              })}
          </div>

          {/* Card Title */}
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition leading-snug mb-1.5">
            {card.title}
          </h4>

          {/* Short Description snippet */}
          {card.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {card.description}
            </p>
          )}

          {/* Bottom Row: Metadata Badges (Due Date, Checklist progress, Assignee) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2.5">
              {/* Due Date Indicator */}
              {formattedDueDate && (
                <div
                  className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50 font-bold'
                      : 'text-slate-400'
                  }`}
                  title={isOverdue ? 'Overdue!' : 'Due Date'}
                >
                  {isOverdue ? <Clock className="w-3 h-3 text-rose-400 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                  <span>{formattedDueDate}</span>
                </div>
              )}

              {/* Checklist Progress Badge */}
              {totalChecklist > 0 && (
                <div
                  className={`flex items-center gap-1 font-medium ${
                    completedChecklist === totalChecklist ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                  title="Checklist Progress"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>
                    {completedChecklist}/{totalChecklist}
                  </span>
                </div>
              )}
            </div>

            {/* Assignee Avatar */}
            {assignee && (
              <div className="shrink-0">
                {assignee.avatarUrl ? (
                  <img
                    src={assignee.avatarUrl}
                    alt={assignee.name}
                    className="w-5 h-5 rounded-full border border-slate-700 object-cover"
                    title={`Assigned to ${assignee.name}`}
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center border border-slate-700"
                    title={`Assigned to ${assignee.name}`}
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
