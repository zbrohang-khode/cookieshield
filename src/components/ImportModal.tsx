/**
 * Import Modal for Account / Cookie JSON Files
 */
import React, { useState } from 'react';
import { VaultEntry, CookieItem, createVaultEntry, parseRawCookieHeader, parseNetscapeFormat, parseJsonFormat } from '../utils/cookieUtils';
import { Upload, CheckCircle2, ArrowRight } from 'lucide-react';

interface ImportModalProps {
  onImport: (entry: VaultEntry) => void;
  onClose: () => void;
}

export function ImportModal({ onImport, onClose }: ImportModalProps) {
  const [importType, setImportType] = useState<'raw' | 'netscape' | 'json'>('json');
  const [accountName, setAccountName] = useState('');
  const [inputData, setInputData] = useState('');
  const [defaultDomain, setDefaultDomain] = useState('chatgpt.com');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleProcessImport = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let cookies: CookieItem[] = [];

    try {
      if (importType === 'raw') {
        cookies = parseRawCookieHeader(inputData, defaultDomain);
      } else if (importType === 'netscape') {
        cookies = parseNetscapeFormat(inputData);
      } else if (importType === 'json') {
        cookies = parseJsonFormat(inputData);
      }

      if (cookies.length === 0) {
        setError('No valid cookies found in the input data.');
        return;
      }

      const name = accountName.trim() || `${cookies[0]?.domain || 'Account'} (${cookies.length} cookies)`;
      const entry = createVaultEntry(name, cookies);
      onImport(entry);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to parse cookie data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Import Account Cookie File
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Store all cookies for an account as a single consolidated row in your vault.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
          {[
            { id: 'json', label: 'JSON Cookie Array' },
            { id: 'netscape', label: 'Netscape Format (.txt)' },
            { id: 'raw', label: 'Raw Cookie Header' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setImportType(tab.id as any)}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                importType === tab.id
                  ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Account imported successfully!</h3>
              <p className="text-xs text-slate-500">Added as a single row entry in your vault.</p>
            </div>
          ) : (
            <form onSubmit={handleProcessImport} className="space-y-4">
              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Name / Label (e.g., "ChatGPT Personal", "GitHub Work")
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="ChatGPT Account (chatgpt.com)"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {importType === 'raw' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Domain
                  </label>
                  <input
                    type="text"
                    value={defaultDomain}
                    onChange={e => setDefaultDomain(e.target.value)}
                    placeholder="chatgpt.com"
                    className="w-full mb-3 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Paste Raw Cookie Header String
                  </label>
                  <textarea
                    rows={5}
                    value={inputData}
                    onChange={e => setInputData(e.target.value)}
                    placeholder="oai-did=585ecf68-...; _cfuvid=V2oXL..."
                    className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {importType === 'netscape' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Paste Netscape Cookie File (.txt)
                  </label>
                  <textarea
                    rows={5}
                    value={inputData}
                    onChange={e => setInputData(e.target.value)}
                    placeholder=".chatgpt.com	TRUE	/	TRUE	1826731321	oai-did	585ecf68..."
                    className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {importType === 'json' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Paste Cookie JSON Array
                  </label>
                  <textarea
                    rows={5}
                    value={inputData}
                    onChange={e => setInputData(e.target.value)}
                    placeholder='[{"domain": ".chatgpt.com", "name": "oai-did", "value": "..."}]'
                    className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors shadow-sm"
                >
                  <span>Import as 1 Account Row</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
