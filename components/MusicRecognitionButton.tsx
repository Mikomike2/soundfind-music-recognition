'use client';

import React from 'react';
import { Mic, Square, Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { RecognitionStatus } from '@/types/music';

interface MusicRecognitionButtonProps {
  status: RecognitionStatus;
  secondsElapsed: number;
  maxSeconds: number;
  onStart: () => void;
  onStop: () => void;
  onRetry: () => void;
}

export const MusicRecognitionButton: React.FC<MusicRecognitionButtonProps> = ({
  status,
  secondsElapsed,
  maxSeconds,
  onStart,
  onStop,
  onRetry,
}) => {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isError = status === 'error' || status === 'permission_denied';
  const isRequesting = status === 'requesting_permission';
  const isSuccess = status === 'success';

  // Calculate percentage of listening time elapsed
  const progressPercent = Math.min(100, Math.round((secondsElapsed / maxSeconds) * 100));

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else if (isError) {
      onRetry();
    } else if (status === 'idle' || isSuccess) {
      onStart();
    }
  };

  // Status message rendering
  const getStatusText = () => {
    switch (status) {
      case 'requesting_permission':
        return 'Requesting microphone access...';
      case 'listening':
        return `Listening to music... (${secondsElapsed}s / ${maxSeconds}s)`;
      case 'processing':
        return 'Identifying song with AI fingerprinting...';
      case 'success':
        return 'Song found!';
      case 'permission_denied':
        return 'Microphone permission denied';
      case 'error':
        return 'Recognition failed. Click to retry.';
      default:
        return 'Tap to discover music';
    }
  };

  const getSubStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Hold close to the sound source. Tap button to stop early.';
      case 'processing':
        return 'Comparing audio signature against millions of songs...';
      case 'permission_denied':
        return 'Please allow microphone access in your browser to listen.';
      case 'error':
        return 'Could not identify song. Ensure music is playing clearly.';
      case 'success':
        return 'Match discovered! Check details below.';
      default:
        return 'Hear it. Find it. Play it.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 select-none">
      {/* Outer Button Wrapper with Pulsing Wave Rings */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Animated concentric rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 ring-animated-1 pointer-events-none" />
            <div className="absolute -inset-6 rounded-full border border-indigo-500/30 ring-animated-2 pointer-events-none" />
            <div className="absolute -inset-12 rounded-full border border-cyan-400/20 ring-animated-3 pointer-events-none" />
          </>
        )}

        {/* Ambient glow backdrop */}
        <div
          className={`absolute inset-4 rounded-full transition-all duration-700 blur-2xl -z-10 ${
            isListening
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-400 opacity-70 animate-pulse'
              : isProcessing
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 opacity-60 animate-spin-slow'
              : isError
              ? 'bg-red-500/40 opacity-50'
              : 'bg-gradient-to-tr from-purple-600/40 via-indigo-600/30 to-cyan-500/30 opacity-40 group-hover:opacity-60'
          }`}
        />

        {/* SVG Circular Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            className="stroke-white/10"
            strokeWidth="4"
            fill="transparent"
          />
          {isListening && (
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-purple-400 transition-all duration-300"
              strokeWidth="5"
              strokeDasharray={565}
              strokeDashoffset={565 - (565 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
        </svg>

        {/* Central Core Button */}
        <button
          onClick={handleClick}
          id="music-recognition-core-btn"
          disabled={isProcessing || isRequesting}
          aria-label={getStatusText()}
          className={`group relative flex flex-col items-center justify-center w-44 h-44 sm:w-48 sm:h-48 rounded-full cursor-pointer transition-all duration-300 transform active:scale-95 shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
            isListening
              ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-500/50 scale-105'
              : isProcessing
              ? 'bg-[#141738] text-purple-300 border border-purple-500/40 cursor-wait'
              : isError
              ? 'bg-gradient-to-br from-red-950/80 to-rose-900/60 text-red-200 border border-red-500/40 hover:border-red-400'
              : 'bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 hover:from-purple-600 hover:via-indigo-600 hover:to-slate-800 text-white hover:scale-105 border border-purple-400/30 shadow-[0_0_35px_rgba(139,92,246,0.35)]'
          }`}
        >
          {/* Inner Content Icon */}
          {isRequesting ? (
            <Loader2 className="w-16 h-16 animate-spin text-purple-300" />
          ) : isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-14 h-14 animate-spin text-cyan-300 mb-1" />
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-200">
                Analyzing
              </span>
            </div>
          ) : isListening ? (
            <div className="flex flex-col items-center">
              <Square className="w-12 h-12 text-white fill-white mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                Stop Early
              </span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-12 h-12 text-rose-300 mb-1 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-200">
                Retry
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Mic className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                <Sparkles className="w-5 h-5 text-cyan-300 absolute -top-1 -right-2 animate-bounce-subtle" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-purple-200 mt-1">
                Listen
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Dynamic Status Text & Subtext */}
      <div className="text-center mt-5 space-y-1.5 max-w-md px-4">
        <div className="flex items-center justify-center gap-2">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : isListening ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          ) : isSuccess ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {getStatusText()}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-400">
          {getSubStatusText()}
        </p>

        {/* Listening Timer Badge */}
        {isListening && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium mt-2">
            <span>Sampling Audio:</span>
            <span className="font-mono font-bold text-white">
              {secondsElapsed}s / {maxSeconds}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
