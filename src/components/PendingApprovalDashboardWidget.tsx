import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Check, X, Clock, ShieldAlert } from 'lucide-react';

export const PendingApprovalDashboardWidget: React.FC = () => {
  const { isAdmin, pendingUsers, approveUser, rejectUser } = useAuth();

  if (!isAdmin || pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-amber-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 shrink-0">
            <UserCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-100 flex items-center gap-2">
              <span>Pending User Sign-Up Requests</span>
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500 text-slate-950 font-black tracking-wider animate-bounce">
                {pendingUsers.length} PENDING
              </span>
            </h3>
            <p className="text-xs text-amber-200/80">
              New accounts registered. Review details below and approve access for Admin Rahee's vault.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pendingUsers.map((u) => (
          <div
            key={u.uid}
            className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md hover:border-amber-400 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{u.name}</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                  Approval Pending
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                Username: <span className="text-amber-300 font-bold">@{u.username || 'n/a'}</span>
              </p>
              {u.email && (
                <p className="text-xs text-emerald-400 font-mono">
                  Auth Email: {u.email}
                </p>
              )}
              <p className="text-[10px] text-slate-400 font-mono">User ID: {u.uid}</p>
              {u.createdAt && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400/80" /> Registered:{' '}
                  {new Date(u.createdAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => approveUser(u.uid)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow"
              >
                <Check className="w-4 h-4" /> Approve Account
              </button>
              <button
                type="button"
                onClick={() => rejectUser(u.uid)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
