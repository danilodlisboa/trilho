'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useKanbanStore } from '@/store/useKanbanStore';
import {
  Search,
  Filter,
  Plus,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Kanban,
  Edit2,
  Check,
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const {
    activeBoard,
    updateBoardTitle,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedAssignee,
    setSelectedAssignee,
    users,
    saveStatus,
    saveStatusMessage,
  } = useKanbanStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitleInput, setBoardTitleInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (activeBoard) {
      setBoardTitleInput(activeBoard.title);
    }
  }, [activeBoard]);

  const handleTitleSubmit = () => {
    if (activeBoard && boardTitleInput.trim() && boardTitleInput !== activeBoard.title) {
      updateBoardTitle(activeBoard._id, boardTitleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const isOwner = activeBoard && userId
    ? (typeof activeBoard.ownerId === 'string'
        ? activeBoard.ownerId === userId
        : (activeBoard.ownerId as any)?._id === userId) ||
      (activeBoard.members && activeBoard.members.some((m) => m.email === userEmail && (activeBoard.ownerId === m._id || (activeBoard.ownerId as any)?._id === m._id)))
    : false;

  const boardMembers = activeBoard?.members || users;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Active Board Title Inline Edit */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-blue-500 font-bold text-lg">
          <Kanban className="w-6 h-6" />
        </div>
        {activeBoard ? (
          isOwner && isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={boardTitleInput}
                onChange={(e) => setBoardTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="bg-slate-800 text-white font-bold text-lg px-2 py-1 rounded border border-blue-500 outline-none"
              />
              <button onClick={handleTitleSubmit} className="p-1 text-emerald-400 hover:bg-slate-800 rounded">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 group ${isOwner ? 'cursor-pointer' : ''}`}
              onClick={() => isOwner && setIsEditingTitle(true)}
            >
              <h2 className={`text-lg font-bold text-white tracking-wide ${isOwner ? 'group-hover:text-blue-400' : ''} transition`}>
                {activeBoard.title}
              </h2>
              {isOwner && (
                <Edit2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition opacity-0 group-hover:opacity-100" />
              )}
            </div>
          )
        ) : (
          <h2 className="text-lg font-bold text-slate-400">Select a Board</h2>
        )}
      </div>

      {/* Center: Search & Filter Controls */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Real-time Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cards by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">
              All Priorities
            </option>
            <option value="high" className="bg-slate-900 text-rose-400 font-semibold">
              High Priority
            </option>
            <option value="medium" className="bg-slate-900 text-amber-400 font-semibold">
              Medium Priority
            </option>
            <option value="low" className="bg-slate-900 text-emerald-400 font-semibold">
              Low Priority
            </option>
          </select>
        </div>

        {/* Assignee Filter */}
        {boardMembers.length > 0 && (
          <div className="hidden md:flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Assignees
              </option>
              {boardMembers.map((u) => (
                <option key={u._id} value={u._id} className="bg-slate-900 text-slate-200">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Saving Status Badge, Theme Toggle & User Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Save Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-950/60 border border-slate-800/80">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-medium">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{saveStatusMessage || 'Saved to DB'}</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-medium">{saveStatusMessage || 'Error'}</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <>
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500">Synced</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Toggle Dark / Light mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        {/* User Profile Dropdown */}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 hover:bg-slate-800 rounded-xl transition"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
                <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-800">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
