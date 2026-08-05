import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Clock, AlertTriangle, KeyRound, CheckCircle, RefreshCw, X, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin, loginAsUser, signUpUser, adminOtpState, resetAdminOtpTimer } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'user' | 'signup' | 'admin'>('user');
  
  // Admin form state
  const [adminName, setAdminName] = useState('Rahee');
  const [adminPass, setAdminPass] = useState('78692');
  const [adminOtp, setAdminOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // User form state
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');

  // Start OTP timer as soon as admin tab opens or modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'admin') {
      resetAdminOtpTimer();
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginAsAdmin(adminName, adminPass, adminOtp);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!userUsername.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }

    const res = loginAsUser(userUsername.trim());
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!userName.trim() || !userUsername.trim()) {
      setErrorMessage('Please provide both full name and username.');
      return;
    }

    const res = signUpUser(userName, userUsername);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const fillAdminCredentials = () => {
    setAdminName('Rahee');
    setAdminPass('78692');
    setAdminOtp('181855');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Money Tracker Security Vault</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in or request user approval to access financial records
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setActiveTab('user'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'user'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'signup'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin (Rahee)</span>
            </button>
          </div>

          {/* USER SIGN IN FORM */}
          {activeTab === 'user' && (
            <form onSubmit={handleUserLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Username *
                </label>
                <input
                  type="text"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98"
              >
                Sign In To Vault
              </button>
            </form>
          )}

          {/* USER SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username / User ID *
                </label>
                <input
                  type="text"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl text-[11px] text-amber-300 space-y-1">
                <p className="font-bold">🔒 Admin Approval Security Rule:</p>
                <p className="opacity-90">
                  New accounts require approval by Admin Rahee before profile data is activated.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98"
              >
                Register Account (Send For Approval)
              </button>
            </form>
          )}

          {/* ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              
              {/* 16-Second Countdown Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                adminOtpState.isExpired
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Clock className={`w-5 h-5 ${adminOtpState.isExpired ? 'text-rose-400 animate-bounce' : 'text-amber-400 animate-spin'}`} />
                  <div>
                    <p className="text-xs font-bold">
                      {adminOtpState.isExpired
                        ? '16-Second OTP Expired!'
                        : `Admin OTP Window: ${adminOtpState.timeLeft}s remaining`}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {adminOtpState.isExpired
                        ? 'Admin login strictly locked until page reload.'
                        : 'Required Admin OTP code: 181855'}
                    </p>
                  </div>
                </div>

                {!adminOtpState.isExpired && (
                  <div className="w-10 h-10 relative flex items-center justify-center font-mono text-sm font-bold text-amber-300 bg-amber-900/40 rounded-full border border-amber-700">
                    {adminOtpState.timeLeft}
                  </div>
                )}
              </div>

              {adminOtpState.isExpired && (
                <div className="bg-rose-900/30 border border-rose-700/60 p-3 rounded-xl text-center space-y-2">
                  <p className="text-xs text-rose-200 font-medium flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Admin access locked! 16s timeout reached.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page To Reset OTP
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Name (Required: Rahee)
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={adminOtpState.isExpired}
                  placeholder="Rahee"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Password (Required: 78692)
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  disabled={adminOtpState.isExpired}
                  placeholder="78692"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Admin OTP Code (Required: 181855)
                  </label>
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <KeyRound className="w-3 h-3" /> Quick Auto-Fill
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value)}
                  disabled={adminOtpState.isExpired}
                  placeholder="181855"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-widest text-center text-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={adminOtpState.isExpired}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98"
              >
                Login As Admin Rahee
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

