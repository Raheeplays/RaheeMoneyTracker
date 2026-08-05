import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Banknote,
  Sliders,
  FileSpreadsheet,
  Plus,
  Scale
} from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'notes' | 'reconcile' | 'admin' | 'export';
  setActiveTab: (tab: 'dashboard' | 'notes' | 'reconcile' | 'admin' | 'export') => void;
  onOpenAddModal: () => void;
  isAdmin: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  isAdmin,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800 dark:border-slate-800 light:border-slate-200 px-3 py-2 shadow-2xl transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* Home / Dashboard Tab */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Difference & Reconciliation Tab */}
        <button
          onClick={() => setActiveTab('reconcile')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
            activeTab === 'reconcile'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Diff</span>
        </button>

        {/* Center Prominent Add Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform active:scale-95"
            title="Quick Add Transaction"
          >
            <Plus className="w-7 h-7 text-slate-950 stroke-[3]" />
          </button>
        </div>

        {/* Note Serials Tab */}
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
            activeTab === 'notes'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Banknote className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Notes</span>
        </button>

        {/* Admin or Export Tab */}
        {isAdmin ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'text-emerald-500 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('export')}
            className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all ${
              activeTab === 'export'
                ? 'text-emerald-500 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Export</span>
          </button>
        )}

      </div>
    </div>
  );
};
