/**
 * Multi-Format Export Component for Vault Entries
 */
import React, { useState } from 'react';
import { VaultEntry, exportToNetscape, exportToRawHeader, exportToCsv } from '../utils/cookieUtils';
import { Download, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  entries: VaultEntry[];
  selectedIds?: string[];
}

export function ExportModal({ entries, selectedIds = [] }: ExportModalProps) {
  const targetEntries = selectedIds.length > 0 ? entries.filter(e => selectedIds.includes(e.id)) : entries;
  const allCookies = targetEntries.flatMap(e => e.cookies);

  const [format, setFormat] = useState<'netscape' | 'json' | 'header' | 'csv'>('netscape');
  const [copied, setCopied] = useState(false);

  let outputText = '';
  if (format === 'netscape') {
    outputText = exportToNetscape(allCookies);
  } else if (format === 'json') {
    outputText = JSON.stringify(targetEntries, null, 2);
  } else if (format === 'header') {
    outputText = exportToRawHeader(allCookies);
  } else if (format === 'csv') {
    outputText = exportToCsv(allCookies);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = format === 'netscape' ? 'cookies.txt' : format === 'json' ? 'vault_accounts.json' : format === 'csv' ? 'cookies.csv' : 'cookies_header.txt';
    const mime = format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain';
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Multi-Format Account Exporter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export {targetEntries.length} account(s) ({allCookies.length} total cookies) into Netscape format, JSON, raw header, or CSV.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: 'netscape', label: 'Netscape (.txt)' },
            { id: 'json', label: 'JSON Vault' },
            { id: 'header', label: 'Raw Cookie Header' },
            { id: 'csv', label: 'CSV Table' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id as any)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                format === f.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preview Output</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl max-h-96 overflow-y-auto shadow-inner">
            {outputText}
          </pre>
        </div>
      </div>
    </div>
  );
}
