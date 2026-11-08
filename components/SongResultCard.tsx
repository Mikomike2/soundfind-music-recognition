'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  ExternalLink,
  Share2,
  RotateCcw,
  Music2,
  Calendar,
  Disc3,
  Tag,
  Check,
  FileText,
  Volume2,
} from 'lucide-react';
import { SongData } from '@/types/music';

interface SongResultCardProps {
  song: SongData;
  onReset: () => void;
}

export const SongResultCard: React.FC<SongResultCardProps> = ({ song, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset audio playback if song changes
  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [song.id]);

  const togglePlay = () => {
    if (!audioRef.current || !song.links.audioPreview) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio play prevented:', e);
      });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(prog);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleShare = async () => {
    const shareText = `Check out "${song.title}" by ${song.artist} found on SoundFind!`;
    const shareUrl = song.links.spotify || song.links.appleMusic || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.title} - ${song.artist}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-purple-500/20 shadow-[0_15px_50px_rgba(139,92,246,0.2)]">
        {/* Glow backdrop based on album artwork */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-35 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(6, 182, 212, 0.3) 100%)`,
          }}
        />

        {/* Top Header Tag */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Song Identified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 border border-white/10 transition-colors"
              title="Share song"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-xs font-medium text-purple-200 hover:text-white flex items-center gap-1.5 border border-purple-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
              <span>Identify Another</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Album Cover Art */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative group w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/60 border border-white/10">
              <Image
                src={song.albumCoverUrl}
                alt={`${song.album} cover`}
                fill
                sizes="(max-width: 768px) 192px, 224px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />

              {/* Play Overlay if Preview Audio is available */}
              {song.links.audioPreview && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer"
                  aria-label={isPlaying ? 'Pause preview' : 'Play audio preview'}
                >
                  <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-white" />
                    ) : (
                      <Play className="w-7 h-7 fill-white ml-0.5" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* In-app Audio Preview Player Bar */}
            {song.links.audioPreview && (
              <div className="w-full max-w-[224px] mt-3">
                <audio
                  ref={audioRef}
                  src={song.links.audioPreview}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={handleAudioEnded}
                  preload="none"
                />
                <button
                  onClick={togglePlay}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{isPlaying ? 'Playing Preview' : 'Listen 30s Preview'}</span>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Audio Progress Slider */}
                <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-150"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Song Information */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1 line-clamp-2">
                {song.title}
              </h2>
              <p className="text-lg sm:text-xl font-semibold text-purple-300 line-clamp-1">
                {song.artist}
              </p>
            </div>

            {/* Metadata Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <Disc3 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-[10px] text-slate-400 uppercase font-medium">Album</span>
                  <span className="font-semibold text-slate-200 truncate block">{song.album}</span>
                </div>
              </div>

              {song.releaseDate && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Released</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {new Date(song.releaseDate).getFullYear() || song.releaseDate}
                    </span>
                  </div>
                </div>
              )}

              {song.genre && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Tag className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Genre</span>
                    <span className="font-semibold text-slate-200 truncate block">{song.genre}</span>
                  </div>
                </div>
              )}

              {song.label && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Music2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Label</span>
                    <span className="font-semibold text-slate-200 truncate block">{song.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Streaming Links Buttons */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Listen on Streaming Platforms
              </span>
              <div className="flex flex-wrap gap-2.5">
                {song.links.spotify && (
                  <a
                    href={song.links.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] hover:text-[#1ed760] border border-[#1DB954]/30 text-xs font-semibold transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    <span>Spotify</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {song.links.appleMusic && (
                  <a
                    href={song.links.appleMusic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FA243C]/15 hover:bg-[#FA243C]/25 text-[#FA243C] hover:text-[#fc4358] border border-[#FA243C]/30 text-xs font-semibold transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.59-.72 1-1.72.89-2.73-.86.03-1.9.57-2.51 1.28-.54.62-1.01 1.63-.89 2.62.96.07 1.93-.45 2.51-1.17z" />
                    </svg>
                    <span>Apple Music</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {song.links.youtube && (
                  <a
                    href={song.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-[#FF4d4d] hover:text-[#ff3333] border border-[#FF0000]/30 text-xs font-semibold transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>

            {/* Lyrics snippet drawer */}
            {song.lyricsSnippet && (
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showLyrics ? 'Hide Lyrics Snippet' : 'View Lyrics Snippet'}</span>
                </button>
                {showLyrics && (
                  <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-serif italic text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
                    {song.lyricsSnippet}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
