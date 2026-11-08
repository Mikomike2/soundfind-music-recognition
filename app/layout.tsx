import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoundFind – AI-Powered Song Recognition',
  description:
    'Identify songs playing nearby through your microphone instantly. Discover artists, albums, lyrics, and streaming links on Spotify, Apple Music, and YouTube.',
  keywords: ['music recognition', 'song identifier', 'shazam alternative', 'find music', 'music finder', 'what song is this'],
  authors: [{ name: 'SoundFind' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SoundFind – Hear it. Find it. Play it.',
    description: 'Instant AI music recognition in your browser.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#090a16',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#070814] text-slate-100 antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <div className="relative min-h-screen overflow-hidden flex flex-col">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px]" />
            <div className="absolute bottom-10 -right-32 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 left-1/3 w-[450px] h-[450px] bg-fuchsia-600/10 rounded-full blur-[150px]" />
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
