/**
 * AI Security Audit Panel for Vault Entries
 */
import React, { useState } from 'react';
import { VaultEntry } from '../utils/cookieUtils';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuditPanelProps {
  entries: VaultEntry[];
}

export function AuditPanel({ entries }: AuditPanelProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<{ summary: string; audit: { name: string; domain: string; riskLevel: string; issues: string[] }[] } | null>(null);
  const [error, setError] = useState('');

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || entries[0];
  const cookies = selectedEntry ? selectedEntry.cookies : [];

  const runAudit = async () => {
    if (!cookies.length) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies })
      });
      if (!res.ok) throw new Error('Failed to run audit.');
      const data = await res.json();
      setAuditData(data);
    } catch (err: any) {
      setError(err.message || 'Audit request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                AI Cookie Security Audit
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit security posture and flags for any stored account cookie file.
              </p>
            </div>
          </div>
          <button
            onClick={runAudit}
            disabled={loading || cookies.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Account...' : 'Run Security Audit'}</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Select Account to Audit
          </label>
          <select
            value={selectedEntryId}
            onChange={e => {
              setSelectedEntryId(e.target.value);
              setAuditData(null);
            }}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
          >
            {entries.map(e => (
              <option key={e.id} value={e.id}>
                {e.accountName} ({e.cookies.length} cookies)
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-4 mb-4 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {!auditData && !loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ready to audit {selectedEntry?.accountName}.</p>
            <p className="text-xs text-slate-400">Click the button above to evaluate security flags and hardening recommendations.</p>
          </div>
        )}

        {auditData && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Executive Summary</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{auditData.summary}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cookie Risk Breakdown</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {auditData.audit.map((item, idx) => (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">({item.domain})</span>
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                        {item.issues.map((iss, i) => (
                          <li key={i}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full self-start md:self-center ${
                      item.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900' :
                      item.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900' :
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    }`}>
                      {item.riskLevel} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
