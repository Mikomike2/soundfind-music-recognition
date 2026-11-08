'use client';

import React from 'react';
import { Radio, Heart, Github, Twitter, Disc, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#050611] text-slate-400 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0d0f22] rounded-[7px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SoundFind</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Real-time AI music recognition inspired by Shazam. Identify songs playing in your surroundings directly from your browser.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                <Shield className="w-3 h-3" />
                No Audio Stored
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-medium">
                <Disc className="w-3 h-3" />
                AudD Recognition
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigation</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-purple-300 transition-colors"
                >
                  Discover Music
                </button>
              </li>
              <li>
                <a href="#recent-searches" className="hover:text-purple-300 transition-colors">
                  Recently Identified
                </a>
              </li>
              <li>
                <a href="#trending-charts" className="hover:text-purple-300 transition-colors">
                  Top Charts
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-purple-300 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Technologies</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Next.js 15 & React 19</li>
              <li>AudD Music Recognition Engine</li>
              <li>Web Audio & MediaRecorder APIs</li>
              <li>Tailwind CSS & Glassmorphism</li>
              <li>iTunes Search & RSS Integration</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SoundFind. Built with precision for music lovers.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for audio discovery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
