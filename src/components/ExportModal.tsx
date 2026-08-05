import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { FileSpreadsheet, Download, Printer, Database, CheckCircle } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { transactions, currencyNotes, quickTemplates } = useTransactions();

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'ID',
      'Type',
      'Actual Amount (INR)',
      'Given Amount',
      'Change Amount',
      'Recipient / Source',
      'Category',
      'Payment Mode',
      'DateTime',
      'Remarks',
      'Linked Note Serials'
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      t.givenAmount || t.amount,
      t.changeAmount || 0,
      `"${t.recipientOrSource.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.paymentMode,
      `"${t.dateTime}"`,
      `"${(t.remarks || '').replace(/"/g, '""')}"`,
      `"${(t.linkedNoteSerialNumbers || []).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Money_Tracker_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-100">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Export & Backup Tools</h2>
          <p className="text-xs text-slate-400">
            Download complete CSV transaction logs, note serial database, or JSON backup files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CSV Export Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Export to CSV Spreadsheet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download all {transactions.length} transaction records, change amounts, and category logs as Excel/Google Sheets CSV.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download CSV Log
          </button>
        </div>

        {/* JSON Backup Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-colors">
          <div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Full Database Backup</h3>
            <p className="text-xs text-slate-400 mt-1">
              Export all transactions, currency note serial database, and custom presets in structured JSON backup.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" /> Backup JSON Database
          </button>
        </div>

        {/* Print Statement Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors">
          <div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Print Statement</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate a formatted printable financial log statement directly from your browser.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Financial Log
          </button>
        </div>

      </div>
    </div>
  );
};
