'use client';

import React from 'react';
import { Mic, Cpu, Music4, ShieldCheck, Zap, Headphones } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          Acoustic Intelligence
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          How SoundFind Identifies Music
        </h3>
        <p className="text-sm sm:text-base text-slate-400">
          Powered by state-of-the-art audio fingerprinting algorithms and the AudD music recognition engine to match sound in seconds.
        </p>
      </div>

      {/* 3 Step Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Step 01</span>
          <h4 className="text-lg font-bold text-white mt-1 mb-2">Capture Sound</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Click the listen button. With your microphone permission, the Web Audio API captures a brief 5–12 second high-fidelity sample of the ambient music playing nearby.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Step 02</span>
          <h4 className="text-lg font-bold text-white mt-1 mb-2">Fingerprint Analysis</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The audio is transformed into unique frequency peaks and time signatures. The acoustic fingerprint is matched securely against an index of over 100 million recorded songs.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Music4 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest">Step 03</span>
          <h4 className="text-lg font-bold text-white mt-1 mb-2">Instant Playback & Discovery</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Get title, artist, album, high-res artwork, 30-second audio preview, lyrics snippet, and one-click launch links into Spotify, Apple Music, and YouTube.
          </p>
        </div>
      </div>

      {/* Trust & Privacy Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl p-4 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-white mb-1">Strict Privacy & No Audio Storage</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your microphone audio is strictly processed in temporary volatile memory for song recognition and is never saved, recorded, or cataloged on any server.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex items-start gap-3.5">
          <Headphones className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-white mb-1">Universal Device Compatibility</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Works across modern desktop, tablet, and mobile browsers (Chrome, Safari, Edge, Firefox, Brave) using responsive Web Audio standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
