import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType, PaymentMode } from '../types';
import { EditTransactionModal } from './EditTransactionModal';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Banknote,
  Smartphone,
  Calendar,
  Clock,
  Trash2,
  Tag,
  Hash,
  MessageSquare,
  Calculator,
  Eye,
  X,
  UserCheck,
  FileText,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;
    // Mode filter
    if (filterMode !== 'all' && tx.paymentMode !== filterMode) return false;
    // Category filter
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRecipient = tx.recipientOrSource.toLowerCase().includes(q);
      const matchCategory = tx.category.toLowerCase().includes(q);
      const matchRemarks = tx.remarks?.toLowerCase().includes(q);
      const matchSerials = tx.linkedNoteSerialNumbers?.some((s) => s.toLowerCase().includes(q));
      const matchAmount = tx.amount.toString().includes(q);
      return matchRecipient || matchCategory || matchRemarks || matchSerials || matchAmount;
    }

    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 text-slate-100">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Detailed Transaction Logs</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredTransactions.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Money Given/Received, Offline Cash, UPI, Change Returned & ATM Log
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search store, driver, serial #, amount..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        
        {/* Type Filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 self-center font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'debit', label: 'Debit (-)' },
            { id: 'credit', label: 'Credit (+)' },
            { id: 'atm_withdrawal', label: 'ATM Cash' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === item.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mode Filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 self-center font-medium mr-1">Mode:</span>
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'cash', label: 'Offline (Cash)' },
            { id: 'online_upi', label: 'Online (UPI)' },
            { id: 'atm_cash', label: 'ATM' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterMode(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === item.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>

      {/* Transaction Records List */}
      <div className="space-y-3 pt-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 text-sm">No transaction logs match your filter criteria.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <motion.div
              key={tx.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 transition-all shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Left side: Icon + Recipient + Category */}
                <div className="flex items-start gap-3">
                  
                  {/* Type Icon Badge */}
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      tx.type === 'credit'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : tx.type === 'debit'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : tx.type === 'debit' ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {tx.recipientOrSource}
                      </h3>

                      {/* Payment Mode Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          tx.paymentMode === 'cash'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                            : tx.paymentMode === 'online_upi'
                            ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50'
                            : 'bg-sky-950/40 text-sky-300 border-sky-800/50'
                        }`}
                      >
                        {tx.paymentMode === 'cash' ? (
                          <>
                            <Banknote className="w-3 h-3 text-amber-400" /> Offline (Cash)
                          </>
                        ) : tx.paymentMode === 'online_upi' ? (
                          <>
                            <Smartphone className="w-3 h-3 text-indigo-400" /> Online (UPI)
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-sky-400" /> ATM Cash
                          </>
                        )}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600/50">
                        {tx.category}
                      </span>
                    </div>

                    {/* Date & Time Timestamp */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(tx.dateTime)}
                      </span>
                      {tx.createdByName && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <UserCheck className="w-3 h-3" /> {tx.createdByName}
                        </span>
                      )}
                    </div>

                    {/* Remarks / Details preview */}
                    {tx.remarks && (
                      <p className="text-xs text-slate-300 mt-1.5 italic bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-800/80 inline-block">
                        "{tx.remarks}"
                      </p>
                    )}

                    {/* Note Serial Numbers attached */}
                    {tx.linkedNoteSerialNumbers && tx.linkedNoteSerialNumbers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Linked Serials:
                        </span>
                        {tx.linkedNoteSerialNumbers.map((sn, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md"
                          >
                            {sn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Money Amount & Change Breakdown */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/60">
                  <div className="text-left sm:text-right">
                    
                    {/* Amount Display */}
                    <div
                      className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                        tx.type === 'credit'
                          ? 'text-emerald-400'
                          : tx.type === 'debit'
                          ? 'text-rose-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : tx.type === 'debit' ? '-' : ''}
                      {formatRupee(tx.amount)}
                    </div>

                    {/* Given Cash & Change Return Pill */}
                    {tx.changeAmount && tx.changeAmount > 0 ? (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800 text-[11px] font-semibold text-emerald-300">
                        <Calculator className="w-3 h-3 text-emerald-400" />
                        <span>Paid ₹{tx.givenAmount} → Got ₹{tx.changeAmount} Change</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions (Edit / View Detail / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTx(tx)}
                      title="Edit Transaction Record"
                      className="p-2 rounded-xl bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 hover:text-white hover:bg-indigo-900/80 transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit3 className="w-4 h-4 text-indigo-400" />
                      <span className="hidden md:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setSelectedTxDetail(tx)}
                      title="View Details"
                      className="p-2 rounded-xl bg-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Delete Record"
                      className="p-2 rounded-xl bg-slate-700/60 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Transaction Detail Popup Modal */}
      <AnimatePresence>
        {selectedTxDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Transaction Log Detail
                </h3>
                <button
                  onClick={() => setSelectedTxDetail(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recipient / Person</span>
                  <span className="font-bold text-white text-sm">{selectedTxDetail.recipientOrSource}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transaction Type</span>
                  <span className="font-semibold text-emerald-400 capitalize">{selectedTxDetail.type}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Actual Money Amount</span>
                  <span className="font-extrabold text-white text-base">{formatRupee(selectedTxDetail.amount)}</span>
                </div>
                {selectedTxDetail.givenAmount && selectedTxDetail.givenAmount > selectedTxDetail.amount && (
                  <>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Cash Given</span>
                      <span className="font-bold text-amber-300">₹{selectedTxDetail.givenAmount}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Change Returned</span>
                      <span className="font-bold text-emerald-300">₹{selectedTxDetail.changeAmount}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Payment Mode</span>
                  <span className="font-semibold text-indigo-300 uppercase">{selectedTxDetail.paymentMode}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Category</span>
                  <span className="font-medium text-slate-200">{selectedTxDetail.category}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono text-slate-300">{formatDate(selectedTxDetail.dateTime)}</span>
                </div>
                {selectedTxDetail.remarks && (
                  <div className="py-1">
                    <span className="text-slate-400 block mb-1">Remarks</span>
                    <p className="p-2.5 bg-slate-800 rounded-xl text-slate-200">{selectedTxDetail.remarks}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const txToEdit = selectedTxDetail;
                    setSelectedTxDetail(null);
                    setEditingTx(txToEdit);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Record</span>
                </button>
                <button
                  onClick={() => setSelectedTxDetail(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
      />

    </div>
  );
};
