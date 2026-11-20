/**
 * High-Density SaaS Table for Account / Cookie JSON Entries
 */
import React, { useState } from 'react';
import { VaultEntry, exportToRawHeader } from '../utils/cookieUtils';
import { Search, Plus, Trash2, Copy, FileText, Download, CheckSquare, Square, Shield, ExternalLink } from 'lucide-react';

interface CookieTableProps {
  entries: VaultEntry[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onAddClick: () => void;
  onInspect: (entry: VaultEntry) => void;
  onExportSelected: (selectedIds: string[]) => void;
}

const CATEGORIES = ['All', 'Developer', 'Productivity', 'Social', 'E-Commerce', 'Financial', 'General'];

export function CookieTable({ entries, onDelete, onBulkDelete, onAddClick, onInspect, onExportSelected }: CookieTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.accountName.toLowerCase().includes(search.toLowerCase()) ||
                          e.domain.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const copyHeader = (entry: VaultEntry) => {
    const header = exportToRawHeader(entry.cookies);
    navigator.clipboard.writeText(header);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search accounts or domains (e.g. ChatGPT, GitHub)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-white"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => onExportSelected(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            </>
          )}

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Import Cookie File / Account</span>
          </button>
        </div>
      </div>

      {/* Category Mobile Filter Bar */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto py-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Container - One row per account / cookie JSON file */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    {selectedIds.length > 0 && selectedIds.length === filteredEntries.length ? (
                      <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Account / Cookie File</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cookies Included</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">No accounts in vault.</p>
                      <p className="text-xs text-slate-400">Import cookie JSON files or raw headers to store each account as a consolidated row.</p>
                      <button
                        onClick={onAddClick}
                        className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl"
                      >
                        Import First Account
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const isSelected = selectedIds.includes(entry.id);
                  const isCopied = copiedId === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-slate-50 dark:bg-slate-800/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <button onClick={() => toggleSelect(entry.id)} className="flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          🍪
                        </div>
                        <span>{entry.accountName}</span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {entry.domain}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {entry.cookies.length} cookie(s)
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyHeader(entry)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Copy Cookie Header String"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isCopied ? 'Copied Header!' : 'Header'}</span>
                          </button>
                          <button
                            onClick={() => onInspect(entry)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors shadow-sm"
                            title="Inspect Account Cookies"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={() => onDelete(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
