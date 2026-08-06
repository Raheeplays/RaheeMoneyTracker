import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { PaymentMode } from '../types';
import {
  Sliders,
  PlusCircle,
  Trash2,
  ShieldCheck,
  CheckCircle,
  FileText,
  Building2,
  Lock,
  Tag,
  UserCheck,
  UserX,
  Users,
  Filter,
  Check,
  X,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const { quickTemplates, addQuickTemplate, deleteQuickTemplate, selectedUserFilter, setSelectedUserFilter } = useTransactions();
  const { isAdmin, currentUser, allUsers, pendingUsers, approveUser, rejectUser } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState<PaymentMode>('cash');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addQuickTemplate({
      name: name.trim(),
      category,
      defaultPaymentMode,
    });

    setSuccessMsg(`Preset "${name.trim()}" added to recipient dropdown!`);
    setName('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <Lock className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You must be logged in as Admin Rahee (Name: Rahee, Pass: 78692, OTP: 181855) to manage user approvals, quick dropdown presets & administrative settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Admin Control Dashboard</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Rahee (Super Admin)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Approve pending user accounts, isolate user profiles, and manage dropdown presets
            </p>
          </div>
        </div>

        {/* Global User Data View Filter for Admin */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Admin Scope Filter
            </label>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-bold focus:outline-none"
            >
              <option value="all">⚡ All Users Data (Aggregated)</option>
              {allUsers.map((u) => (
                <option key={u.uid} value={u.uid}>
                  👤 {u.name} ({u.role === 'admin' ? 'Admin' : u.username ? `@${u.username}` : 'User'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* USER APPROVAL REQUESTS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Pending Sign-Up Requests</span>
              {pendingUsers.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse">
                  {pendingUsers.length} Pending
                </span>
              )}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {pendingUsers.length === 0 ? 'No pending approval requests' : 'Requires Admin Rahee approval'}
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400/60 mx-auto mb-1" />
            <p className="text-xs text-slate-400 font-medium">
              All user sign-up accounts are verified and approved.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <span>⚠️ Action required: Review user sign-up credentials below and click Approve or Reject.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.uid}
                  className="bg-slate-800/90 border border-amber-800/50 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md hover:border-amber-500/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">Username: <span className="text-amber-300 font-bold">@{u.username || 'n/a'}</span></p>
                    {u.email && <p className="text-xs text-emerald-400 font-mono">Auth Email: {u.email}</p>}
                    <p className="text-[10px] text-slate-400 font-mono">User ID: {u.uid}</p>
                    {u.createdAt && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Requested: {new Date(u.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(u.uid)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow"
                    >
                      <Check className="w-4 h-4" /> Approve User
                    </button>
                    <button
                      onClick={() => rejectUser(u.uid)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST OF ALL REGISTERED USERS */}
        <div className="pt-3 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>All System Registered Users ({allUsers.length})</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {allUsers.map((usr) => (
              <div
                key={usr.uid}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-xs flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-white">{usr.name}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{usr.username ? `@${usr.username}` : usr.role}</p>
                  {usr.email && <p className="text-[10px] text-emerald-400 truncate max-w-[150px] font-mono">{usr.email}</p>}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    usr.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : usr.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {usr.status || 'approved'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD TEMPLATE FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Add Dropdown Quick Preset</span>
          </h3>

          <form onSubmit={handleAddTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preset Name (Text to display) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Corner Retail Store, Driver Salary, Maid Allowance..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Payment Mode
              </label>
              <select
                value={defaultPaymentMode}
                onChange={(e) => setDefaultPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="cash">Offline (Cash)</option>
                <option value="online_upi">Online (UPI)</option>
                <option value="atm_cash">ATM Withdrawal</option>
              </select>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98"
            >
              Add Preset To Dropdown
            </button>
          </form>
        </div>

        {/* LIST OF ACTIVE DROPDOWN TEMPLATES */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>Active Dropdown Presets ({quickTemplates.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Available to all users</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {quickTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-slate-600 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{tpl.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-md">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-300 uppercase">
                      {tpl.defaultPaymentMode}
                    </span>
                  </div>
                </div>

                {!tpl.isSystem && (
                  <button
                    onClick={() => deleteQuickTemplate(tpl.id)}
                    className="p-1.5 rounded-lg bg-slate-700/60 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                    title="Remove Preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

