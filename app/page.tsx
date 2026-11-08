'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { MusicRecognitionButton } from '@/components/MusicRecognitionButton';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { SongResultCard } from '@/components/SongResultCard';
import { RecentSearches } from '@/components/RecentSearches';
import { PopularMusic } from '@/components/PopularMusic';
import { AboutSection } from '@/components/AboutSection';
import { MicPermissionModal } from '@/components/MicPermissionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Footer } from '@/components/Footer';
import { AudioRecorder } from '@/lib/audio-recorder';
import { LyricListener } from '@/lib/lyric-listener';
import { RecognitionStatus, SongData, RecognitionHistoryItem } from '@/types/music';
import {
  Sparkles,
  Radio,
  AlertTriangle,
  Upload,
  Play,
  KeyRound,
  Disc,
  Search,
  Monitor,
  Loader2,
  Mic,
} from 'lucide-react';

const MAX_RECORDING_SECONDS = 12;

export default function HomePage() {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [identifiedSong, setIdentifiedSong] = useState<SongData | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [history, setHistory] = useState<RecognitionHistoryItem[]>([]);
  const [customAuddToken, setCustomAuddToken] = useState<string>('');
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Live lyrics and fallback search state
  const [heardLyrics, setHeardLyrics] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [autoFallback, setAutoFallback] = useState(false);

  // Audio visualizer state
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Refs
  const recorderRef = useRef<AudioRecorder | null>(null);
  const lyricListenerRef = useRef<LyricListener | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Load history & custom token from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('soundfind_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedToken = localStorage.getItem('soundfind_custom_audd_token');
      if (savedToken) {
        setCustomAuddToken(savedToken);
      }

      const savedFallback = localStorage.getItem('soundfind_auto_fallback');
      if (savedFallback !== null) {
        setAutoFallback(savedFallback === 'true');
      }
    } catch (e) {
      console.warn('Failed to load localStorage:', e);
    }
  }, []);

  // 2. Save history updates to localStorage
  const saveSongToHistory = (song: SongData) => {
    setHistory((prev) => {
      // Remove any duplicate of the same song id/title
      const filtered = prev.filter(
        (item) => item.title.toLowerCase() !== song.title.toLowerCase() || item.artist.toLowerCase() !== song.artist.toLowerCase()
      );
      const updated: RecognitionHistoryItem[] = [
        { ...song, searchedAt: Date.now() },
        ...filtered,
      ].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem('soundfind_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('soundfind_history');
    } catch {
      // Ignore
    }
  };

  const handleSaveToken = (token: string) => {
    setCustomAuddToken(token);
    try {
      if (token) {
        localStorage.setItem('soundfind_custom_audd_token', token);
      } else {
        localStorage.removeItem('soundfind_custom_audd_token');
      }
    } catch {
      // Ignore
    }
  };

  // 3. Clear recording timers
  const clearRecordingTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // 4. Start listening & recording
  const startListening = async () => {
    setErrorMessage(null);
    setErrorDetails(null);
    setErrorCode(null);
    setHeardLyrics('');
    setStatus('requesting_permission');
    setSecondsElapsed(0);

    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }

      await recorderRef.current.start({
        onFrequencyData: (data) => {
          // Copy array to trigger React render
          setFrequencyData(new Uint8Array(data));
        },
        onVolumeChange: (vol) => {
          setVolumeLevel(vol);
        },
      });

      // Start AI lyric ear listener in parallel
      if (!lyricListenerRef.current) {
        lyricListenerRef.current = new LyricListener((txt) => {
          setHeardLyrics(txt);
        });
      }
      lyricListenerRef.current.start();

      setStatus('listening');

      // Countdown timer
      let elapsed = 0;
      clearRecordingTimer();
      timerIntervalRef.current = setInterval(() => {
        elapsed += 1;
        setSecondsElapsed(elapsed);

        // Stop automatically once max duration is reached
        if (elapsed >= MAX_RECORDING_SECONDS) {
          clearRecordingTimer();
          stopListeningAndRecognize();
        }
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      clearRecordingTimer();
      const errorObj = err as Error;

      if (
        errorObj.name === 'NotAllowedError' ||
        errorObj.name === 'PermissionDeniedError' ||
        errorObj.message?.includes('Permission denied')
      ) {
        setStatus('permission_denied');
        setIsMicModalOpen(true);
      } else {
        setStatus('error');
        setErrorMessage(
          errorObj.name === 'NotFoundError'
            ? 'No microphone hardware found on your device.'
            : 'Unable to access microphone. Please check your system audio settings.'
        );
      }
    }
  };

  // 5. Stop listening and send audio to recognition backend
  const stopListeningAndRecognize = async () => {
    clearRecordingTimer();

    if (!recorderRef.current || !recorderRef.current.recording) {
      return;
    }

    const capturedLyrics = lyricListenerRef.current?.stop() || heardLyrics;

    setStatus('processing');
    setFrequencyData(null);

    try {
      const audioBlob = await recorderRef.current.stop();

      // If audio is too tiny
      if (audioBlob.size < 1500) {
        setStatus('error');
        setErrorCode('INVALID_AUDIO');
        setErrorMessage('The recorded audio was too short to identify. Please hold the mic closer to the music.');
        return;
      }

      // Send to Next.js API
      const formData = new FormData();
      formData.append('file', audioBlob, 'sample.webm');
      if (customAuddToken) {
        formData.append('custom_token', customAuddToken);
      }

      const res = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.song) {
        setStatus('success');
        setIdentifiedSong(data.song);
        saveSongToHistory(data.song);

        // Smooth scroll to the result
        setTimeout(() => {
          const el = document.getElementById('result-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        // If AudD failed (e.g. quota limit reached) but lyric ear heard vocal lyrics, identify via lyrics:
        if (capturedLyrics && capturedLyrics.trim().length > 3) {
          try {
            const searchRes = await fetch(`/api/search?q=${encodeURIComponent(capturedLyrics.trim())}`);
            const searchData = await searchRes.json();
            if (searchData.success && searchData.results && searchData.results.length > 0) {
              const matchedSong = searchData.results[0];
              setStatus('success');
              setIdentifiedSong(matchedSong);
              saveSongToHistory(matchedSong);
              setTimeout(() => {
                const el = document.getElementById('result-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 150);
              return;
            }
          } catch {
            // Non-fatal search fallback
          }
        }

        setStatus('error');
        setErrorCode(data.code || null);
        setErrorMessage(data.error || 'No matching song found.');
        if (capturedLyrics) {
          setSearchQuery(capturedLyrics);
        }
        if (data.details) setErrorDetails(data.details);
      }
    } catch (error) {
      console.error('Audio recognition request failed:', error);
      setStatus('error');
      setErrorMessage('Network connection lost or server request failed. Please try again.');
    }
  };

  // 6. Test with a demo track (zero-setup simulation)
  const handleTryDemoSong = async () => {
    clearRecordingTimer();
    if (recorderRef.current) {
      recorderRef.current.cancel();
    }
    setStatus('processing');
    setErrorMessage(null);
    setErrorDetails(null);
    setErrorCode(null);
    setFrequencyData(null);

    try {
      const formData = new FormData();
      formData.append('is_demo', 'true');

      const res = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.song) {
        setStatus('success');
        setIdentifiedSong(data.song);
        saveSongToHistory(data.song);

        setTimeout(() => {
          const el = document.getElementById('result-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to load demo song.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Could not load demo track. Please check network connection.');
    }
  };

  // 7. Upload and analyze an audio file (mp3, wav, m4a, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    clearRecordingTimer();
    if (recorderRef.current) {
      recorderRef.current.cancel();
    }

    setErrorMessage(null);
    setErrorDetails(null);
    setErrorCode(null);
    setStatus('processing');
    setFrequencyData(null);

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      if (customAuddToken) {
        formData.append('custom_token', customAuddToken);
      }
      formData.append('auto_fallback', autoFallback ? 'true' : 'false');

      const res = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.song) {
        setStatus('success');
        setIdentifiedSong(data.song);
        saveSongToHistory(data.song);

        setTimeout(() => {
          const el = document.getElementById('result-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        setStatus('error');
        setErrorCode(data.code || null);
        setErrorMessage(data.error || 'No matching song found in this audio file.');
        if (data.details) setErrorDetails(data.details);
      }
    } catch (err) {
      console.error('File upload recognition failed:', err);
      setStatus('error');
      setErrorMessage('Failed to upload or recognize the audio file.');
    }
  };

  // 8. Capture directly from a browser tab (YouTube/Spotify playing on computer)
  const startTabListening = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      alert('Tab / screen audio capture is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        stream.getTracks().forEach((t) => t.stop());
        setStatus('error');
        setErrorMessage('No tab audio was shared. Please check "Share audio" when picking a tab.');
        return;
      }

      setErrorMessage(null);
      setErrorDetails(null);
      setErrorCode(null);
      setStatus('listening');
      setSecondsElapsed(0);

      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }

      await recorderRef.current.start(
        {
          onFrequencyData: (data) => setFrequencyData(new Uint8Array(data)),
          onVolumeChange: (vol) => setVolumeLevel(vol),
        },
        stream
      );

      let elapsed = 0;
      clearRecordingTimer();
      timerIntervalRef.current = setInterval(() => {
        elapsed += 1;
        setSecondsElapsed(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) {
          clearRecordingTimer();
          stopListeningAndRecognize();
        }
      }, 1000);
    } catch (err) {
      console.warn('Tab audio cancelled:', err);
    }
  };

  // 9. Fallback search by song title, artist, or lyrics
  const handleTextSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (data.success && data.results && data.results.length > 0) {
        const topSong = data.results[0];
        setStatus('success');
        setIdentifiedSong(topSong);
        saveSongToHistory(topSong);
        setErrorMessage(null);

        setTimeout(() => {
          const el = document.getElementById('result-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        setErrorMessage(`No matches found for "${searchQuery.trim()}". Try different keywords or lyrics.`);
      }
    } catch {
      setErrorMessage('Search request failed. Please check your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset to listen again
  const handleReset = () => {
    clearRecordingTimer();
    if (recorderRef.current) {
      recorderRef.current.cancel();
    }
    if (lyricListenerRef.current) {
      lyricListenerRef.current.stop();
    }
    setStatus('idle');
    setErrorMessage(null);
    setErrorDetails(null);
    setErrorCode(null);
    setHeardLyrics('');
    setSecondsElapsed(0);
    setFrequencyData(null);
    // Keep identifiedSong in history or memory, but scroll back up to core button
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRecordingTimer();
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      if (lyricListenerRef.current) {
        lyricListenerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        recentCount={history.length}
      />

      {/* Main Hero Recognition Section */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-14 px-4 relative z-10" id="hero-section">
        {/* Glow ambient background elements */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>SoundFind AI Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Discover{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Any Song.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-medium">
            Hear it. Find it. Play it.
          </p>
        </div>

        {/* Centerpiece Listening Button */}
        <MusicRecognitionButton
          status={status}
          secondsElapsed={secondsElapsed}
          maxSeconds={MAX_RECORDING_SECONDS}
          onStart={startListening}
          onStop={stopListeningAndRecognize}
          onRetry={startListening}
        />

        {/* Real-Time Web Audio Visualizer */}
        <div className="my-2 w-full">
          <AudioVisualizer
            isListening={status === 'listening'}
            isProcessing={status === 'processing'}
            frequencyData={frequencyData}
            volume={volumeLevel}
          />
        </div>

        {/* Live Detected Lyrics Pill when listening */}
        {status === 'listening' && heardLyrics && (
          <div className="my-1.5 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-medium animate-pulse flex items-center gap-1.5 shadow-sm">
            <Mic className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="truncate max-w-sm sm:max-w-md">Hearing lyrics: &ldquo;{heardLyrics}&rdquo;</span>
          </div>
        )}

        {/* Quick Testing & Alternative Input Options */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 my-2">
          {/* Hidden Audio File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handleTryDemoSong}
            disabled={status === 'listening' || status === 'processing'}
            id="try-demo-song-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Recognize a sample track without microphone access"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Try Demo Track</span>
          </button>

          <button
            onClick={startTabListening}
            disabled={status === 'listening' || status === 'processing'}
            id="capture-tab-audio-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Capture clear digital audio directly from a browser tab (YouTube, Spotify, etc.)"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Capture Tab Audio</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={status === 'listening' || status === 'processing'}
            id="upload-audio-file-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Upload an MP3, WAV, or M4A audio file to recognize"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload Audio File</span>
          </button>
        </div>

        {/* Error Alert Banner if recognition failed */}
        {status === 'error' && errorMessage && (
          <div className="w-full max-w-lg mx-auto my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/70 to-slate-900/90 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 backdrop-blur-md shadow-xl animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-semibold text-[11px] uppercase tracking-wider">
                    {errorCode === 'API_KEY_MISSING' ? 'AudD API Token Needed' : 'Recognition Notice'}
                  </span>
                </div>
                <p className="font-semibold text-white leading-snug">{errorMessage}</p>
                {errorDetails && (
                  <p className="text-[11px] text-rose-300/80 font-mono mt-1 break-all">{errorDetails}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                {errorCode === 'API_KEY_MISSING' ? (
                  <>
                    <button
                      onClick={handleTryDemoSong}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-600/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Continue with Free Demo Mode</span>
                    </button>
                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-purple-300" />
                      <span>Check API Key</span>
                    </button>
                    <a
                      href="https://dashboard.audd.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      <span>Open AudD Dashboard</span>
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startListening}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-white font-medium text-xs transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleTryDemoSong}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white font-medium text-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Try Demo Track</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-300" />
                      <span>Upload File</span>
                    </button>
                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Check API Key</span>
                    </button>
                  </>
                )}
              </div>

              {/* Instant Search Fallback when audio signature cannot be matched */}
              <div className="pt-2 border-t border-rose-500/20">
                <p className="text-[11px] text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Can't match by sound? Search by title, artist, or lyrics:</span>
                </p>
                <form onSubmit={handleTextSearch} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Song title, artist, or lyrics..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    <span>Search</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Identified Song Result Section */}
        {identifiedSong && (
          <div id="result-section" className="w-full">
            <SongResultCard
              song={identifiedSong}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Recently Identified Songs History */}
        <RecentSearches
          history={history}
          onSelectSong={(song) => {
            setIdentifiedSong(song);
            const el = document.getElementById('result-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          onClearHistory={handleClearHistory}
        />

        {/* Trending & Popular Music Charts */}
        <PopularMusic />

        {/* How It Works & Architecture Section */}
        <AboutSection />
      </main>

      {/* Modals */}
      <MicPermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        onRetry={startListening}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        customToken={customAuddToken}
        onSaveToken={handleSaveToken}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
