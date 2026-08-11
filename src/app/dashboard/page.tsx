'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Loader2, Kanban, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import CreateBoardModal from '@/components/modals/CreateBoardModal';

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession();
  const { boards, isLoadingBoards, fetchError, fetchBoards, activeBoard, setIsCreateBoardModalOpen } = useKanbanStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'unauthenticated') {
      timer = setTimeout(() => {
        router.replace('/login');
      }, 500);
    } else if (status === 'authenticated') {
      fetchBoards();
    }
    return () => clearTimeout(timer);
  }, [status, fetchBoards, router]);

  useEffect(() => {
    if (status === 'authenticated' && !isLoadingBoards && !fetchError && boards.length > 0) {
      const targetId = activeBoard ? activeBoard._id : boards[0]._id;
      router.replace(`/board/${targetId}`);
    }
  }, [status, isLoadingBoards, fetchError, boards, activeBoard, router]);

  // Unauthenticated -> redirecting to login
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Redirecting to login...</p>
      </div>
    );
  }

  // Session or boards loading
  if (status === 'loading' || isLoadingBoards) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Loading project workspace...</p>
      </div>
    );
  }

  // Connection or API error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Workspace Connection Issue</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{fetchError}</p>
          <button
            onClick={() => fetchBoards()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Redirecting to existing board
  if (boards.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Opening workspace board...</p>
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
          You don't have any Kanban boards yet. Create your first board to get started.
        </p>

        <div className="w-full">
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Board</span>
          </button>
        </div>
      </div>

      {/* Modal for creating a board */}
      <CreateBoardModal />
    </div>
  );
}
