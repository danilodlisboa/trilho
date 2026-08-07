'use client';

import { useState } from 'react';
import { useKanbanStore } from '@/store/useKanbanStore';
import { X, Plus, Trash2, Tag, Check, Star } from 'lucide-react';

export default function DefaultFieldsModal() {
  const {
    activeBoard,
    customFields,
    isDefaultFieldsModalOpen,
    setIsDefaultFieldsModalOpen,
    createCustomField,
    deleteCustomField,
    toggleDefaultCustomField,
  } = useKanbanStore();

  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'date'>('text');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isDefault, setIsDefault] = useState(true);
  const [defaultValue, setDefaultValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isDefaultFieldsModalOpen || !activeBoard) return null;

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    const cleanedOptions = fieldType === 'select' ? options.map((o) => o.trim()).filter(Boolean) : [];
    await createCustomField(
      activeBoard._id,
      name.trim(),
      fieldType,
      cleanedOptions,
      isDefault,
      defaultValue.trim()
    );

    setName('');
    setFieldType('text');
    setOptions(['', '']);
    setIsDefault(true);
    setDefaultValue('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] glass-panel">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Board Custom Fields</h2>
              <p className="text-xs text-slate-400">Manage fields & default auto-attachment for {activeBoard.title}</p>
            </div>
          </div>
          <button
            onClick={() => setIsDefaultFieldsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Custom Fields List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Defined Custom Fields</h3>
            {customFields.length === 0 ? (
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                No custom fields defined for this board yet. Create one below!
              </div>
            ) : (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div
                    key={field._id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{field.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                          {field.fieldType}
                        </span>
                        {field.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                      {field.defaultValue && (
                        <p className="text-[11px] text-slate-400 mt-1">Default Value: "{field.defaultValue}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleDefaultCustomField(activeBoard._id, field._id, !field.isDefault, field.defaultValue)
                        }
                        className={`p-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1 ${
                          field.isDefault
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={field.isDefault ? 'Remove Default Status' : 'Set as Default Auto-Attach'}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomField(activeBoard._id, field._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                        title="Delete Custom Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to Add New Field */}
          <form onSubmit={handleCreateField} className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Create New Custom Field</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Environment, Story Points"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Field Type
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="select">Dropdown Select</option>
                  <option value="date">Date Picker</option>
                </select>
              </div>
            </div>

            {/* Select Options Manager */}
            {fieldType === 'select' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dropdown Options
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 1}
                      className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Dropdown Option</span>
                </button>
              </div>
            )}

            {/* Default Auto-Attach Settings */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Set as Default (Automatically attach to newly created cards)
                </span>
              </label>

              {isDefault && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Initial Default Value
                  </label>
                  <input
                    type="text"
                    placeholder="Initial default value for new cards..."
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Save Custom Field</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
