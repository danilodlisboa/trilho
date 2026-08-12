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
  Mail,
  Check,
  X,
  UserPlus,
  Tag,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const {
    boards,
    pendingInvitations,
    activeBoard,
    customFields,
    isSidebarContracted,
    setIsSidebarContracted,
    toggleSidebarContracted,
    fetchBoardDetails,
    fetchPendingInvitations,
    deleteBoard,
    setIsCreateBoardModalOpen,
    setIsDefaultFieldsModalOpen,
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
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarContracted(true);
    }
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

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const isOwnerActive = activeBoard && userId
    ? (typeof activeBoard.ownerId === 'string'
        ? activeBoard.ownerId === userId
        : (activeBoard.ownerId as any)?._id === userId) ||
      (activeBoard.members && activeBoard.members.some((m) => m.email === userEmail && (activeBoard.ownerId === m._id || (activeBoard.ownerId as any)?._id === m._id)))
    : false;

  return (
    <>
      {/* Mobile Off-canvas Backdrop Overlay */}
      {!isSidebarContracted && (
        <div
          onClick={() => setIsSidebarContracted(true)}
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 animate-fade-in cursor-pointer"
        />
      )}

      <aside
        className={`bg-slate-900/95 border-r border-slate-800 flex flex-col transition-all duration-300 fixed md:relative inset-y-0 left-0 z-40 ${
          isSidebarContracted
            ? '-translate-x-full md:translate-x-0 md:w-16'
            : 'translate-x-0 w-64 shadow-2xl md:shadow-none'
        }`}
      >
        {/* Collapse Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebarContracted}
          className="hidden md:flex absolute -right-3 top-5 w-6 h-6 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full items-center justify-center shadow-md hover:bg-slate-700 transition"
          title={isSidebarContracted ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarContracted ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          {!isSidebarContracted ? (
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="Trilho Logo"
                className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 object-cover"
              />
              <div>
                <h1 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  Trilho
                </h1>
                <p className="text-[11px] text-slate-400">Kanban & Workflows</p>
              </div>
            </div>
          ) : (
            <img
              src="/icon.png"
              alt="Trilho Logo"
              className="mx-auto w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 object-cover"
            />
          )}
        </div>

        {/* Main Boards Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {!isSidebarContracted && (
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
                const isOwner = userId
                  ? (typeof b.ownerId === 'string'
                      ? b.ownerId === userId
                      : (b.ownerId as any)?._id === userId) ||
                    (b.members && b.members.some((m) => m.email === userEmail && (b.ownerId === m._id || (b.ownerId as any)?._id === m._id)))
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
                      {!isSidebarContracted && <span className="truncate flex-1">{b.title}</span>}
                    </button>

                    {!isSidebarContracted && isOwner && (
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

            {boards.length === 0 && !isSidebarContracted && (
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

          {/* Board Custom Fields Section */}
          {activeBoard && !isSidebarContracted && (
            <div className="border-t border-slate-800/60 pt-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold tracking-wider uppercase">
                    Board Fields ({customFields.length})
                  </span>
                </div>
                <button
                  onClick={() => setIsDefaultFieldsModalOpen(true)}
                  className="p-1 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded transition"
                  title="Manage Custom Fields"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* List First 5 Custom Fields */}
              <div className="space-y-1.5 px-2">
                {customFields.slice(0, 5).map((field) => (
                  <div
                    key={field._id}
                    className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-slate-200 truncate">{field.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                        {field.fieldType}
                      </span>
                    </div>
                    {field.isDefault && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                ))}

                {customFields.length > 5 && (
                  <button
                    onClick={() => setIsDefaultFieldsModalOpen(true)}
                    className="w-full text-left text-[11px] text-blue-400 font-semibold hover:underline pt-0.5 px-1"
                  >
                    + {customFields.length - 5} more fields...
                  </button>
                )}

                {customFields.length === 0 && (
                  <p className="text-[11px] text-slate-500 px-1 py-1">No custom fields defined.</p>
                )}

                <button
                  type="button"
                  onClick={() => setIsDefaultFieldsModalOpen(true)}
                  className="w-full mt-2 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Manage Board Fields</span>
                </button>
              </div>
            </div>
          )}

          {/* Pending Invitations Section */}
          {pendingInvitations.length > 0 && !isSidebarContracted && (
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
          {activeBoard && activeBoard.members && !isSidebarContracted && (
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
                  const memberId = typeof member === 'string' ? member : member._id;
                  const isMemberOwner = typeof activeBoard.ownerId === 'string'
                    ? activeBoard.ownerId === memberId
                    : (activeBoard.ownerId as any)?._id === memberId;

                  const avatarUrl = typeof member === 'string' ? undefined : member.avatarUrl;
                  const memberName = typeof member === 'string' ? undefined : member.name;
                  const memberEmail = typeof member === 'string' ? member : member.email;

                  return (
                    <div key={memberId} className="group flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5 truncate">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={memberName || memberEmail}
                            className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {memberName ? memberName.charAt(0).toUpperCase() : 'M'}
                          </div>
                        )}
                        <span className="text-xs text-slate-300 truncate">{memberName || memberEmail}</span>
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
        {!isSidebarContracted && (
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
    </>
  );
}
