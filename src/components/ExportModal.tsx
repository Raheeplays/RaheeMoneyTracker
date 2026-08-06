import React, { useState, useRef } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, TransactionType, PaymentMode } from '../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Plus
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { transactions, currencyNotes, quickTemplates, importTransactions } = useTransactions();

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [pastedCSVText, setPastedCSVText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Omit<Transaction, 'id'>[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format Date & Time into required CSV output string
  const formatCSVDateTime = (dateTimeStr: string) => {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) {
      return { dateStr: '', timeStr: '' };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const dateStr = `${day} ${month} ${year}`;

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    const timeStr = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    return { dateStr, timeStr };
  };

  // Helper to parse date string & time string into ISO string
  const parseCSVDateTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    const cleanDate = dateStr.trim();
    const cleanTime = (timeStr || '').trim();
    const combined = `${cleanDate} ${cleanTime}`.trim();

    const d = new Date(combined);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }

    // Fallback regex matching DD Month YYYY (e.g., 27 July 2026 or 01 August 2026)
    const dateMatch = cleanDate.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const monthName = dateMatch[2].toLowerCase();
      const year = parseInt(dateMatch[3], 10);
      const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      let monthIdx = months.findIndex((m) => m.startsWith(monthName));
      if (monthIdx === -1) monthIdx = 0;

      let hours = 12;
      let minutes = 0;
      let seconds = 0;

      if (cleanTime) {
        const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          const ampm = timeMatch[4] ? timeMatch[4].toUpperCase() : null;
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
      }

      const constructed = new Date(year, monthIdx, day, hours, minutes, seconds);
      if (!isNaN(constructed.getTime())) {
        return constructed.toISOString();
      }
    }

    return new Date().toISOString();
  };

  // CSV Export logic matching user's requested structure
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      setImportStatus({ type: 'error', message: 'No transactions available to export.' });
      return;
    }

    // 1. Sort transactions chronologically (oldest first)
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    let runningBalance = 0;
    let totalCredit = 0;
    let totalAtmWithdrawal = 0;
    let totalUpiDebit = 0;
    let totalNormalDebit = 0;

    const rows: string[] = [];
    rows.push('Amount,Type,Net Balance,Name,Date,Time');

    sorted.forEach((t) => {
      let typeLabel = 'Debit';
      if (t.type === 'credit') {
        typeLabel = 'Credit';
        runningBalance += t.amount;
        totalCredit += t.amount;
      } else if (t.type === 'atm_withdrawal') {
        typeLabel = 'ATM Withdrawal';
        runningBalance -= t.amount;
        totalAtmWithdrawal += t.amount;
      } else {
        typeLabel = 'Debit';
        runningBalance -= t.amount;
        const isUpi =
          t.paymentMode === 'online_upi' ||
          t.recipientOrSource.toLowerCase().includes('upi') ||
          t.recipientOrSource.includes('(UPI)');
        if (isUpi) {
          totalUpiDebit += t.amount;
        } else {
          totalNormalDebit += t.amount;
        }
      }

      const { dateStr, timeStr } = formatCSVDateTime(t.dateTime);
      const nameEscaped = t.recipientOrSource.includes(',')
        ? `"${t.recipientOrSource.replace(/"/g, '""')}"`
        : t.recipientOrSource;

      rows.push(
        `${t.amount},${typeLabel},${Math.round(runningBalance)},${nameEscaped},${dateStr},${timeStr}`
      );
    });

    const totalDebitAll = totalAtmWithdrawal + totalUpiDebit + totalNormalDebit;

    // Append summary footer lines exactly matching requested format
    rows.push(',,,,,');
    rows.push(`${Math.round(totalCredit)},TOTAL CREDIT,,,,`);
    rows.push(`${Math.round(totalAtmWithdrawal)},TOTAL ATM WITHDRAWAL,,,,`);
    rows.push(`${Math.round(totalUpiDebit)},TOTAL UPI DEBIT,,,,`);
    rows.push(`${Math.round(totalNormalDebit)},TOTAL NORMAL DEBIT,,,,`);
    rows.push(`${Math.round(totalDebitAll)},TOTAL DEBIT (ALL),,,,`);
    rows.push(`${Math.round(runningBalance)},FINAL BALANCE,,,,`);

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Money_Tracker_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setImportStatus({
      type: 'success',
      message: `Exported ${transactions.length} records to CSV successfully!`,
    });
  };

  // CSV Parser for raw CSV text string
  const parseRawCSV = (csvText: string): Omit<Transaction, 'id'>[] => {
    const lines = csvText.split(/\r?\n/);
    const parsedItems: Omit<Transaction, 'id'>[] = [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    let amountIdx = 0;
    let typeIdx = 1;
    let netBalIdx = 2;
    let nameIdx = 3;
    let dateIdx = 4;
    let timeIdx = 5;

    let headerFound = false;
    let startLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineStr = lines[i].trim();
      if (!lineStr) continue;
      const cols = parseLine(lineStr).map((c) => c.toLowerCase());

      if (cols.includes('amount')) {
        headerFound = true;
        startLine = i + 1;
        amountIdx = cols.findIndex((c) => c === 'amount' || c.includes('amount'));
        typeIdx = cols.findIndex((c) => c === 'type' || c.includes('type'));
        netBalIdx = cols.findIndex((c) => c.includes('net') || c.includes('balance'));
        nameIdx = cols.findIndex((c) => c === 'name' || c.includes('recipient') || c.includes('source'));
        dateIdx = cols.findIndex((c) => c === 'date' || c.includes('date'));
        timeIdx = cols.findIndex((c) => c === 'time' || c.includes('time'));

        if (amountIdx === -1) amountIdx = 0;
        if (typeIdx === -1) typeIdx = 1;
        if (netBalIdx === -1) netBalIdx = 2;
        if (nameIdx === -1) nameIdx = 3;
        if (dateIdx === -1) dateIdx = 4;
        if (timeIdx === -1) timeIdx = 5;
        break;
      }
    }

    if (!headerFound) {
      startLine = 0;
    }

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const upperLine = line.toUpperCase();
      if (
        upperLine.includes('TOTAL') ||
        upperLine.includes('FINAL BALANCE') ||
        upperLine.startsWith(',,,,,')
      ) {
        continue;
      }

      const cols = parseLine(line);
      const rawAmt = cols[amountIdx];
      if (!rawAmt) continue;

      const amountNum = parseFloat(rawAmt.replace(/[^0-9.-]/g, ''));
      if (isNaN(amountNum) || amountNum <= 0) continue;

      const rawType = cols[typeIdx] || 'Debit';
      const rawName = cols[nameIdx] || '';
      const rawDate = cols[dateIdx] || '';
      const rawTime = cols[timeIdx] || '';

      let type: TransactionType = 'debit';
      let paymentMode: PaymentMode = 'cash';

      const typeLower = rawType.toLowerCase();
      if (typeLower.includes('credit') || typeLower.includes('income')) {
        type = 'credit';
        paymentMode = 'online_upi';
      } else if (typeLower.includes('atm') || typeLower.includes('withdrawal')) {
        type = 'atm_withdrawal';
        paymentMode = 'atm_cash';
      } else {
        type = 'debit';
        if (rawName.toLowerCase().includes('upi') || rawName.includes('(UPI)')) {
          paymentMode = 'online_upi';
        } else {
          paymentMode = 'cash';
        }
      }

      let category = 'General Expense';
      if (type === 'credit') {
        category = 'Income / Salary';
      } else if (type === 'atm_withdrawal') {
        category = 'ATM Cash Out';
      } else {
        const nameLow = rawName.toLowerCase();
        if (nameLow.includes('loan')) category = 'Loan / EMI';
        else if (nameLow.includes('upi')) category = 'Digital / Online';
        else if (nameLow.includes('bill') || nameLow.includes('electricity')) category = 'Utility Bills';
      }

      const isoDateTime = parseCSVDateTime(rawDate, rawTime);

      parsedItems.push({
        amount: amountNum,
        givenAmount: amountNum,
        changeAmount: 0,
        type,
        recipientOrSource:
          rawName ||
          (type === 'credit'
            ? 'Credit Income'
            : type === 'atm_withdrawal'
            ? 'ATM Cash'
            : 'Expense Record'),
        category,
        paymentMode,
        dateTime: isoDateTime,
        remarks: rawName ? `CSV Import: ${rawName}` : 'Imported CSV Record',
        linkedNoteSerialNumbers: [],
      });
    }

    return parsedItems;
  };

  // Handle CSV file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPastedCSVText(text);
        const parsed = parseRawCSV(text);
        if (parsed.length > 0) {
          setParsedPreview(parsed);
          setShowPreviewModal(true);
          setImportStatus({
            type: 'success',
            message: `Parsed ${parsed.length} transactions from "${file.name}". Click 'Confirm Import' to save to database.`,
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'Failed to parse transactions. Please ensure CSV headers match: Amount,Type,Net Balance,Name,Date,Time',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  // Parse pasted CSV text
  const handleParseText = () => {
    if (!pastedCSVText.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste or select CSV data first.' });
      return;
    }
    const parsed = parseRawCSV(pastedCSVText);
    if (parsed.length > 0) {
      setParsedPreview(parsed);
      setShowPreviewModal(true);
      setImportStatus({
        type: 'success',
        message: `Parsed ${parsed.length} transaction records!`,
      });
    } else {
      setImportStatus({
        type: 'error',
        message: 'Could not find valid transaction lines. Check format.',
      });
    }
  };

  // Confirm import into database
  const handleConfirmImport = async () => {
    if (parsedPreview.length === 0) return;
    try {
      const count = await importTransactions(parsedPreview);
      setImportStatus({
        type: 'success',
        message: `Successfully imported and saved ${count} transactions to database!`,
      });
      setShowPreviewModal(false);
      setParsedPreview([]);
      setPastedCSVText('');
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: 'Error importing transactions to database.',
      });
    }
  };

  // Paste sample data requested by user for quick testing
  const handleLoadSampleCSV = () => {
    const sample = `Amount,Type,Net Balance,Name,Date,Time
100000,Credit,101659,,27 July 2026,12:44:00 PM
5000,Debit,96659,Loan,28 July 2026,4:22:28 AM
6000,ATM Withdrawal,90659,,28 July 2026,5:14:40 PM
1000,ATM Withdrawal,89659,,29 July 2026,4:45:46 PM
30000,Debit,59659,Mukesh Kumar Agarwal (UPI),29 July 2026,7:40:48 PM
10000,Debit,49659,UPI,29 July 2026,8:21:39 PM
1300,Debit,48359,UPI,30 July 2026,12:47:46 PM
9000,ATM Withdrawal,39359,,31 July 2026,4:40:29 PM
9000,ATM Withdrawal,30359,,31 July 2026,4:41:41 PM
6100,Debit,24259,Loan,01 August 2026,5:16:54 AM
75590,Credit,99849,,03 August 2026,6:28:17 PM
43000,Debit,56849,Loan,04 August 2026,4:17:56 AM
5000,Debit,51849,UPI,04 August 2026,5:57:57 AM
5000,Debit,46849,UPI,04 August 2026,5:58:41 AM
9000,ATM Withdrawal,37849,,04 August 2026,7:32:32 PM
9000,ATM Withdrawal,28849,,04 August 2026,7:35:13 PM
5000,Debit,23849,Advanced Loan,05 August 2026,3:40:38 AM
8000,ATM Withdrawal,15849,,05 August 2026,4:33:26 PM
,,,,,
175590,TOTAL CREDIT,,,,
51000,TOTAL ATM WITHDRAWAL,,,,
51300,TOTAL UPI DEBIT,,,,
59100,TOTAL NORMAL DEBIT,,,,
161400,TOTAL DEBIT (ALL),,,,
15849,FINAL BALANCE,,,,`;

    setPastedCSVText(sample);
    const parsed = parseRawCSV(sample);
    setParsedPreview(parsed);
    setShowPreviewModal(true);
    setImportStatus({
      type: 'success',
      message: `Loaded sample CSV with ${parsed.length} transaction records!`,
    });
  };

  const handleExportJSON = () => {
    const backupData = {
      transactions,
      currencyNotes,
      quickTemplates,
      exportDate: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Money_Tracker_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Import & Export CSV Tools</h2>
            <p className="text-xs text-slate-400">
              Import or Export CSV financial logs (Amount, Type, Net Balance, Name, Date, Time)
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {importStatus.type && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            importStatus.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus({ type: null, message: '' })}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CSV EXPORT CARD */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-mono">Format: Amount,Type,Net Balance,Name,Date,Time</span>
            </div>
            <h3 className="text-base font-bold text-white">Export CSV Statement</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Export all {transactions.length} records into exact CSV format with chronological running net balances and summary totals (TOTAL CREDIT, TOTAL ATM, TOTAL UPI, TOTAL DEBIT, FINAL BALANCE).
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Download className="w-4 h-4" /> Download CSV Spreadsheet
          </button>
        </div>

        {/* CSV IMPORT CARD */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Upload className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={handleLoadSampleCSV}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-semibold"
              >
                + Paste Sample Data
              </button>
            </div>
            <h3 className="text-base font-bold text-white">Import CSV Data</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload `.csv` or paste lines formatted as <code className="text-emerald-400 font-mono text-[11px]">Amount,Type,Net Balance,Name,Date,Time</code> to bulk import money records directly into database.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> Choose CSV File
              </button>

              <button
                onClick={handleParseText}
                disabled={!pastedCSVText.trim()}
                className="py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Parse Text
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CSV RAW PASTE ZONE */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Copy className="w-4 h-4 text-amber-400" />
            <span>Paste CSV Raw Content Directly (Optional)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            Amount,Type,Net Balance,Name,Date,Time
          </span>
        </div>

        <textarea
          rows={5}
          value={pastedCSVText}
          onChange={(e) => setPastedCSVText(e.target.value)}
          placeholder={`Amount,Type,Net Balance,Name,Date,Time\n100000,Credit,101659,,27 July 2026,12:44:00 PM\n5000,Debit,96659,Loan,28 July 2026,4:22:28 AM\n6000,ATM Withdrawal,90659,,28 July 2026,5:14:40 PM\n...`}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-slate-400">
            {pastedCSVText ? `${pastedCSVText.split('\n').length} lines entered` : 'Ready to paste'}
          </span>
          <button
            onClick={handleParseText}
            disabled={!pastedCSVText.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Preview & Parse Import
          </button>
        </div>
      </div>

      {/* PARSED PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Confirm CSV Import ({parsedPreview.length} items)</span>
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                Review the parsed records below before saving into your database:
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {parsedPreview.slice(0, 50).map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white font-mono">
                        ₹{item.amount.toLocaleString()}
                      </span>{' '}
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          item.type === 'credit'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.type === 'atm_withdrawal'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>{' '}
                      <span className="text-slate-300">
                        {item.recipientOrSource !== 'Credit Income' && item.recipientOrSource !== 'ATM Cash'
                          ? `(${item.recipientOrSource})`
                          : ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.dateTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {parsedPreview.length > 50 && (
                <p className="text-center text-xs text-slate-400">
                  ... and {parsedPreview.length - 50} more items
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Confirm & Import {parsedPreview.length} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON & PRINT FOOTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" /> Full Database JSON Backup
            </h4>
            <p className="text-[11px] text-slate-400">Backup notes, presets & logs in JSON</p>
          </div>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            JSON Backup
          </button>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-amber-400" /> Print Financial Statement
            </h4>
            <p className="text-[11px] text-slate-400">Browser print formatted document</p>
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Print Statement
          </button>
        </div>
      </div>

    </div>
  );
};
