'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShieldCheck, Download, Trash2, ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      await updateSession({ name: data.user.name });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/users/me/export';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings & Privacy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your profile information and LGPD data subject rights.</p>
          </div>
        </div>

        {/* Card 1: Profile Information */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-3">
            <UserIcon className="h-5 w-5" />
            <h2 className="font-semibold text-lg text-white">Profile Details</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {message && (
              <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl text-xs text-indigo-200">
                {message}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400">
                <span>{session?.user?.email}</span>
                <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-xs transition shadow-lg shadow-blue-500/20"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Privacy & Data Protection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-semibold text-lg text-white">LGPD Data Portability (Art. 18)</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Under LGPD Art. 18, V, you can export a complete copy of your personal data, boards, and card contributions in structured JSON format at any time.
          </p>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
          >
            <Download className="h-4 w-4" />
            <span>Download My Personal Data (JSON)</span>
          </button>
        </div>

        {/* Card 3: Danger Zone */}
        <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3 text-red-400 border-b border-red-900/40 pb-3">
            <Trash2 className="h-5 w-5" />
            <h2 className="font-semibold text-lg text-white">Danger Zone</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Permanently delete your account and remove personal data (LGPD Art. 18, VI). Sole-owned boards will be erased; shared boards will be transferred to co-members.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition shadow-lg shadow-red-600/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={session?.user?.email || ''}
      />
    </div>
  );
}
