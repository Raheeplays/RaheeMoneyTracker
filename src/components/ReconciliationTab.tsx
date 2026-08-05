import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ReconciliationRecord } from '../types';
import {
  Scale,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
  Banknote,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReconciliationTab: React.FC = () => {
  const { cashBalance, onlineBalance, netBalance, addTransaction } = useTransactions();
  const { currentUser } = useAuth();

  // Actual available money state (initialized with current tracked balances)
  const [actualCash, setActualCash] = useState<string>(cashBalance.toString());
  const [actualOnline, setActualOnline] = useState<string>(onlineBalance.toString());
  const [memoNote, setMemoNote] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // Partial missing expense solver state
  const [recalledAmount, setRecalledAmount] = useState<string>('');
  const [recalledRecipient, setRecalledRecipient] = useState<string>('');
  const [recalledMode, setRecalledMode] = useState<'cash' | 'online_upi'>('cash');
  const [recalledCategory, setRecalledCategory] = useState<string>('Groceries & Supplies');

  // Local storage for history of reconciliation audits
  const [auditLogs, setAuditLogs] = useState<ReconciliationRecord[]>(() => {
    const saved = localStorage.getItem('moneytracker_reconciliation_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Sync inputs if user clicks reset
  const handleSyncWithSystem = () => {
    setActualCash(cashBalance.toString());
    setActualOnline(onlineBalance.toString());
  };

  useEffect(() => {
    localStorage.setItem('moneytracker_reconciliation_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Numerical calculations
  const parsedActualCash = parseFloat(actualCash) || 0;
  const parsedActualOnline = parseFloat(actualOnline) || 0;
  const actualTotal = parsedActualCash + parsedActualOnline;

  const cashDiff = cashBalance - parsedActualCash; // >0 means missing expense in system
  const onlineDiff = onlineBalance - parsedActualOnline; // >0 means missing expense in system
  const totalDiff = netBalance - actualTotal;

  // Auto-resolve adjustment: create balancing transactions so system net equals actual money
  const handleAutoResolve = async () => {
    let resolvedTxIds: string[] = [];

    // Cash adjustment
    if (cashDiff !== 0) {
      const isExpenseMissing = cashDiff > 0;
      await addTransaction({
        type: isExpenseMissing ? 'debit' : 'credit',
        amount: Math.abs(cashDiff),
        recipientOrSource: 'Reconciliation Adjustment (Cash)',
        category: 'Unrecorded Expense / Discrepancy Fix',
        paymentMode: 'cash',
        dateTime: new Date().toISOString(),
        remarks: memoNote.trim()
          ? `Difference Fix: ${memoNote.trim()}`
          : `Reconciliation balance adjustment for cash (Diff: ₹${cashDiff})`,
      });
    }

    // Online adjustment
    if (onlineDiff !== 0) {
      const isExpenseMissing = onlineDiff > 0;
      await addTransaction({
        type: isExpenseMissing ? 'debit' : 'credit',
        amount: Math.abs(onlineDiff),
        recipientOrSource: 'Reconciliation Adjustment (Online)',
        category: 'Unrecorded Expense / Discrepancy Fix',
        paymentMode: 'online_upi',
        dateTime: new Date().toISOString(),
        remarks: memoNote.trim()
          ? `Difference Fix: ${memoNote.trim()}`
          : `Reconciliation balance adjustment for online account (Diff: ₹${onlineDiff})`,
      });
    }

    // Add record to audit log
    const newRecord: ReconciliationRecord = {
      id: `rec-${Date.now()}`,
      dateTime: new Date().toISOString(),
      trackedCash: cashBalance,
      trackedOnline: onlineBalance,
      trackedTotal: netBalance,
      actualCash: parsedActualCash,
      actualOnline: parsedActualOnline,
      actualTotal,
      cashDiff,
      onlineDiff,
      totalDiff,
      memoNote: memoNote.trim() || 'System auto-adjusted balances to match real-time wallet',
      resolved: true,
      resolvedAt: new Date().toISOString(),
      userId: currentUser?.uid,
    };

    setAuditLogs((prev) => [newRecord, ...prev]);
    setActionMessage('✅ System records successfully updated! Tracked net balance now equals actual money.');
    setMemoNote('');

    setTimeout(() => {
      setActionMessage('');
    }, 4000);
  };

  // Save audit log without immediately creating transactions
  const handleSaveAuditRecord = () => {
    const newRecord: ReconciliationRecord = {
      id: `rec-${Date.now()}`,
      dateTime: new Date().toISOString(),
      trackedCash: cashBalance,
      trackedOnline: onlineBalance,
      trackedTotal: netBalance,
      actualCash: parsedActualCash,
      actualOnline: parsedActualOnline,
      actualTotal,
      cashDiff,
      onlineDiff,
      totalDiff,
      memoNote: memoNote.trim() || 'Audit snapshot recorded for memory',
      resolved: false,
      userId: currentUser?.uid,
    };

    setAuditLogs((prev) => [newRecord, ...prev]);
    setActionMessage('📋 Difference record saved to audit history for future recollection!');
    setMemoNote('');

    setTimeout(() => {
      setActionMessage('');
    }, 3000);
  };

  // Solve missing partially by recording a recalled expense (e.g. Milkman ₹500)
  const handleRecordPartialExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(recalledAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionMessage('⚠️ Please enter a valid positive expense amount.');
      return;
    }

    const recipientName = recalledRecipient.trim() || 'Recalled Missing Expense';

    await addTransaction({
      type: 'debit',
      amount: amt,
      recipientOrSource: recipientName,
      category: recalledCategory,
      paymentMode: recalledMode,
      dateTime: new Date().toISOString(),
      remarks: `Recalled missing expense recorded during reconciliation.`,
    });

    const targetDiff = recalledMode === 'cash' ? cashDiff : onlineDiff;
    const remaining = targetDiff - amt;

    setActionMessage(
      `✅ Added ₹${amt.toLocaleString('en-IN')} expense for "${recipientName}"! ` +
      (remaining > 0
        ? `Remaining missing ${recalledMode} balance is now ₹${remaining.toLocaleString('en-IN')}.`
        : remaining === 0
        ? `🎉 ${recalledMode.toUpperCase()} balance is now perfectly balanced!`
        : `Note: Expense logged and tracked balance updated.`)
    );

    setRecalledAmount('');
    setRecalledRecipient('');

    setTimeout(() => {
      setActionMessage('');
    }, 5000);
  };

  const handleDeleteAudit = (id: string) => {
    setAuditLogs((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Difference & Reconciliation Center</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Separate Layout
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate missing unrecorded expenses and align tracked records with actual real-time wallet money
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncWithSystem}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fill Current System Stats</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Section: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* COLUMN 1: System Tracked Balances */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>1. System Tracked Record</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Auto-Logs
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-teal-400" />
                  <span>Tracked Online</span>
                </p>
                <p className="text-base font-bold text-teal-300 mt-0.5">
                  ₹{onlineBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tracked Cash</span>
                </p>
                <p className="text-base font-bold text-emerald-300 mt-0.5">
                  ₹{cashBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-emerald-400">Tracked Net Total</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5">
                  ₹{netBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Realtime Available Wallet Input */}
        <div className="bg-slate-900 border border-emerald-800/60 rounded-2xl p-5 shadow-lg space-y-4 relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>2. Actual Realtime Money</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              User Input
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actual Available Online / Bank Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={actualOnline}
                  onChange={(e) => setActualOnline(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actual Available Cash Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-300">Total Realtime Available</p>
                <p className="text-xl font-black text-amber-300 mt-0.5">
                  ₹{actualTotal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Calculated Discrepancy & Difference */}
        <div
          className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 ${
            totalDiff !== 0 ? 'border-amber-800/80' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle
                className={`w-4 h-4 ${totalDiff !== 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}
              />
              <span>3. Discrepancy / Difference</span>
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                totalDiff !== 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {totalDiff === 0 ? 'Balanced' : 'Difference Found'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 font-medium">Online Difference:</span>
              <span
                className={`font-mono font-bold ${
                  onlineDiff > 0
                    ? 'text-rose-400'
                    : onlineDiff < 0
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {onlineDiff > 0
                  ? `-₹${onlineDiff.toLocaleString('en-IN')} (Missing Expense)`
                  : onlineDiff < 0
                  ? `+₹${Math.abs(onlineDiff).toLocaleString('en-IN')} (Unrecorded Gain)`
                  : '₹0 (Exact)'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 font-medium">Cash Difference:</span>
              <span
                className={`font-mono font-bold ${
                  cashDiff > 0
                    ? 'text-rose-400'
                    : cashDiff < 0
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {cashDiff > 0
                  ? `-₹${cashDiff.toLocaleString('en-IN')} (Missing Expense)`
                  : cashDiff < 0
                  ? `+₹${Math.abs(cashDiff).toLocaleString('en-IN')} (Unrecorded Gain)`
                  : '₹0 (Exact)'}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border flex justify-between items-center ${
                totalDiff !== 0
                  ? 'bg-amber-950/40 border-amber-800/80'
                  : 'bg-emerald-950/40 border-emerald-800/80'
              }`}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Total Discrepancy
                </p>
                <p
                  className={`text-lg font-black mt-0.5 ${
                    totalDiff > 0
                      ? 'text-rose-400'
                      : totalDiff < 0
                      ? 'text-emerald-400'
                      : 'text-emerald-300'
                  }`}
                >
                  {totalDiff > 0
                    ? `₹${totalDiff.toLocaleString('en-IN')} Unrecorded Expense`
                    : totalDiff < 0
                    ? `₹${Math.abs(totalDiff).toLocaleString('en-IN')} Unrecorded Income`
                    : '₹0 Perfectly Matched'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solve Missing Expense / Recalled Expense Logger */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Solve Missing: Record Recalled Expense (Step-by-Step)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Remembered a missing payment? (e.g. ₹500 given to milkman out of ₹1,000 missing). Log it here to auto-add to actual transaction records and dynamically reduce the remaining missing balance!
            </p>
          </div>
          {totalDiff > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 self-start sm:self-auto">
              ₹{totalDiff.toLocaleString('en-IN')} Unresolved
            </span>
          )}
        </div>

        <form onSubmit={handleRecordPartialExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recalled Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={recalledAmount}
                onChange={(e) => setRecalledAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            {totalDiff > 0 && (
              <button
                type="button"
                onClick={() => setRecalledAmount(totalDiff.toString())}
                className="text-[10px] text-amber-400 hover:underline font-semibold mt-1 inline-block"
              >
                Fill Total Missing (₹{totalDiff})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recipient / Expense Note
            </label>
            <input
              type="text"
              value={recalledRecipient}
              onChange={(e) => setRecalledRecipient(e.target.value)}
              placeholder="e.g. Milkman / Auto Fare"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Source
            </label>
            <select
              value={recalledMode}
              onChange={(e) => setRecalledMode(e.target.value as 'cash' | 'online_upi')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="cash">💵 Cash (Diff: ₹{cashDiff})</option>
              <option value="online_upi">💳 Online / UPI (Diff: ₹{onlineDiff})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={recalledCategory}
              onChange={(e) => setRecalledCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Groceries & Supplies">Groceries & Milk</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation">Transportation / Travel</option>
              <option value="Utility Bills">Bills & Utilities</option>
              <option value="Personal Expense">Personal Expense</option>
              <option value="Other">Other / Uncategorized</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 pt-1">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Recalled Expense & Reduce Remaining Missing Discrepancy</span>
            </button>
          </div>
        </form>
      </div>

      {/* Action & Memo Note Controls Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Resolution Memo & Auto-Adjustment Actions</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Memo Note / Memory Reminder (Optional)
          </label>
          <input
            type="text"
            value={memoNote}
            onChange={(e) => setMemoNote(e.target.value)}
            placeholder="e.g. Spent cash on grocery shopping & auto fare without recording bill"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleAutoResolve}
            disabled={totalDiff === 0}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Rewrite & Adjust System Net Balance (Fix Discrepancy)</span>
          </button>

          <button
            onClick={handleSaveAuditRecord}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Save Difference Snapshot & Memo Note</span>
          </button>
        </div>
      </div>

      {/* Historical Audit & Reconciliation Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Reconciliation Audit Log & History ({auditLogs.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Saved audit snapshots & memory notes</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800">
            <Scale className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No reconciliation records created yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter actual available cash/online money above to calculate and save difference records.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        log.resolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.resolved ? '✓ Resolved & Adjusted' : '⏳ Memo Snapshot Saved'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.dateTime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium">{log.memoNote}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>
                      Tracked Total: <strong className="text-white">₹{log.trackedTotal.toLocaleString('en-IN')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Actual Total: <strong className="text-amber-300">₹{log.actualTotal.toLocaleString('en-IN')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Diff: <strong className="text-rose-400">₹{log.totalDiff.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAudit(log.id)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition-colors self-end sm:self-center"
                  title="Delete Audit Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
