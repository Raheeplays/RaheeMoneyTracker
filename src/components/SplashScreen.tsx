import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Wallet, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'loading' | 'finishing'>('loading');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStage('finishing');
    }, 1200);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 'finishing' ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 select-none overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Main Logo Shield Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
            <ShieldCheck className="w-12 h-12 text-emerald-400" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 border border-emerald-500/30 rounded-[22px]"
            />
          </div>
        </div>

        {/* Floating status tag */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap"
        >
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="text-[11px] font-bold text-slate-200">Vault Encrypted</span>
        </motion.div>
      </motion.div>

      {/* Title & Tagline */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2 max-w-sm"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>MONEY TRACKER</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Secure Personal Cash & Note Serial Management System
        </p>
      </motion.div>

      {/* Loading bar indicator */}
      <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-10 overflow-hidden relative border border-slate-700/50">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
        />
      </div>

      <p className="text-[11px] text-slate-500 mt-3 font-mono">
        Initializing End-to-End Vault Security...
      </p>
    </motion.div>
  );
};
