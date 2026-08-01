'use client';

import { use, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CardDetailModal from '@/components/modals/CardDetailModal';
import CreateBoardModal from '@/components/modals/CreateBoardModal';
import { useKanbanStore } from '@/store/useKanbanStore';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fetchBoards, fetchBoardDetails, fetchUsers } = useKanbanStore();

  useEffect(() => {
    fetchBoards();
    fetchUsers();
    if (id) {
      fetchBoardDetails(id);
    }
  }, [id, fetchBoards, fetchBoardDetails, fetchUsers]);

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
