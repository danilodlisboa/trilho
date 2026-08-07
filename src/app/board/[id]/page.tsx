'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CardDetailModal from '@/components/modals/CardDetailModal';
import CreateBoardModal from '@/components/modals/CreateBoardModal';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Loader2 } from 'lucide-react';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { status } = useSession();
  const { fetchBoards, fetchBoardDetails, fetchUsers } = useKanbanStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchBoards();
      fetchUsers();
      if (id) {
        fetchBoardDetails(id);
      }
    }
  }, [id, status, fetchBoards, fetchBoardDetails, fetchUsers, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 relative">
          <KanbanBoard />
        </main>
      </div>

      <CardDetailModal />
      <CreateBoardModal />
    </div>
  );
}
