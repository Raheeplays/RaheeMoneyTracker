import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { PaymentMode, TransactionType } from '../types';
import {
  Zap,
  Banknote,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Store,
  User,
  RotateCcw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickAddWidgetProps {
  onOpenDetailedCash?: () => void;
}

export const QuickAddWidget: React.FC<QuickAddWidgetProps> = ({ onOpenDetailedCash }) => {
  const { addTransaction, quickTemplates } = useTransactions();
  const { currentUser } = useAuth();


  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<TransactionType>('debit');
  const [amount, setAmount] = useState<string>('');
  const [givenAmount, setGivenAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [category, setCategory] = useState<string>('General');
  const [remarks, setRemarks] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const numAmount = parseFloat(amount) || 0;
  const numGiven = parseFloat(givenAmount) || 0;
  const changeReturned = numGiven > numAmount ? numGiven - numAmount : 0;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    setStep(2);
  };

  const handleQuickPresetSelect = (templateName: string, tplCategory: string, defaultMode: PaymentMode) => {
    setRecipient(templateName);
    setCategory(tplCategory);
    setPaymentMode(defaultMode);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (numAmount <= 0 || !recipient.trim()) return;

    await addTransaction({
      type,
      amount: numAmount,
      givenAmount: numGiven > 0 ? numGiven : numAmount,
      changeAmount: changeReturned,
      recipientOrSource: recipient.trim(),
      category: category || (type === 'credit' ? 'Income' : 'Expense'),
      paymentMode,
      dateTime: new Date().toISOString(),
      remarks: remarks.trim(),
      createdByName: currentUser?.name || 'Rahee',
    });

    // Reset & show confirmation
    setSuccessMsg(`Added ₹${numAmount} for ${recipient}!`);
    setAmount('');
    setGivenAmount('');
    setRecipient('');
    setRemarks('');
    setStep(1);

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      
      {/* Decorative accent background glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Quick Home Screen Add</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Easy Flow
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {step === 1 ? 'Step 1: Enter Amount & Type' : 'Step 2: Who received & Payment method?'}
            </p>
          </div>
        </div>

        {/* Step indicator & Detailed Cash Button */}
        <div className="flex items-center gap-2">
          {onOpenDetailedCash && (
            <button
              type="button"
              onClick={onOpenDetailedCash}
              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Detailed Cash</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-1">
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${step === 1 ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-700'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${step === 2 ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-700'}`}></span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: Amount & Type */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          
          {/* Type Buttons */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('debit');
                if (paymentMode === 'atm_cash') setPaymentMode('cash');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'debit'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Debit (-)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('credit');
                if (paymentMode === 'atm_cash') setPaymentMode('online_upi');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'credit'
                  ? 'bg-emerald-600 text-white shadow-md'
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
                setRecipient('ATM Withdrawal');
                setCategory('ATM Cash Out');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'atm_withdrawal'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>ATM Cash</span>
            </button>
          </div>

          {/* Amount Field */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-extrabold text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00 Enter Amount"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-xl font-black text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={numAmount <= 0}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                numAmount > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: System asks who received and payment mode */}
      {step === 2 && (
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${
                type === 'credit' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {type.toUpperCase()}
              </span>
              <span className="text-lg font-black text-white">₹{numAmount}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline"
            >
              <RotateCcw className="w-3 h-3" /> Change Amount
            </button>
          </div>

          {/* Who received / Who gave? */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{type === 'debit' ? '1. Who Received? (Kisko Diye)' : type === 'credit' ? '1. Received From? (Kisse Mile)' : '1. ATM Location'} *</span>
              <span className="text-[10px] text-emerald-400">Click preset or type</span>
            </label>

            {/* Quick Presets row */}
            {quickTemplates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickTemplates.slice(0, 5).map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleQuickPresetSelect(tpl.name, tpl.category, tpl.defaultPaymentMode)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      recipient === tpl.name
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={type === 'debit' ? 'e.g., Driver, Store, Milkman, Electricity' : 'e.g., Salary, Client, Friend'}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
              required
              autoFocus
            />
          </div>

          {/* Payment Mode Selection: Cash vs UPI */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Payment Mode (Cash or UPI) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-400" />
                <span>Offline (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('online_upi')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMode === 'online_upi'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
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
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all col-span-2 sm:col-span-1 ${
                  paymentMode === 'atm_cash'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 ring-1 ring-sky-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>ATM Withdrawal</span>
              </button>
            </div>
          </div>

          {/* Given Note field for change calculation if cash */}
          {paymentMode === 'cash' && type === 'debit' && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Given Note (Rupees given)
                </label>
                <input
                  type="number"
                  step="any"
                  value={givenAmount}
                  onChange={(e) => setGivenAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-sm font-bold text-amber-300 focus:outline-none"
                />
              </div>

              {numGiven > numAmount && (
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">Change Return to You:</span>
                  <span className="text-base font-extrabold text-emerald-400">₹{changeReturned}</span>
                </div>
              )}
            </div>
          )}

          {/* Remarks Optional */}
          <div>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks / Note (Optional, e.g. bought snacks)"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={!recipient.trim()}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                recipient.trim()
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Save Money Record</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
