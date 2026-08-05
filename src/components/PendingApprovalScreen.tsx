import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, RefreshCw, LogOut, CheckCircle2, User, Hash } from 'lucide-react';
import { motion } from 'motion/react';

export const PendingApprovalScreen: React.FC = () => {
  const { currentUser, logout, refreshUserStatus } = useAuth();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRefresh = async () => {
    setChecking(true);
    setMsg('');
    await refreshUserStatus();
    setChecking(false);
    setMsg('Status checked with Admin server.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden"
      >
        {/* Animated Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-amber-500 to-amber-400 rounded-b-full shadow-lg shadow-amber-500/30" />

        <div className="w-20 h-20 bg-amber-950/60 border border-amber-800/60 text-amber-400 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Account Pending Admin Approval</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your registration is received! For data security and privacy, new user accounts require manual approval by <span className="text-emerald-400 font-semibold">Admin Rahee</span> before accessing financial vaults.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">{currentUser?.name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Hash className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-300 truncate font-mono">
              {currentUser?.username ? `@${currentUser.username}` : currentUser?.uid}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Account Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
              Pending Review
            </span>
          </div>
        </div>

        {msg && (
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {msg}
          </p>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Refresh Approval Status'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Once Admin Rahee approves your profile, click "Refresh Approval Status" or reload to enter the app.
        </p>
      </motion.div>
    </div>
  );
};
