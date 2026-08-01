'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Loader2, Kanban, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { boards, fetchBoards, activeBoard, setIsCreateBoardModalOpen } = useKanbanStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (boards.length > 0) {
      const targetId = activeBoard ? activeBoard._id : boards[0]._id;
      router.replace(`/board/${targetId}`);
    }
  }, [boards, activeBoard, router]);

  if (boards.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Loading project workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-fade-in flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20 mb-4">
          <Kanban className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-2">Welcome to Trilho!</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          You don't have any Kanban boards yet. Create your first board or generate demo seed data to get started.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Board</span>
          </button>

          <Link
            href="/login"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition border border-slate-700 block"
          >
            <span>Go to Login / Seed Demo Data</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
