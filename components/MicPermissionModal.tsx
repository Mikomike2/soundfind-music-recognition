'use client';

import React from 'react';
import { MicOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 relative border border-rose-500/30 shadow-[0_20px_60px_rgba(244,63,94,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <MicOff className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Microphone Access Needed</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          SoundFind requires microphone access to listen to songs playing nearby. Your audio is analyzed in real-time and never recorded or saved.
        </p>

        {/* Browser instructions */}
        <div className="space-y-3 bg-black/40 rounded-2xl p-4 border border-white/5 mb-6 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Click the <strong className="text-white">lock or settings icon</strong> in the left side of your browser address bar.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Find <strong className="text-white">Microphone</strong> and change it to <strong className="text-emerald-400">Allow</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Ensure no other app is exclusively blocking your microphone hardware.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all"
          >
            Retry Permission
          </button>
        </div>
      </div>
    </div>
  );
};
