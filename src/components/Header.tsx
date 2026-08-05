import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import {
  Wallet,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  CreditCard,
  Banknote,
  Sliders,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: 'dashboard' | 'notes' | 'reconcile' | 'admin' | 'export';
  setActiveTab: (tab: 'dashboard' | 'notes' | 'reconcile' | 'admin' | 'export') => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAuthModal,
  theme,
  toggleTheme,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { netBalance, totalCredit, totalDebit } = useTransactions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* App Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Money Tracker
                </h1>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Rahee
                  </span>
                ) : currentUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <User className="w-3 h-3" /> {currentUser.name}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Expense, ATM, UPI & Note Serial Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Logs & Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Note Serials</span>
            </button>

            <button
              onClick={() => setActiveTab('reconcile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reconcile'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Difference</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Admin Presets</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'export'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export</span>
            </button>
          </nav>

          {/* Right Section: Add Transaction + Theme Switcher + Auth controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 dark:text-amber-300 border border-slate-700 transition-all flex items-center justify-center active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Record</span>
              <span className="sm:hidden">Add</span>
            </button>

            {currentUser ? (
              <button
                onClick={logout}
                title="Logout"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin / Login</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2"
          >
            {/* Balance Summary in Mobile Nav */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 mb-2 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Total Net Balance</p>
                <p className="text-base font-bold text-emerald-400">{formatCurrency(netBalance)}</p>
              </div>
              <div className="flex gap-3 text-xs">
                <div>
                  <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                    <TrendingUp className="w-3 h-3" /> +{totalCredit}
                  </span>
                </div>
                <div>
                  <span className="text-rose-400 flex items-center gap-0.5 font-medium">
                    <TrendingDown className="w-3 h-3" /> -{totalDebit}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Logs & Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('notes');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Note Serial Database</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('reconcile');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'reconcile'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Difference & Reconciliation</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Admin Presets</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('export');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'export'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Reports</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({currentUser.name})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin / User Login</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
