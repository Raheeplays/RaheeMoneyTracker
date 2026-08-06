import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { TransactionType, PaymentMode } from '../types';
import {
  X,
  PlusCircle,
  Banknote,
  Smartphone,
  Building2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Tag,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, quickTemplates, currencyNotes } = useTransactions();
  const { currentUser } = useAuth();

  const [type, setType] = useState<TransactionType>('debit');
  const [amount, setAmount] = useState<string>('');
  const [givenAmount, setGivenAmount] = useState<string>('');
  const [recipientOrSource, setRecipientOrSource] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries / Store');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [dateTime, setDateTime] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [remarks, setRemarks] = useState<string>('');
  const [selectedNoteSerials, setSelectedNoteSerials] = useState<string[]>([]);
  const [customSerialInput, setCustomSerialInput] = useState<string>('');

  // Auto calculate change amount
  const actualAmtNum = parseFloat(amount) || 0;
  const givenAmtNum = parseFloat(givenAmount) || 0;
  const changeAmtNum = givenAmtNum > actualAmtNum ? givenAmtNum - actualAmtNum : 0;

  // Sync mode when selecting quick template
  const handleSelectTemplate = (templateId: string) => {
    const tpl = quickTemplates.find((t) => t.id === templateId);
    if (tpl) {
      setRecipientOrSource(tpl.name);
      setCategory(tpl.category);
      setPaymentMode(tpl.defaultPaymentMode);
    }
  };

  const handleToggleNoteSerial = (serial: string) => {
    if (selectedNoteSerials.includes(serial)) {
      setSelectedNoteSerials(selectedNoteSerials.filter((s) => s !== serial));
    } else {
      setSelectedNoteSerials([...selectedNoteSerials, serial]);
    }
  };

  const handleAddCustomNoteSerial = () => {
    if (!customSerialInput.trim()) return;
    const formatted = customSerialInput.trim();
    if (!selectedNoteSerials.includes(formatted)) {
      setSelectedNoteSerials([...selectedNoteSerials, formatted]);
    }
    setCustomSerialInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || actualAmtNum <= 0) return;
    if (!recipientOrSource.trim()) return;

    await addTransaction({
      type,
      amount: actualAmtNum,
      givenAmount: givenAmtNum > 0 ? givenAmtNum : actualAmtNum,
      changeAmount: changeAmtNum,
      recipientOrSource: recipientOrSource.trim(),
      category,
      paymentMode,
      dateTime: new Date(dateTime).toISOString(),
      remarks: remarks.trim(),
      linkedNoteSerialNumbers: selectedNoteSerials,
      createdByName: currentUser?.name || 'Rahee',
    });

    // Reset Form
    setAmount('');
    setGivenAmount('');
    setRecipientOrSource('');
    setRemarks('');
    setSelectedNoteSerials([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl text-slate-100 relative overflow-hidden"
        >
          {/* Sticky Fixed Header - Close button is ALWAYS visible */}
          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-slate-900 shrink-0 z-20">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Add Money Log Record</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Record detailed Credit, Debit, ATM Cash, or Store Change
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

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            
            {/* Transaction Type Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('debit');
                    if (paymentMode === 'atm_cash') setPaymentMode('cash');
                  }}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    type === 'debit'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Debit (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('credit');
                    if (paymentMode === 'atm_cash') setPaymentMode('online_upi');
                  }}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    type === 'credit'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Credit (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('atm_withdrawal');
                    setPaymentMode('atm_cash');
                    setCategory('ATM Cash Out');
                    setRecipientOrSource('ATM Cash Withdrawal');
                  }}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    type === 'atm_withdrawal'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>ATM Cash</span>
                </button>
              </div>
            </div>

            {/* Quick Templates Dropdown Selection */}
            {type !== 'atm_withdrawal' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Quick Preset Dropdown / Template (Optional)
                </label>
                <select
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose from Presets (Store, Driver, Bills, etc.) --</option>
                  {quickTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recipient / Source ("Kisko Diye / Kab Diya") */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {type === 'debit' ? 'Kisko Diye (Given To / Recipient)' : type === 'credit' ? 'Kisse Mile (Received From)' : 'ATM Location / Bank'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientOrSource}
                  onChange={(e) => setRecipientOrSource(e.target.value)}
                  placeholder={type === 'debit' ? 'e.g., Retail Store, Driver, Milkman' : 'e.g., Salary, Client, Friend'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Amounts Section: Actual Amount & Change Amount Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Actual Money Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Given Amount (For Cash & Change calculation) */}
              {paymentMode === 'cash' && type === 'debit' && (
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
                    <span>Given Note (Rupees)</span>
                    <span className="text-[10px] text-slate-400">For Change calc</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={givenAmount}
                    onChange={(e) => setGivenAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-1.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Live Change Amount Calculation Result */}
              {paymentMode === 'cash' && type === 'debit' && givenAmtNum > 0 && (
                <div className="sm:col-span-2 bg-emerald-950/40 border border-emerald-800/60 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Change Returned to You:</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-700">
                    ₹{changeAmtNum} (Returned)
                  </span>
                </div>
              )}
            </div>

            {/* Payment Mode (Offline Cash vs Online UPI vs ATM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Payment Mode (Offline / Online)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('online_upi')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'online_upi'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Online UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('atm_cash');
                    setType('atm_withdrawal');
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'atm_cash'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>ATM Cash</span>
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date & Time (Log Timestamp)
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Remarks / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Remarks / Additional Details
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="e.g., bought biscuits, snacks, milk, monthly electricity bill note..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Note Serial Numbers Link Section */}
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Link Physical Note Serials (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">Serials</span>
              </div>

              {/* Pick from existing tracked notes in wallet */}
              {currencyNotes.filter((n) => n.status === 'in_wallet').length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {currencyNotes
                    .filter((n) => n.status === 'in_wallet')
                    .map((note) => {
                      const isSelected = selectedNoteSerials.includes(note.serialNumber);
                      return (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleToggleNoteSerial(note.serialNumber)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-500/50'
                          }`}
                        >
                          ₹{note.denomination} ({note.serialNumber})
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Add custom note serial number */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSerialInput}
                  onChange={(e) => setCustomSerialInput(e.target.value)}
                  placeholder="e.g., 500-9AB123456"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-amber-200"
                />
                <button
                  type="button"
                  onClick={handleAddCustomNoteSerial}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-semibold rounded-lg shrink-0"
                >
                  + Add Serial
                </button>
              </div>

              {selectedNoteSerials.length > 0 && (
                <div className="text-[10px] text-slate-300">
                  Linked: <span className="font-mono text-amber-400">{selectedNoteSerials.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 sticky bottom-0 bg-slate-900/95 backdrop-blur-md pb-1 z-10">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
              >
                Save Transaction Record
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
