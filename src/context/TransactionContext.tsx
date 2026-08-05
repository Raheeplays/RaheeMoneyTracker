import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, CurrencyNote, QuickTemplate, TransactionType, PaymentMode } from '../types';
import { DEFAULT_QUICK_TEMPLATES, INITIAL_TRANSACTIONS, INITIAL_CURRENCY_NOTES } from '../data/initialData';
import { db } from '../firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[]; // Filtered for current user scope
  allTransactionsAdmin: Transaction[]; // Admin view of all users' data
  currencyNotes: CurrencyNote[];
  quickTemplates: QuickTemplate[];
  loading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  addCurrencyNote: (note: Omit<CurrencyNote, 'id'>) => Promise<void>;
  updateNoteStatus: (id: string, status: 'in_wallet' | 'given' | 'received', txId?: string) => Promise<void>;
  deleteCurrencyNote: (id: string) => Promise<void>;
  addQuickTemplate: (template: Omit<QuickTemplate, 'id'>) => Promise<void>;
  deleteQuickTemplate: (id: string) => Promise<void>;
  // Summary Stats
  totalCredit: number;
  totalDebit: number;
  totalAtmWithdrawal: number;
  netBalance: number;
  cashBalance: number;
  onlineBalance: number;
  totalTrackedNotesValue: number;
  // Admin filter
  selectedUserFilter: string;
  setSelectedUserFilter: (uid: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  const [rawTransactions, setRawTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moneytracker_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_TRANSACTIONS; }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [rawCurrencyNotes, setRawCurrencyNotes] = useState<CurrencyNote[]>(() => {
    const saved = localStorage.getItem('moneytracker_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_CURRENCY_NOTES; }
    }
    return INITIAL_CURRENCY_NOTES;
  });

  const [quickTemplates, setQuickTemplates] = useState<QuickTemplate[]>(() => {
    const saved = localStorage.getItem('moneytracker_templates');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_QUICK_TEMPLATES; }
    }
    return DEFAULT_QUICK_TEMPLATES;
  });

  const [loading, setLoading] = useState(false);

  // Realtime Database synchronization
  useEffect(() => {
    let unsubscribeTx: (() => void) | null = null;
    let unsubscribeNotes: (() => void) | null = null;
    let unsubscribeTemplates: (() => void) | null = null;

    try {
      // Transactions listener
      const txRef = ref(db, 'transactions');
      unsubscribeTx = onValue(txRef, (snapshot) => {
        if (snapshot.exists()) {
          const list: Transaction[] = [];
          snapshot.forEach((childSnap) => {
            const val = childSnap.val();
            if (val && typeof val === 'object') {
              list.push({ id: childSnap.key || val.id, ...val });
            }
          });
          list.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
          setRawTransactions(list);
          localStorage.setItem('moneytracker_transactions', JSON.stringify(list));
        }
      }, (err) => {
        console.info('RTDB transaction sync info:', err.message);
      });

      // Currency Notes listener
      const notesRef = ref(db, 'currency_notes');
      unsubscribeNotes = onValue(notesRef, (snapshot) => {
        if (snapshot.exists()) {
          const list: CurrencyNote[] = [];
          snapshot.forEach((childSnap) => {
            const val = childSnap.val();
            if (val && typeof val === 'object') {
              list.push({ id: childSnap.key || val.id, ...val });
            }
          });
          setRawCurrencyNotes(list);
          localStorage.setItem('moneytracker_notes', JSON.stringify(list));
        }
      }, (err) => {
        console.info('RTDB notes sync info:', err.message);
      });

      // Templates listener
      const tplRef = ref(db, 'quick_templates');
      unsubscribeTemplates = onValue(tplRef, (snapshot) => {
        if (snapshot.exists()) {
          const list: QuickTemplate[] = [];
          snapshot.forEach((childSnap) => {
            const val = childSnap.val();
            if (val && typeof val === 'object') {
              list.push({ id: childSnap.key || val.id, ...val });
            }
          });
          setQuickTemplates(list);
          localStorage.setItem('moneytracker_templates', JSON.stringify(list));
        }
      }, (err) => {
        console.info('RTDB templates sync info:', err.message);
      });
    } catch (e) {
      console.warn('Realtime Database fallback active:', e);
    }

    return () => {
      if (unsubscribeTx) unsubscribeTx();
      if (unsubscribeNotes) unsubscribeNotes();
      if (unsubscribeTemplates) unsubscribeTemplates();
    };
  }, []);

  // Filter Data Strictly Based on User Role & Auth Isolation
  const visibleTransactions = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      if (selectedUserFilter !== 'all') {
        return rawTransactions.filter((t) => t.userId === selectedUserFilter);
      }
      return rawTransactions;
    }
    // Regular User: Strictly isolate User A from User B
    return rawTransactions.filter((t) => t.userId === currentUser.uid);
  }, [rawTransactions, currentUser, isAdmin, selectedUserFilter]);

  const visibleCurrencyNotes = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      if (selectedUserFilter !== 'all') {
        return rawCurrencyNotes.filter((n) => n.userId === selectedUserFilter);
      }
      return rawCurrencyNotes;
    }
    // Regular User: Strictly isolate User A from User B
    return rawCurrencyNotes.filter((n) => n.userId === currentUser.uid);
  }, [rawCurrencyNotes, currentUser, isAdmin, selectedUserFilter]);

  // Save to local storage as fallback
  useEffect(() => {
    localStorage.setItem('moneytracker_transactions', JSON.stringify(rawTransactions));
  }, [rawTransactions]);

  useEffect(() => {
    localStorage.setItem('moneytracker_notes', JSON.stringify(rawCurrencyNotes));
  }, [rawCurrencyNotes]);

  useEffect(() => {
    localStorage.setItem('moneytracker_templates', JSON.stringify(quickTemplates));
  }, [quickTemplates]);

  // Add Transaction
  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    let change = newTx.changeAmount;
    if (newTx.givenAmount && newTx.givenAmount > newTx.amount) {
      change = newTx.givenAmount - newTx.amount;
    }

    const txItem: Transaction = {
      ...newTx,
      id,
      changeAmount: change || 0,
      userId: newTx.userId || currentUser?.uid || 'user-default',
      createdByName: newTx.createdByName || currentUser?.name || 'User',
    };

    setRawTransactions((prev) => [txItem, ...prev]);

    // If note serial numbers were linked, update those notes status
    if (newTx.linkedNoteSerialNumbers && newTx.linkedNoteSerialNumbers.length > 0) {
      setRawCurrencyNotes((prev) =>
        prev.map((n) => {
          const match = newTx.linkedNoteSerialNumbers?.some(
            (sn) => sn.includes(n.serialNumber) || n.serialNumber.includes(sn)
          );
          if (match) {
            return {
              ...n,
              status: newTx.type === 'debit' ? 'given' : 'received',
              linkedTransactionId: id,
            };
          }
          return n;
        })
      );
    }

    try {
      await set(ref(db, `transactions/${id}`), txItem);
    } catch (e) {
      console.log('Saved to persistent local state');
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id: string) => {
    setRawTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await remove(ref(db, `transactions/${id}`));
    } catch (e) {
      console.log('Updated local store');
    }
  };

  // Update Transaction
  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    setRawTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
    try {
      await update(ref(db, `transactions/${id}`), updatedFields);
    } catch (e) {
      console.log('Updated local store');
    }
  };

  // Add Currency Note
  const addCurrencyNote = async (note: Omit<CurrencyNote, 'id'>) => {
    const id = `note-${Date.now()}`;
    const noteObj: CurrencyNote = {
      ...note,
      id,
      userId: note.userId || currentUser?.uid || 'user-default',
    };
    setRawCurrencyNotes((prev) => [noteObj, ...prev]);

    try {
      await set(ref(db, `currency_notes/${id}`), noteObj);
    } catch (e) {
      console.log('Saved note to local store');
    }
  };

  // Update Note Status
  const updateNoteStatus = async (id: string, status: 'in_wallet' | 'given' | 'received', txId?: string) => {
    setRawCurrencyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status, linkedTransactionId: txId || n.linkedTransactionId } : n))
    );
    try {
      await update(ref(db, `currency_notes/${id}`), { status, ...(txId ? { linkedTransactionId: txId } : {}) });
    } catch (e) {
      console.log('Updated note state locally');
    }
  };

  // Delete Note
  const deleteCurrencyNote = async (id: string) => {
    setRawCurrencyNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await remove(ref(db, `currency_notes/${id}`));
    } catch (e) {
      console.log('Deleted note locally');
    }
  };

  // Add Quick Preset/Template
  const addQuickTemplate = async (template: Omit<QuickTemplate, 'id'>) => {
    const id = `t-${Date.now()}`;
    const tpl: QuickTemplate = { ...template, id };
    setQuickTemplates((prev) => [tpl, ...prev]);

    try {
      await set(ref(db, `quick_templates/${id}`), tpl);
    } catch (e) {
      console.log('Saved template locally');
    }
  };

  // Delete Quick Template
  const deleteQuickTemplate = async (id: string) => {
    setQuickTemplates((prev) => prev.filter((t) => t.id !== id));
    try {
      await remove(ref(db, `quick_templates/${id}`));
    } catch (e) {
      console.log('Deleted template locally');
    }
  };

  // Calculating Financial Metrics for visible user transactions
  const totalCredit = visibleTransactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = visibleTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAtmWithdrawal = visibleTransactions
    .filter((t) => t.type === 'atm_withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCredit - totalDebit;

  const cashBalance = visibleTransactions.reduce((acc, t) => {
    if (t.paymentMode === 'cash') {
      if (t.type === 'credit') return acc + t.amount;
      if (t.type === 'debit') return acc - t.amount;
    }
    if (t.type === 'atm_withdrawal') return acc + t.amount;
    return acc;
  }, 0);

  const onlineBalance = visibleTransactions.reduce((acc, t) => {
    if (t.paymentMode === 'online_upi') {
      if (t.type === 'credit') return acc + t.amount;
      if (t.type === 'debit') return acc - t.amount;
    }
    if (t.type === 'atm_withdrawal') return acc - t.amount;
    return acc;
  }, 0);

  const totalTrackedNotesValue = visibleCurrencyNotes
    .filter((n) => n.status === 'in_wallet')
    .reduce((sum, n) => sum + n.denomination, 0);

  return (
    <TransactionContext.Provider
      value={{
        transactions: visibleTransactions,
        allTransactionsAdmin: rawTransactions,
        currencyNotes: visibleCurrencyNotes,
        quickTemplates,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCurrencyNote,
        updateNoteStatus,
        deleteCurrencyNote,
        addQuickTemplate,
        deleteQuickTemplate,
        totalCredit,
        totalDebit,
        totalAtmWithdrawal,
        netBalance,
        cashBalance,
        onlineBalance,
        totalTrackedNotesValue,
        selectedUserFilter,
        setSelectedUserFilter,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

