/**
 * Money Tracker Application
 * Fully responsive React + Tailwind + Firebase + Framer Motion
 * Author: Rahee
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { DashboardStats } from './components/DashboardStats';
import { QuickAddWidget } from './components/QuickAddWidget';
import { TransactionList } from './components/TransactionList';
import { CurrencyNotesView } from './components/CurrencyNotesView';
import { AdminPanel } from './components/AdminPanel';
import { ExportModal } from './components/ExportModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { DetailedCashModal } from './components/DetailedCashModal';
import { ReconciliationTab } from './components/ReconciliationTab';
import { motion, AnimatePresence } from 'motion/react';

function MoneyTrackerApp() {
  const { isAdmin, currentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'reconcile' | 'admin' | 'export'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDetailedCashModalOpen, setIsDetailedCashModalOpen] = useState(false);

  // Theme state: dark or light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('money_tracker_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('money_tracker_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Show Splash Screen first on boot
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // If user is logged in but status is 'pending', display PendingApprovalScreen
  if (currentUser && currentUser.status === 'pending') {
    return <PendingApprovalScreen />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-slate-950 ${
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <QuickAddWidget onOpenDetailedCash={() => setIsDetailedCashModalOpen(true)} />
              <DashboardStats onOpenDetailedCash={() => setIsDetailedCashModalOpen(true)} />
              <TransactionList />
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CurrencyNotesView />
            </motion.div>
          )}

          {activeTab === 'reconcile' && (
            <motion.div
              key="reconcile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReconciliationTab />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel />
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ExportModal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 pb-20">
        <p>Money Tracker &copy; {new Date().getFullYear()} • Designed for Rahee • Secured with Firebase Vault</p>
      </footer>

      {/* Sticky Bottom Navigation Tab Bar */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <DetailedCashModal
        isOpen={isDetailedCashModalOpen}
        onClose={() => setIsDetailedCashModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <MoneyTrackerApp />
      </TransactionProvider>
    </AuthProvider>
  );
}
