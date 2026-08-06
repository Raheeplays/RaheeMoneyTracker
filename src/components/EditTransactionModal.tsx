import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { Transaction, TransactionType, PaymentMode } from '../types';
import {
  X,
  Edit3,
  Banknote,
  Smartphone,
  Building2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Save,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { updateTransaction, quickTemplates } = useTransactions();

  const [type, setType] = useState<TransactionType>('debit');
  const [amount, setAmount] = useState<string>('');
  const [givenAmount, setGivenAmount] = useState<string>('');
  const [recipientOrSource, setRecipientOrSource] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries / Store');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [dateTime, setDateTime] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setGivenAmount(transaction.givenAmount ? transaction.givenAmount.toString() : '');
      setRecipientOrSource(transaction.recipientOrSource || '');
      setCategory(transaction.category || 'Groceries / Store');
      setPaymentMode(transaction.paymentMode || 'cash');
      setRemarks(transaction.remarks || '');
      try {
        const dt = new Date(transaction.dateTime);
        const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDateTime(isoLocal);
      } catch {
        setDateTime(new Date().toISOString().slice(0, 16));
      }
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const actualAmtNum = parseFloat(amount) || 0;
  const givenAmtNum = parseFloat(givenAmount) || 0;
  const changeAmtNum = givenAmtNum > actualAmtNum ? givenAmtNum - actualAmtNum : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || actualAmtNum <= 0) return;
    if (!recipientOrSource.trim()) return;

    await updateTransaction(transaction.id, {
      type,
      amount: actualAmtNum,
      givenAmount: givenAmtNum > 0 ? givenAmtNum : actualAmtNum,
      changeAmount: changeAmtNum,
      recipientOrSource: recipientOrSource.trim(),
      category,
      paymentMode,
      dateTime: new Date(dateTime).toISOString(),
      remarks: remarks.trim(),
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl text-slate-100 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-slate-900 shrink-0 z-20">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Edit {transaction.type === 'credit' ? 'Credit (Income)' : 'Transaction'} Record</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Update amount, recipient name, payment method, or category
              </p>
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            
            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('debit')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'debit'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Debit (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('credit')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'credit'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Credit (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('atm_withdrawal');
                    setPaymentMode('atm_cash');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'atm_withdrawal'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>ATM Withdrawal</span>
                </button>
              </div>
            </div>

            {/* Recipient / Source ("Who Received / Kisko Diye / Kisse Mile") */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {type === 'debit' ? 'Who Received (Kisko Diye)' : type === 'credit' ? 'Received From (Kisse Mile)' : 'ATM Location / Bank'} *
              </label>
              <input
                type="text"
                value={recipientOrSource}
                onChange={(e) => setRecipientOrSource(e.target.value)}
                placeholder="e.g. Retail Store, Driver, Milkman, Salary"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-base font-bold text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Given amount for cash */}
              {paymentMode === 'cash' && type === 'debit' && (
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    Given Note (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={givenAmount}
                    onChange={(e) => setGivenAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3.5 py-2 text-base font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {paymentMode === 'cash' && type === 'debit' && givenAmtNum > 0 && (
                <div className="sm:col-span-2 bg-emerald-950/40 border border-emerald-800/60 p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" /> Return Change:
                  </span>
                  <span className="font-bold text-emerald-300">₹{changeAmtNum}</span>
                </div>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMode === 'cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-400" />
                  <span>Offline (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('online_upi')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMode === 'online_upi'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Online (UPI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('atm_cash');
                    setType('atm_withdrawal');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all col-span-2 sm:col-span-1 ${
                    paymentMode === 'atm_cash'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>ATM Cash</span>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Remarks or description..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Record</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
