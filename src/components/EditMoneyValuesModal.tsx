import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';
import {
  X,
  Edit3,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditMoneyValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'credit' | 'debit' | 'all';
}

export const EditMoneyValuesModal: React.FC<EditMoneyValuesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all',
}) => {
  const { transactions, updateTransaction, addTransaction, deleteTransaction } = useTransactions();

  const [activeTab, setActiveTab] = useState<'credit' | 'debit' | 'all'>(initialTab);
  const [editedAmounts, setEditedAmounts] = useState<{ [id: string]: number }>({});
  const [editedSources, setEditedSources] = useState<{ [id: string]: string }>({});
  
  // Quick Override Fields
  const [quickCredit, setQuickCredit] = useState<string>('');
  const [quickDebit, setQuickDebit] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // Populate initial state from transactions
    const initialAmtMap: { [id: string]: number } = {};
    const initialSourceMap: { [id: string]: string } = {};
    transactions.forEach((tx) => {
      initialAmtMap[tx.id] = tx.amount;
      initialSourceMap[tx.id] = tx.recipientOrSource;
    });
    setEditedAmounts(initialAmtMap);
    setEditedSources(initialSourceMap);
  }, [transactions, isOpen]);

  if (!isOpen) return null;

  const creditTxs = transactions.filter((t) => t.type === 'credit');
  const debitTxs = transactions.filter((t) => t.type === 'debit');
  const atmTxs = transactions.filter((t) => t.type === 'atm_withdrawal');

  const handleSaveIndividualTxs = async () => {
    let count = 0;
    for (const tx of transactions) {
      const newAmt = editedAmounts[tx.id];
      const newSource = editedSources[tx.id];

      if (
        (newAmt !== undefined && newAmt !== tx.amount && newAmt >= 0) ||
        (newSource !== undefined && newSource !== tx.recipientOrSource && newSource.trim())
      ) {
        await updateTransaction(tx.id, {
          amount: newAmt !== undefined ? newAmt : tx.amount,
          givenAmount: newAmt !== undefined ? newAmt : tx.givenAmount,
          recipientOrSource: newSource ? newSource.trim() : tx.recipientOrSource,
        });
        count++;
      }
    }

    setSuccessMsg(`Successfully updated ${count} money record(s)!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Quick Credit Override / Adjustment
  const handleQuickCreditAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(quickCredit);
    if (isNaN(targetAmt) || targetAmt < 0) return;

    // If there is an existing primary credit record, update it or add a new credit adjustment
    const mainCredit = creditTxs[0];
    if (mainCredit) {
      await updateTransaction(mainCredit.id, {
        amount: targetAmt,
        givenAmount: targetAmt,
        recipientOrSource: mainCredit.recipientOrSource || 'Salary / Credit Income',
      });
    } else {
      await addTransaction({
        type: 'credit',
        amount: targetAmt,
        givenAmount: targetAmt,
        changeAmount: 0,
        recipientOrSource: 'Income / Credit Opening Balance',
        category: 'Salary / Income',
        paymentMode: 'online_upi',
        dateTime: new Date().toISOString(),
        remarks: 'Credit balance updated via quick edit',
        createdByName: 'Rahee',
      });
    }

    setQuickCredit('');
    setSuccessMsg(`Total Credit set to ₹${targetAmt}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleQuickDebitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(quickDebit);
    if (isNaN(targetAmt) || targetAmt < 0) return;

    const mainDebit = debitTxs[0];
    if (mainDebit) {
      await updateTransaction(mainDebit.id, {
        amount: targetAmt,
        givenAmount: targetAmt,
      });
    } else {
      await addTransaction({
        type: 'debit',
        amount: targetAmt,
        givenAmount: targetAmt,
        changeAmount: 0,
        recipientOrSource: 'Expense Adjustment',
        category: 'Other / Misc',
        paymentMode: 'cash',
        dateTime: new Date().toISOString(),
        remarks: 'Expense amount updated via quick edit',
        createdByName: 'Rahee',
      });
    }

    setQuickDebit('');
    setSuccessMsg(`Expense amount updated to ₹${targetAmt}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const displayList =
    activeTab === 'credit'
      ? creditTxs
      : activeTab === 'debit'
      ? debitTxs
      : transactions;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl text-slate-100 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-slate-900 shrink-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Rewrite Money & Balance Values</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Easily edit credit, debit, income amounts or rewrite any record
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 bg-emerald-950/90 border border-emerald-500/60 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Override Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            {/* Quick Credit Override */}
            <form onSubmit={handleQuickCreditAdjust} className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Rewrite Total Credit (Income)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={quickCredit}
                  onChange={(e) => setQuickCredit(e.target.value)}
                  placeholder="e.g. 25000 or 50000"
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!quickCredit}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 shrink-0"
                >
                  Set Credit
                </button>
              </div>
            </form>

            {/* Quick Expense Override */}
            <form onSubmit={handleQuickDebitAdjust} className="space-y-1.5">
              <label className="block text-xs font-bold text-rose-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Rewrite Primary Debit
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={quickDebit}
                  onChange={(e) => setQuickDebit(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={!quickDebit}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 shrink-0"
                >
                  Set Expense
                </button>
              </div>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-800 mb-4 gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'credit'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Credit Income ({creditTxs.length})
            </button>
            <button
              onClick={() => setActiveTab('debit')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'debit'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Debits & Expenses ({debitTxs.length})
            </button>
          </div>

          {/* Transaction Table / List with direct editable inputs */}
          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {displayList.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No transaction records found in this view.</p>
            ) : (
              displayList.map((tx) => {
                const currentAmt = editedAmounts[tx.id] !== undefined ? editedAmounts[tx.id] : tx.amount;
                const currentSource = editedSources[tx.id] !== undefined ? editedSources[tx.id] : tx.recipientOrSource;

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left info & editable recipient */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            tx.type === 'credit'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : tx.type === 'debit'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-sky-950 text-sky-400 border border-sky-800'
                          }`}
                        >
                          {tx.type === 'credit' ? 'Credit (+)' : tx.type === 'debit' ? 'Debit (-)' : 'ATM Cash'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(tx.dateTime).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={currentSource}
                        onChange={(e) =>
                          setEditedSources((prev) => ({ ...prev, [tx.id]: e.target.value }))
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="Recipient / Source Name"
                      />
                    </div>

                    {/* Right editable amount */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="any"
                        value={currentAmt}
                        onChange={(e) =>
                          setEditedAmounts((prev) => ({
                            ...prev,
                            [tx.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className={`w-32 bg-slate-900 border rounded-lg px-2.5 py-1.5 text-sm font-extrabold focus:outline-none ${
                          tx.type === 'credit'
                            ? 'text-emerald-400 border-emerald-500/40 focus:border-emerald-400'
                            : 'text-slate-100 border-slate-700 focus:border-indigo-500'
                        }`}
                      />

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-all border border-rose-800/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Done / Close
            </button>

            <button
              onClick={handleSaveIndividualTxs}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Modified Values</span>
            </button>
          </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
