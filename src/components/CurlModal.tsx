/**
 * cURL & HTTP Request Generator component for Vault Entries
 */
import React, { useState } from 'react';
import { VaultEntry, generateCurlCommand, exportToRawHeader } from '../utils/cookieUtils';
import { Terminal, Copy, Check, Globe } from 'lucide-react';

interface CurlModalProps {
  entries: VaultEntry[];
}

export function CurlModal({ entries }: CurlModalProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?.id || '');
  const [targetUrl, setTargetUrl] = useState('https://chatgpt.com/api/models');
  const [copied, setCopied] = useState(false);

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || entries[0];
  const cookies = selectedEntry ? selectedEntry.cookies : [];

  const curlCmd = generateCurlCommand(cookies, targetUrl);
  const cookieHeader = exportToRawHeader(cookies);

  const fetchSnippet = `// JavaScript fetch snippet with credentials & cookies for ${selectedEntry?.accountName || 'Account'}
fetch("${targetUrl}", {
  method: "GET",
  headers: {
    "Cookie": "${cookieHeader}"
  }
})
.then(res => res.json())
.then(data => console.log(data));`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              cURL & HTTP Request Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate ready-to-run cURL commands or JS fetch requests using cookies from any stored account row.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Account / Cookie File
            </label>
            <select
              value={selectedEntryId}
              onChange={e => setSelectedEntryId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            >
              {entries.map(e => (
                <option key={e.id} value={e.id}>
                  {e.accountName} ({e.cookies.length} cookies)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Target API / Request URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://chatgpt.com/api/..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">cURL Command</span>
              <button
                onClick={() => handleCopy(curlCmd)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto shadow-inner">
              {curlCmd}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">JavaScript Fetch Snippet</span>
              <button
                onClick={() => handleCopy(fetchSnippet)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto shadow-inner">
              {fetchSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
