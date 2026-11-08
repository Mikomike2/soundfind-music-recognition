'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { History, Trash2, Play, Pause, ExternalLink, Sparkles, ChevronRight } from 'lucide-react';
import { RecognitionHistoryItem, SongData } from '@/types/music';

interface RecentSearchesProps {
  history: RecognitionHistoryItem[];
  onSelectSong: (song: SongData) => void;
  onClearHistory: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  history,
  onSelectSong,
  onClearHistory,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const togglePreview = (id: string, previewUrl?: string) => {
    if (!previewUrl) return;

    if (playingId === id) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(previewUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      setAudioElement(audio);
      setPlayingId(id);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (history.length === 0) {
    return (
      <section id="recent-searches" className="w-full max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold tracking-tight text-white">Recently Identified</h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8 text-center border border-white/5">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">No song history yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Songs you recognize using SoundFind will be saved here so you can revisit them anytime.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="recent-searches" className="w-full max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold tracking-tight text-white">Recently Identified Songs</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-xs font-medium text-slate-400 hover:text-red-300 border border-white/5 hover:border-red-500/30 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="glass-panel glass-panel-hover rounded-2xl p-4 flex items-center gap-3.5 group relative overflow-hidden"
          >
            {/* Album Cover Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
              <Image
                src={item.albumCoverUrl}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
              {item.links.audioPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(item.id, item.links.audioPreview);
                  }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Play 30s preview"
                >
                  {playingId === item.id ? (
                    <Pause className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Song Meta */}
            <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => onSelectSong(item)}>
              <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs font-medium text-slate-400 truncate">{item.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatTimeAgo(item.searchedAt)}
                </span>
                {item.genre && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 font-medium truncate max-w-[100px]">
                    {item.genre}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {item.links.spotify && (
                <a
                  href={item.links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1DB954] hover:bg-white/5 transition-colors"
                  title="Open on Spotify"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => onSelectSong(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="View full details"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
