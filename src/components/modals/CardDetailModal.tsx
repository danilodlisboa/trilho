'use client';

import { useState, useEffect } from 'react';
import { useKanbanStore, IChecklistItem, ICustomFieldValue, ICardData } from '@/store/useKanbanStore';
import {
  X,
  Trash2,
  Calendar,
  User,
  CheckSquare,
  Plus,
  AlignLeft,
  CheckCircle2,
  Circle,
  Tag,
  Save,
} from 'lucide-react';

export default function CardDetailModal() {
  const {
    selectedCardModal,
    setSelectedCardModal,
    updateCard,
    deleteCard,
    users,
    fetchUsers,
    activeBoard,
    customFields: boardCustomFields,
  } = useKanbanStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklist, setChecklist] = useState<IChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [cardCustomFields, setCardCustomFields] = useState<ICustomFieldValue[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedCardModal) {
      setTitle(selectedCardModal.title || '');
      setDescription(selectedCardModal.description || '');
      setPriority(selectedCardModal.priority || 'medium');

      if (selectedCardModal.dueDate) {
        const d = new Date(selectedCardModal.dueDate);
        const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDueDate(isoLocal);
      } else {
        setDueDate('');
      }

      const aId =
        typeof selectedCardModal.assigneeId === 'object' && selectedCardModal.assigneeId
          ? selectedCardModal.assigneeId._id
          : selectedCardModal.assigneeId || '';
      setAssigneeId(aId);

      const loadedChecklist = selectedCardModal.checklist || [];
      setChecklist(loadedChecklist);
      setHasChecklist(loadedChecklist.length > 0);
      setCardCustomFields(selectedCardModal.customFields || []);
    }
  }, [selectedCardModal]);

  // Derive initial state values for dirty checking
  const initialAssigneeId =
    typeof selectedCardModal?.assigneeId === 'object' && selectedCardModal?.assigneeId
      ? selectedCardModal.assigneeId._id
      : selectedCardModal?.assigneeId || '';

  let initialDueDate = '';
  if (selectedCardModal?.dueDate) {
    const d = new Date(selectedCardModal.dueDate);
    initialDueDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  const initialHasChecklist = Boolean(
    selectedCardModal?.checklist && selectedCardModal.checklist.length > 0
  );

  const isDirty = Boolean(
    selectedCardModal &&
      (title !== (selectedCardModal.title || '') ||
        description !== (selectedCardModal.description || '') ||
        priority !== (selectedCardModal.priority || 'medium') ||
        dueDate !== initialDueDate ||
        assigneeId !== initialAssigneeId ||
        hasChecklist !== initialHasChecklist ||
        JSON.stringify(hasChecklist ? checklist : []) !== JSON.stringify(selectedCardModal.checklist || []) ||
        JSON.stringify(cardCustomFields) !== JSON.stringify(selectedCardModal.customFields || []))
  );

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    setSelectedCardModal(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCardModal) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, selectedCardModal]);

  if (!selectedCardModal) return null;

  const handleSaveAndClose = async () => {
    if (!selectedCardModal) return;
    if (isDirty) {
      const updates: Partial<ICardData> = {
        title: title.trim(),
        description,
        priority,
        dueDate: dueDate ? dueDate : null,
        assigneeId: assigneeId || null,
        checklist: hasChecklist ? checklist : [],
        customFields: cardCustomFields,
      };
      await updateCard(selectedCardModal._id, updates);
    }
    setSelectedCardModal(null);
  };

  const handlePriorityChange = (newPriority: 'high' | 'medium' | 'low') => {
    setPriority(newPriority);
  };

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
  };

  const handleAssigneeChange = (newAssignee: string) => {
    setAssigneeId(newAssignee);
  };

  // Custom Fields Actions (Local State)
  const handleCustomFieldValueChange = (fieldId: string, val: string) => {
    const updated = cardCustomFields.map((cf) =>
      cf.fieldId === fieldId ? { ...cf, value: val } : cf
    );
    setCardCustomFields(updated);
  };

  const handleAttachCustomField = (fieldId: string) => {
    if (!fieldId) return;
    const def = boardCustomFields.find((f) => f._id === fieldId);
    if (!def) return;

    const initialVal = def.defaultValue || (def.fieldType === 'select' ? def.options[0] || '' : '');
    const updated = [...cardCustomFields, { fieldId, value: initialVal }];
    setCardCustomFields(updated);
  };

  const handleDetachCustomField = (fieldId: string) => {
    const updated = cardCustomFields.filter((cf) => cf.fieldId !== fieldId);
    setCardCustomFields(updated);
  };

  // Checklist Actions (Local State)
  const handleAttachChecklist = () => {
    setHasChecklist(true);
  };

  const handleDetachChecklist = () => {
    setHasChecklist(false);
    setChecklist([]);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistText.trim()) {
      const newItem: IChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistText.trim(),
        completed: false,
      };
      const updated = [...checklist, newItem];
      setChecklist(updated);
      setNewChecklistText('');
    }
  };

  const handleToggleChecklist = (itemId: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    const updated = checklist.filter((item) => item.id !== itemId);
    setChecklist(updated);
  };

  const handleDeleteCard = () => {
    if (confirm(`Are you sure you want to delete the card "${title}"?`)) {
      deleteCard(selectedCardModal._id);
    }
  };

  // Progress percentage calculation
  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Unattached board custom fields
  const unattachedCustomFields = boardCustomFields.filter(
    (bcf) => !cardCustomFields.some((ccf) => ccf.fieldId === bcf._id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] glass-panel relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-black text-white outline-none border-b border-transparent focus:border-blue-500 pb-1 transition"
              placeholder="Card Title..."
            />
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full animate-pulse">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleDeleteCard}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Delete Card"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
              title="Save & Close"
            >
              <Save className="w-4 h-4" />
              <span>Save & Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Controls Row: Priority, Due Date, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {/* Priority Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <div className="flex items-center gap-1">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border capitalize transition ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : p === 'medium'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Datetime Due Date Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Due Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Assignee</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {(activeBoard?.members || users).map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-blue-400" />
              <span>Description</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition leading-relaxed resize-y"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" />
                <span>Custom Fields</span>
              </label>
              {unattachedCustomFields.length > 0 && (
                <div className="flex items-center gap-1">
                  <select
                    onChange={(e) => {
                      handleAttachCustomField(e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-800 text-[11px] text-blue-400 font-semibold rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      + Attach Field...
                    </option>
                    {unattachedCustomFields.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.fieldType})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {cardCustomFields.length === 0 ? (
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                No custom fields attached to this card.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                {cardCustomFields.map((cf) => {
                  const def = boardCustomFields.find((bcf) => bcf._id === cf.fieldId);
                  if (!def) return null;

                  return (
                    <div key={cf.fieldId} className="space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {def.name}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDetachCustomField(cf.fieldId)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
                          title="Detach Field"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {def.fieldType === 'select' ? (
                        <select
                          value={cf.value}
                          onChange={(e) => handleCustomFieldValueChange(cf.fieldId, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {def.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={def.fieldType === 'number' ? 'number' : def.fieldType === 'date' ? 'date' : 'text'}
                          value={cf.value}
                          onChange={(e) => handleCustomFieldValueChange(cf.fieldId, e.target.value)}
                          placeholder={`Enter ${def.name.toLowerCase()}...`}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sub-tasks Checklist Section */}
          {!hasChecklist ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAttachChecklist}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-950/60 text-slate-400 hover:text-blue-400 transition text-xs font-semibold group"
              >
                <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <span>Add Sub-tasks Checklist</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <span>Sub-tasks Checklist</span>
                </label>
                <div className="flex items-center gap-2">
                  {totalItems > 0 && (
                    <span className="text-xs font-semibold text-slate-400">
                      {completedItems}/{totalItems} completed ({progressPercent}%)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDetachChecklist}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                    title="Detach Checklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {totalItems > 0 && (
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Checklist Items List */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 group hover:border-slate-700 transition"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(item.id)}
                      className="flex items-center gap-2.5 text-xs text-slate-200 text-left flex-1"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {item.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Checklist Item Form */}
              <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add sub-task..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
