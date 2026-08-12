'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKanbanStore } from '@/store/useKanbanStore';
import { X, Layout, Plus, Loader2 } from 'lucide-react';

export default function CreateBoardModal() {
  const router = useRouter();
  const { isCreateBoardModalOpen, setIsCreateBoardModalOpen, createBoard, saveStatus } = useKanbanStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreateBoardModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const newBoard = await createBoard(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      if (newBoard?._id) {
        router.push(`/board/${newBoard._id}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative glass-panel">
        <button
          onClick={() => setIsCreateBoardModalOpen(false)}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Board</h3>
            <p className="text-xs text-slate-400">Set up a new project space with default columns</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Board Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="ex: Trilho Mobile App, Q3 Launch..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Describe the main goal of this project board..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateBoardModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Board</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
