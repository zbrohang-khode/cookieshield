/**
 * Top Navbar following strict Top Bar Contract
 */
import React from 'react';
import { Shield, Lock, FileSpreadsheet, Download, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'vault' | 'import' | 'audit' | 'curl' | 'export';
  setActiveTab: (tab: 'vault' | 'import' | 'audit' | 'curl' | 'export') => void;
  onLock: () => void;
  cookieCount: number;
}

export function Navbar({ activeTab, setActiveTab, onLock, cookieCount }: NavbarProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            CookieShield Vault
          </span>
          <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-900">
            AES-256
          </span>
        </div>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('vault')}
          className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'vault' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Vault</span>
          <span className="px-1.5 py-0.2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full tabular-nums">
            {cookieCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'import' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Auto-Detect & Import
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
            activeTab === 'audit' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Security Audit</span>
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'curl' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          cURL Generator
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'export' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Multi-Format Export
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onLock}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Vault</span>
        </button>
      </div>
    </header>
  );
}
