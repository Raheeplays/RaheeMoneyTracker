import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { CurrencyNote } from '../types';
import {
  Banknote,
  Hash,
  PlusCircle,
  Search,
  CheckCircle2,
  Send,
  Download,
  Trash2,
  Wallet,
  Building2,
  Tag,
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'motion/react';

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export const CurrencyNotesView: React.FC = () => {
  const { currencyNotes, addCurrencyNote, updateNoteStatus, deleteCurrencyNote, totalTrackedNotesValue } = useTransactions();

  const [denomination, setDenomination] = useState<number>(500);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [status, setStatus] = useState<'in_wallet' | 'given' | 'received'>('in_wallet');
  const [remarks, setRemarks] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDenom, setFilterDenom] = useState<number | 'all'>('all');

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    await addCurrencyNote({
      denomination,
      serialNumber: serialNumber.trim().toUpperCase(),
      status,
      remarks: remarks.trim() || `Tracked ${denomination} note`,
      createdAt: new Date().toISOString(),
    });

    setSerialNumber('');
    setRemarks('');
  };

  const filteredNotes = currencyNotes.filter((n) => {
    if (filterDenom !== 'all' && n.denomination !== filterDenom) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.serialNumber.toLowerCase().includes(q) || n.remarks?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Vault Overview */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-800/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Banknote className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Currency Note Serial Number Database</span>
            </h2>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Link physical ₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100, ₹200, ₹500 banknote serial numbers to transactions
            </p>
          </div>
        </div>

        {/* Total Wallet Notes Value */}
        <div className="bg-slate-900/90 border border-amber-500/30 px-5 py-3 rounded-2xl flex items-center justify-between md:justify-end gap-4">
          <div>
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Total In-Wallet Notes Value
            </p>
            <p className="text-2xl font-extrabold text-amber-300">
              {formatRupee(totalTrackedNotesValue)}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Add Note Form + Denomination Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD NOTE FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <span>Add Banknote Serial Number</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Denomination Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note Denomination (Rupees)
              </label>
              <select
                value={denomination}
                onChange={(e) => setDenomination(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              >
                {DENOMINATIONS.map((d) => (
                  <option key={d} value={d}>
                    ₹{d} Banknote
                  </option>
                ))}
              </select>
            </div>

            {/* Serial Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Banknote Serial Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g., 7AB 112233 or 9XY 887766"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest text-white uppercase focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note Location / Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="in_wallet">In Wallet / Hand (Available Cash)</option>
                <option value="given">Given in Transaction (Spent)</option>
                <option value="received">Received from Transaction</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Remarks / Source Note
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Withdrawn from ATM, Store change..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-transform active:scale-98"
            >
              Save Note Serial to Database
            </button>
          </form>
        </div>

        {/* DENOMINATIONS VAULT SUMMARY GRID */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Vault Breakdown by Denomination</span>
            </h3>
            <span className="text-xs text-slate-400">In Wallet Notes</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {DENOMINATIONS.map((denomVal) => {
              const notesForDenom = currencyNotes.filter(
                (n) => n.denomination === denomVal && n.status === 'in_wallet'
              );
              const count = notesForDenom.length;
              const totalVal = count * denomVal;

              return (
                <button
                  key={denomVal}
                  onClick={() => setFilterDenom(filterDenom === denomVal ? 'all' : denomVal)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filterDenom === denomVal
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">₹{denomVal}</div>
                  <div className="text-base font-extrabold text-white">{count} <span className="text-[10px] font-normal text-slate-400">notes</span></div>
                  <div className="text-[11px] text-slate-400 font-mono">₹{totalVal}</div>
                </button>
              );
            })}
          </div>

          {/* Search & Serial Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note serial number (e.g. 7AB...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            {filterDenom !== 'all' && (
              <button
                onClick={() => setFilterDenom('all')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700"
              >
                Clear Denomination Filter (₹{filterDenom})
              </button>
            )}
          </div>

          {/* LIST OF TRACKED CURRENCY NOTES */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400">No currency notes found matching filter.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Banknote icon badge */}
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      ₹{note.denomination}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold tracking-widest text-amber-300">
                          {note.serialNumber}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            note.status === 'in_wallet'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              : note.status === 'given'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                              : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                          }`}
                        >
                          {note.status === 'in_wallet' ? 'In Wallet' : note.status === 'given' ? 'Given (Spent)' : 'Received'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-0.5">{note.remarks}</p>
                    </div>
                  </div>

                  {/* Actions & Status toggles */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {note.status === 'in_wallet' ? (
                      <button
                        onClick={() => updateNoteStatus(note.id, 'given')}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Mark Given
                      </button>
                    ) : (
                      <button
                        onClick={() => updateNoteStatus(note.id, 'in_wallet')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Put In Wallet
                      </button>
                    )}

                    <button
                      onClick={() => deleteCurrencyNote(note.id)}
                      className="p-1.5 rounded-lg bg-slate-700/60 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
