/**
 * Master Password Vault Lock & Setup Modal
 */
import React, { useState } from 'react';
import { Shield, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface LockModalProps {
  isFirstSetup: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onSetup: (password: string) => Promise<void>;
}

export function LockModal({ isFirstSetup, onUnlock, onSetup }: LockModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a master password.');
      return;
    }

    if (isFirstSetup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isFirstSetup && password.length < 6) {
      setError('Master password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isFirstSetup) {
        await onSetup(password);
      } else {
        const success = await onUnlock(password);
        if (!success) {
          setError('Incorrect master password. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Decryption failed. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-b from-slate-50 dark:from-slate-800/50 to-transparent border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-lg">
            {isFirstSetup ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isFirstSetup ? 'Initialize CookieShield Vault' : 'Unlock Encrypted Vault'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isFirstSetup
              ? 'Set a robust master password. AES-256-GCM encryption ensures your stored credentials remain 100% private.'
              : 'Enter your master password to decrypt and access your secure cookie vault.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          {isFirstSetup && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Master Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : isFirstSetup ? 'Create Encrypted Vault' : 'Unlock Vault'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isFirstSetup && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Protected by military-grade AES-256 client-side cryptography.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
