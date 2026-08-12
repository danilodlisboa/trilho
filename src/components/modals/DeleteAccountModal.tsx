'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isMatched = confirmEmail.trim().toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!isMatched) return;
    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account.');

      await signOut({ callbackUrl: '/login' });
    } catch (err: any) {
      setError(err.message || 'Error deleting account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-red-900/60 rounded-2xl p-6 max-w-md w-full text-slate-100 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Delete Account Permanently</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          This action is <strong>irreversible</strong>. All your personal data will be erased under LGPD Art. 18. Boards owned solely by you will be deleted; shared boards will be transferred to co-members.
        </p>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 block">
            Type your email <strong className="text-slate-200">{userEmail}</strong> to confirm:
          </label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={userEmail}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isMatched || isDeleting}
            className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-lg shadow-red-600/20"
          >
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
