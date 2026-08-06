export type TransactionType = 'credit' | 'debit' | 'atm_withdrawal';
export type PaymentMode = 'cash' | 'online_upi' | 'atm_cash';
export type UserApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface NoteDenominationBreakdown {
  [denomination: number]: number; // e.g. { 500: 2, 200: 1, 100: 3 }
}

export interface CurrencyNote {
  id: string;
  denomination: number; // e.g. 500, 200, 100, 50, 20, 10, 5, 2, 1
  serialNumber: string; // e.g. "9AB 123456"
  status: 'in_wallet' | 'given' | 'received';
  linkedTransactionId?: string;
  remarks?: string;
  createdAt: string;
  userId?: string;
}

export interface QuickTemplate {
  id: string;
  name: string; // e.g., "Grocery Store", "Driver Salary", "Electricity Board"
  category: string;
  defaultPaymentMode: PaymentMode;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType; // credit, debit, atm_withdrawal
  amount: number; // Actual transaction amount
  givenAmount?: number; // E.g., paid 500 cash
  changeAmount?: number; // E.g., got 300 back
  recipientOrSource: string; // "Kisko Diye" / "Kisse Mile" (e.g., Store, Driver, Retailer)
  category: string; // EMI, Loan, Bill, Recharge, Fuel, Groceries, Electricity Bill, Salary, etc.
  paymentMode: PaymentMode; // cash (Offline), online_upi (Online), atm_cash (ATM Withdrawal)
  dateTime: string; // ISO string or formatted date-time
  remarks?: string; // e.g. "bought biscuits, snacks"
  linkedNoteSerialNumbers?: string[]; // Array of Note Serial Numbers (e.g. ["500-9AB123456"])
  denominations?: NoteDenominationBreakdown; // Detailed cash notes breakdown
  cashPersonPhone?: string; // Contact phone for cash given/received
  userId?: string;
  createdByName?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  username?: string;
  email?: string;
  password?: string;
  role: 'admin' | 'user';
  status: UserApprovalStatus; // 'approved' | 'pending' | 'rejected'
  createdAt?: string;
}

export interface ReconciliationRecord {
  id: string;
  dateTime: string;
  trackedCash: number;
  trackedOnline: number;
  trackedTotal: number;
  actualCash: number;
  actualOnline: number;
  actualTotal: number;
  cashDiff: number;
  onlineDiff: number;
  totalDiff: number;
  memoNote?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionTxId?: string;
  userId?: string;
}

export interface AdminOTPState {
  code: string; // "181855"
  timeLeft: number; // 16 seconds countdown
  isExpired: boolean;
  timerStarted: boolean;
}

