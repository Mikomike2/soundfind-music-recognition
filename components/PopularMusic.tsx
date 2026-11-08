'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Flame, Play, Pause, ExternalLink, Music } from 'lucide-react';
import { PopularSong } from '@/types/music';

export const PopularMusic: React.FC = () => {
  const [songs, setSongs] = useState<PopularSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/popular')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.songs) {
          setSongs(data.songs);
        }
      })
      .catch((e) => console.warn('Could not load popular songs:', e))
      .finally(() => setLoading(false));
  }, []);

  const togglePreview = (id: string, previewUrl?: string) => {
    if (!previewUrl) return;

    if (playingId === id) {
      if (audioElement) audioElement.pause();
      setPlayingId(null);
    } else {
      if (audioElement) audioElement.pause();
      const audio = new Audio(previewUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      setAudioElement(audio);
      setPlayingId(id);
    }
  };

  return (
    <section id="trending-charts" className="w-full max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Trending Top Discoveries
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore what millions of music fans are listening to right now
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse">
              <div className="w-full aspect-square bg-white/5 rounded-xl mb-3" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {songs.slice(0, 8).map((song, index) => (
            <div
              key={song.id}
              className="glass-panel glass-panel-hover rounded-2xl p-3.5 sm:p-4 flex flex-col group relative"
            >
              {/* Cover Artwork Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 border border-white/10 shadow-lg">
                <Image
                  src={
                    song.albumCoverUrl ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={song.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />

                {/* Chart Position Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-extrabold text-amber-300 border border-white/10">
                  #{index + 1}
                </span>

                {/* Play Preview Button Overlay */}
                {song.previewUrl && (
                  <button
                    onClick={() => togglePreview(song.id, song.previewUrl)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    title={playingId === song.id ? 'Pause preview' : 'Play 30s preview'}
                  >
                    <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      {playingId === song.id ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </div>
                  </button>
                )}
              </div>

              {/* Title & Artist */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {song.title}
                </h4>
                <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                  {song.artist}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium truncate">
                    {song.genre}
                  </span>
                </div>
              </div>

              {/* Streaming Links Footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-slate-400">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Music className="w-3 h-3 text-purple-400" />
                  Popular
                </span>

                <div className="flex items-center gap-1.5">
                  {song.spotifyUrl && (
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-[#1DB954] transition-colors"
                      title="Spotify"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
