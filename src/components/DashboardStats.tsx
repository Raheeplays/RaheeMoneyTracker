import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { EditMoneyValuesModal } from './EditMoneyValuesModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Edit3
} from 'lucide-react';

interface DashboardStatsProps {
  onOpenDetailedCash?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onOpenDetailedCash }) => {
  const {

    totalCredit,
    totalDebit,
    totalAtmWithdrawal,
    netBalance,
    cashBalance,
    onlineBalance,
    totalTrackedNotesValue,
  } = useTransactions();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'credit' | 'debit' | 'all'>('all');

  const openEditModal = (tab: 'credit' | 'debit' | 'all') => {
    setModalTab(tab);
    setIsEditModalOpen(true);
  };

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalVolume = totalCredit + totalDebit || 1;
  const creditPercent = Math.min(100, Math.round((totalCredit / totalVolume) * 100));
  const debitPercent = Math.min(100, Math.round((totalDebit / totalVolume) * 100));

  return (
    <div className="space-y-4">
      {/* Top Header Bar with Edit Button */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Financial Summary Overview</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenDetailedCash && (
            <button
              onClick={onOpenDetailedCash}
              className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Detailed Cash Manager</span>
            </button>
          )}

          <button
            onClick={() => openEditModal('all')}
            className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-xl text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rewrite Money / Credit</span>
          </button>
        </div>
      </div>

      {/* Primary Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <button
              onClick={() => openEditModal('all')}
              title="Edit Money Values"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-all flex items-center gap-1 text-[11px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatRupee(netBalance)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Overall Cash & Bank status</span>
          </div>
        </div>

        {/* Total Credit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Credit (Income)
            </span>
            <button
              onClick={() => openEditModal('credit')}
              title="Edit Credit Income Value"
              className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/60 transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            +{formatRupee(totalCredit)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Money received / credited</span>
          </div>
        </div>

        {/* Total Debit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Debit (Expenses)
            </span>
            <button
              onClick={() => openEditModal('debit')}
              title="Edit Expenses"
              className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900 border border-rose-800/60 transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
            -{formatRupee(totalDebit)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Money given / spent</span>
          </div>
        </div>

        {/* Total ATM Withdrawal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ATM Cash Out
            </span>
            <button
              onClick={() => openEditModal('all')}
              title="Edit Money Values"
              className="p-1.5 rounded-lg bg-sky-950/60 text-sky-400 hover:bg-sky-900 border border-sky-800/60 transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight">
            {formatRupee(totalAtmWithdrawal)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span>Total cash withdrawn from ATM</span>
          </div>
        </div>

      </div>

      {/* Secondary Breakdown & Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cash in Hand */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Cash Balance (Offline)</p>
              <p className="text-lg font-bold text-slate-100">{formatRupee(cashBalance)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-amber-400 font-medium block">Tracked Notes</span>
            <span className="text-xs font-semibold text-slate-300">{formatRupee(totalTrackedNotesValue)}</span>
          </div>
        </div>

        {/* Online UPI Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Online UPI Balance</p>
              <p className="text-lg font-bold text-slate-100">{formatRupee(onlineBalance)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-indigo-400 font-medium block">Digital / Bank</span>
            <span className="text-xs font-semibold text-slate-300">GPay/PhonePe</span>
          </div>
        </div>

        {/* Credit vs Debit Progress Ratio */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-emerald-400">Credit ({creditPercent}%)</span>
            <span className="text-rose-400">Debit ({debitPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${creditPercent}%` }}
            ></div>
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${debitPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">
            Income vs Expense Volume Ratio
          </p>
        </div>

      </div>

      {/* Edit Money Values Modal */}
      <EditMoneyValuesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
};

