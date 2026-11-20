/**
 * Account Inspector Modal for VaultEntry
 */
import React, { useState } from 'react';
import { VaultEntry, CookieItem, exportToRawHeader, exportToNetscape } from '../utils/cookieUtils';
import { Shield, Copy, Download, KeyRound, Check, FileText } from 'lucide-react';

interface InspectorModalProps {
  entry: VaultEntry;
  onClose: () => void;
}

export function InspectorModal({ entry, onClose }: InspectorModalProps) {
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null);

  const rawHeader = exportToRawHeader(entry.cookies);

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(rawHeader);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entry.cookies, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(entry.cookies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.accountName.toLowerCase().replace(/\s+/g, '_')}_cookies.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold">
              🍪
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {entry.accountName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {entry.domain} · {entry.cookies.length} cookies included
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyHeader}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              {copiedHeader ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHeader ? 'Copied Raw Header!' : 'Copy Raw Header'}</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON File</span>
            </button>
          </div>

          {/* Cookies List inside this account */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cookies in this Account ({entry.cookies.length})
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {entry.cookies.map(c => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${c.secure ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700'}`}>
                        {c.secure ? 'Secure' : 'Insecure'}
                      </span>
                      {c.httpOnly && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded">
                          HttpOnly
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-md truncate" title={c.value}>
                      {c.value}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${c.name}=${c.value}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Cookie</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
