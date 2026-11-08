'use client';

import React, { useState } from 'react';
import { Radio, Sparkles, Key, Menu, X, History, Flame, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  recentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, recentCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#070814]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0d0f22] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
              SoundFind
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-purple-400/80 -mt-1">
              AI Music Recognition
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Discover
          </button>

          <button
            onClick={() => scrollTo('recent-searches')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-cyan-400" />
            Recent
            {recentCount > 0 && (
              <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                {recentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => scrollTo('trending-charts')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Charts
          </button>

          <button
            onClick={() => scrollTo('how-it-works')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            How It Works
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            id="nav-settings-btn"
            title="Configure AudD API or test token"
            className="group relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">API Config</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0d0f22]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <button
            onClick={() => scrollTo('hero-section')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Music Finder
          </button>
          <button
            onClick={() => scrollTo('recent-searches')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
          >
            <History className="w-4 h-4 text-cyan-400" />
            Recent Searches {recentCount > 0 && `(${recentCount})`}
          </button>
          <button
            onClick={() => scrollTo('trending-charts')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Popular Charts
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            How It Works
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-purple-400" />
            API Key & Settings
          </button>
        </div>
      )}
    </header>
  );
};
