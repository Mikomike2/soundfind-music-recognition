'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Shield, ExternalLink, Check, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customToken: string;
  onSaveToken: (token: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  customToken,
  onSaveToken,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setTokenInput(customToken);
  }, [customToken, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleUseDefault = () => {
    setTokenInput('');
    onSaveToken('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 relative border border-purple-500/30 shadow-[0_20px_60px_rgba(139,92,246,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">API Configuration</h3>
            <p className="text-xs text-purple-300/80">AudD Music Recognition Engine</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          SoundFind connects to <strong className="text-white">AudD Music Recognition API</strong>. The default trial token (<code className="text-purple-300 bg-purple-500/10 px-1 py-0.5 rounded">"test"</code>) is restricted by AudD. To identify live microphone audio without limitations, add your free personal API token below.
        </p>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-slate-200 font-semibold">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Need your own free API Key?
            </span>
            <a
              href="https://dashboard.audd.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Get 300 Free Requests</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Register for free at <span className="text-white font-mono">dashboard.audd.io</span> to receive 300 free song identification queries instantly (no credit card required).
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Personal AudD API Token
          </label>
          <div className="relative">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. 5d92e8a1... (leave blank to use server default)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tokens saved in your browser are sent securely via TLS and never shared.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleUseDefault}
            className="w-full sm:w-auto px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset to Server Default
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
