import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { NoteDenominationBreakdown, PaymentMode } from '../types';
import {
  Banknote,
  PlusCircle,
  Hash,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle,
  FileText,
  Calculator,
  Phone,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DetailedCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export const DetailedCashModal: React.FC<DetailedCashModalProps> = ({ isOpen, onClose }) => {
  const {
    cashBalance,
    currencyNotes,
    addTransaction,
    addCurrencyNote,
    totalTrackedNotesValue
  } = useTransactions();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'given' | 'received' | 'add_note'>('given');

  // Form State for Cash Given / Received
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [category, setCategory] = useState('Cash Handover / Loan');
  const [remarks, setRemarks] = useState('');

  // Note Denominations count: { 500: 2, 200: 1, ... }
  const [counts, setCounts] = useState<{ [denom: number]: number }>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });

  // Serial numbers input
  const [serialNumbersText, setSerialNumbersText] = useState('');

  // Single Note form
  const [singleDenom, setSingleDenom] = useState(500);
  const [singleSerial, setSingleSerial] = useState('');
  const [singleRemarks, setSingleRemarks] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Calculate total cash amount from note counts
  const calculatedTotal = Object.entries(counts).reduce<number>(
    (sum, [denomStr, count]) => sum + Number(denomStr) * (Number(count) || 0),
    0
  );

  const handleDenomChange = (denom: number, val: string) => {
    const num = parseInt(val, 10) || 0;
    setCounts((prev) => ({ ...prev, [denom]: Math.max(0, num) }));
  };

  const handleRecordCashParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || calculatedTotal <= 0) return;

    // Parse serial numbers array
    const serialsList = serialNumbersText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const type = activeTab === 'given' ? 'debit' : 'credit';

    await addTransaction({
      type,
      amount: calculatedTotal,
      recipientOrSource: personName.trim(),
      category: category || 'Cash Exchange',
      paymentMode: 'cash',
      dateTime: new Date().toISOString(),
      remarks: remarks.trim() ? `${remarks.trim()} (Cash Notes Tracked)` : 'Detailed Cash Exchange',
      denominations: counts,
      cashPersonPhone: personPhone.trim(),
      linkedNoteSerialNumbers: serialsList,
    });

    // Automatically add note serials to Currency Notes tracker if provided
    for (const serial of serialsList) {
      await addCurrencyNote({
        denomination: 500, // Default or matching
        serialNumber: serial,
        status: activeTab === 'given' ? 'given' : 'in_wallet',
        remarks: `${activeTab === 'given' ? 'Given to' : 'Received from'} ${personName.trim()}`,
        createdAt: new Date().toISOString(),
      });
    }

    setSuccessMsg(`Cash transaction of ₹${calculatedTotal.toLocaleString('en-IN')} recorded!`);
    setPersonName('');
    setPersonPhone('');
    setRemarks('');
    setSerialNumbersText('');
    setCounts({ 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  const handleAddSingleNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleSerial.trim()) return;

    await addCurrencyNote({
      denomination: singleDenom,
      serialNumber: singleSerial.trim().toUpperCase(),
      status: 'in_wallet',
      remarks: singleRemarks.trim() || 'Added to physical wallet',
      createdAt: new Date().toISOString(),
    });

    setSuccessMsg(`Note ₹${singleDenom} (${singleSerial.trim().toUpperCase()}) added to Wallet!`);
    setSingleSerial('');
    setSingleRemarks('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl text-slate-100 relative overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Detailed Cash Manager</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Secure Vault
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track cash in wallet, party handovers, note denominations & serial numbers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet Summary Header */}
          <div className="grid grid-cols-2 gap-3 my-4 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Net Cash In Wallet</span>
              </p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                ₹{cashBalance.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tracked Notes Sum</span>
              </p>
              <p className="text-xl font-black text-indigo-300 mt-1">
                ₹{totalTrackedNotesValue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1 rounded-2xl mb-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('given')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'given'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Cash Given To</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'received'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Cash Received From</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add_note')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'add_note'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Note Serial</span>
            </button>
          </div>

          {/* TAB 1 & 2: CASH GIVEN / RECEIVED WITH DENOMINATIONS */}
          {(activeTab === 'given' || activeTab === 'received') && (
            <form onSubmit={handleRecordCashParty} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {activeTab === 'given' ? 'Cash Given To (Name) *' : 'Cash Received From (Name) *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g., Shopkeeper, Maid, Friend"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={personPhone}
                      onChange={(e) => setPersonPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Denomination Counter Grid */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Currency Note Denomination Counter</span>
                  </h3>
                  <span className="text-sm font-black text-emerald-400">
                    Total: ₹{calculatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                  {DENOMINATIONS.map((denom) => (
                    <div
                      key={denom}
                      className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-amber-300">₹{denom}</span>
                      <input
                        type="number"
                        min="0"
                        value={counts[denom] || ''}
                        onChange={(e) => handleDenomChange(denom, e.target.value)}
                        placeholder="0"
                        className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Note Serial Numbers */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Serial Numbers (Comma Separated, e.g. 9AB 123456, 8CD 654321)
                </label>
                <input
                  type="text"
                  value={serialNumbersText}
                  onChange={(e) => setSerialNumbersText(e.target.value)}
                  placeholder="9AB 123456, 4XY 789101"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Remarks / Purpose
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Monthly rent advance, shop goods payment"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={calculatedTotal <= 0}
                className={`w-full py-3.5 text-white font-bold rounded-2xl text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 ${
                  activeTab === 'given'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
                }`}
              >
                Record {activeTab === 'given' ? 'Cash Given' : 'Cash Received'} (₹{calculatedTotal.toLocaleString('en-IN')})
              </button>
            </form>
          )}

          {/* TAB 3: ADD SINGLE NOTE SERIAL */}
          {activeTab === 'add_note' && (
            <form onSubmit={handleAddSingleNote} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Denomination *
                </label>
                <select
                  value={singleDenom}
                  onChange={(e) => setSingleDenom(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                >
                  {DENOMINATIONS.map((d) => (
                    <option key={d} value={d}>
                      ₹{d} Currency Note
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Serial Number (Unique Code) *
                </label>
                <input
                  type="text"
                  value={singleSerial}
                  onChange={(e) => setSingleSerial(e.target.value)}
                  placeholder="e.g., 9AB 123456"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-emerald-300 uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Remarks / Note Info
                </label>
                <input
                  type="text"
                  value={singleRemarks}
                  onChange={(e) => setSingleRemarks(e.target.value)}
                  placeholder="e.g., Received from bank ATM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-md transition-all active:scale-98"
              >
                Add Note Serial To Wallet Database
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
