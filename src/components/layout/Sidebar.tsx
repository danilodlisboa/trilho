'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useKanbanStore } from '@/store/useKanbanStore';
import {
  Layout,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  Kanban,
  Mail,
  Check,
  X,
  UserPlus,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const {
    boards,
    pendingInvitations,
    activeBoard,
    fetchBoardDetails,
    fetchPendingInvitations,
    deleteBoard,
    setIsCreateBoardModalOpen,
    acceptInvitation,
    declineInvitation,
    inviteMember,
    removeMemberOrInvite,
  } = useKanbanStore();

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const handleSelectBoard = (boardId: string) => {
    fetchBoardDetails(boardId);
    router.push(`/board/${boardId}`);
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the board "${title}"?`)) {
      deleteBoard(boardId);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    if (!activeBoard || !inviteEmail.trim()) return;

    const res = await inviteMember(activeBoard._id, inviteEmail.trim());
    if (res.ok) {
      setInviteEmail('');
      setIsInviting(false);
    } else {
      setInviteError(res.error || 'Failed to send invitation');
    }
  };

  const isOwnerActive = activeBoard && session?.user
    ? (typeof activeBoard.ownerId === 'string'
        ? activeBoard.ownerId === session.user.id
        : (activeBoard.ownerId as any)?._id === session.user.id) ||
      (activeBoard.members && activeBoard.members.some((m) => m.email === session.user.email && (activeBoard.ownerId === m._id || (activeBoard.ownerId as any)?._id === m._id)))
    : false;

  return (
    <aside
      className={`bg-slate-900/95 border-r border-slate-800 flex flex-col transition-all duration-300 relative z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-700 transition"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                Trilho <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">NoSQL</span>
              </h1>
              <p className="text-[11px] text-slate-400">Kanban & Workflows</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black">
            T
          </div>
        )}
      </div>

      {/* Main Boards Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                My Boards ({boards.length})
              </span>
              <button
                onClick={() => setIsCreateBoardModalOpen(true)}
                className="p-1 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded transition"
                title="Create New Board"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Boards List */}
          <div className="space-y-1">
            {boards.map((b) => {
              const isActive = activeBoard?._id === b._id;
              const isOwner = session?.user
                ? (typeof b.ownerId === 'string'
                    ? b.ownerId === session.user.id
                    : (b.ownerId as any)?._id === session.user.id) ||
                  (b.members && b.members.some((m) => m.email === session.user.email && (b.ownerId === m._id || (b.ownerId as any)?._id === m._id)))
                : false;

              return (
                <div key={b._id} className="group relative flex items-center">
                  <button
                    onClick={() => handleSelectBoard(b._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Layout className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate flex-1">{b.title}</span>}
                  </button>

                  {!isCollapsed && isOwner && (
                    <button
                      onClick={(e) => handleDeleteBoard(e, b._id, b.title)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                      title="Delete Board"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {boards.length === 0 && !isCollapsed && (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <p className="text-xs text-slate-400 mb-2">No boards found</p>
              <button
                onClick={() => setIsCreateBoardModalOpen(true)}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                Create your first board
              </button>
            </div>
          )}
        </div>

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && !isCollapsed && (
          <div className="border-t border-slate-800/60 pt-4">
            <div className="flex items-center gap-1.5 px-2 mb-2 text-amber-400">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Pending Invites ({pendingInvitations.length})
              </span>
            </div>
            <div className="space-y-2 px-2">
              {pendingInvitations.map((invBoard) => (
                <div
                  key={invBoard._id}
                  className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 flex flex-col gap-2"
                >
                  <span className="text-xs font-semibold text-amber-200 truncate">{invBoard.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptInvitation(invBoard._id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <Check className="w-3 h-3" /> Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(invBoard._id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Members Section */}
        {activeBoard && activeBoard.members && !isCollapsed && (
          <div className="border-t border-slate-800/60 pt-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  Members ({activeBoard.members.length})
                </span>
              </div>
              {isOwnerActive && (
                <button
                  onClick={() => setIsInviting(!isInviting)}
                  className="p-1 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded transition"
                  title="Invite Member"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Invite Form for Owner */}
            {isInviting && isOwnerActive && (
              <form onSubmit={handleSendInvite} className="px-2 mb-3 space-y-2">
                <input
                  type="email"
                  placeholder="User email..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2 outline-none focus:border-indigo-500"
                />
                {inviteError && <p className="text-[11px] text-rose-400">{inviteError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 rounded-xl transition"
                  >
                    Send Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviting(false);
                      setInviteError('');
                    }}
                    className="p-1 text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-1.5 px-2">
              {activeBoard.members.map((member) => {
                const memberId = member._id || member;
                const isMemberOwner = typeof activeBoard.ownerId === 'string'
                  ? activeBoard.ownerId === memberId
                  : (activeBoard.ownerId as any)?._id === memberId;

                return (
                  <div key={memberId} className="group flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 truncate">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <span className="text-xs text-slate-300 truncate">{member.name || member.email}</span>
                      {isMemberOwner && (
                        <span className="text-[9px] px-1 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                          Owner
                        </span>
                      )}
                    </div>

                    {isOwnerActive && !isMemberOwner && (
                      <button
                        onClick={() => removeMemberOrInvite(activeBoard._id, memberId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Remove Member"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Pending Invitations list on active board */}
              {activeBoard.invitations &&
                activeBoard.invitations.filter((i) => i.status === 'pending').map((inv) => (
                  <div key={inv.id} className="group flex items-center justify-between py-1 text-amber-300/80">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="text-xs truncate">{inv.email}</span>
                      <span className="text-[9px] px-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                        Pending
                      </span>
                    </div>

                    {isOwnerActive && (
                      <button
                        onClick={() => removeMemberOrInvite(activeBoard._id, inv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Cancel Invitation"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Create Board Button */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Board</span>
          </button>
        </div>
      )}
    </aside>
  );
}

