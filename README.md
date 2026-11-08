# 🎵 SoundFind – AI-Powered Song Recognition Website

An intuitive, modern, responsive music recognition web application inspired by Shazam. Identify songs playing nearby directly through your microphone in seconds.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **AudD API / Web Audio API**.

---

## ✨ Features

- 🎙️ **Instant Song Recognition**: One-tap microphone recording with real-time Web Audio API signal processing.
- 🌊 **Live 60fps Audio Visualizer**: Dynamic frequency spectrum canvas visualizing incoming ambient audio in real-time.
- ⚡ **AudD Music API Engine**: Fingerprints audio samples against a database of over 100+ million commercial songs.
- 💿 **Rich Song Details & Artwork**:
  - Song title, artist name, and album
  - Ultra HD album artwork
  - Release date, genre, and record label
  - **30-second in-browser preview player** with animated progress bar
  - Direct streaming links to **Spotify**, **Apple Music**, and **YouTube**
  - Lyrics snippet drawer
- 🕒 **Saved Search History**: Automatically preserves your recognized songs in browser `localStorage`.
- 🔥 **Trending Top Charts**: Live discovery section powered by iTunes RSS top songs.
- 🔒 **Zero Audio Storage & Privacy First**: Audio streams are processed strictly in volatile memory and never stored on any server.
- ⚙️ **Custom API Configuration Modal**: Use the built-in trial mode or configure your personal AudD API key with 300 free requests.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) & React 19 |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS & PostCSS (Glassmorphism & Custom Keyframe Animations) |
| **Icons** | Lucide React |
| **Music Recognition** | AudD Music Recognition API (`https://api.audd.io`) |
| **Metadata Enrichment** | iTunes Search API & iTunes Charts RSS |
| **Audio Capture & Analysis** | Web Audio API (`AudioContext`, `AnalyserNode`) & `MediaRecorder` |

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.18+ or v20+ / v22+
- npm, yarn, or pnpm
- A modern web browser with microphone access (Chrome, Edge, Safari, Firefox, Opera)

### 2. Installation

Clone or open the project folder in your terminal:

```bash
cd "AI-Powered Song Recognition"
```

Install dependencies:

```bash
npm install
```

### 3. Environment Configuration

SoundFind comes with default settings and a `.env.example` file. Copy it to `.env.local`:

```bash
cp .env.example .env.local
```

Inside `.env.local`:

```env
# Primary Music Recognition API: AudD
# Get a free API token with 300 free requests at: https://audd.io
# You can leave this as "test" for limited trial testing, or add your personal key:
AUDD_API_TOKEN="test"

# Optional: ACRCloud API (Alternative Provider)
ACRCLOUD_HOST=""
ACRCLOUD_ACCESS_KEY=""
ACRCLOUD_ACCESS_SECRET=""
```

> **Note on AudD API Keys:**
> - You can register at [audd.io](https://audd.io/#signup) to get **300 free queries**.
> - You can also enter or update your token directly from the website's UI by clicking the **"API Config"** button in the top navigation bar!

### 4. Running the Development Server

Start the local Next.js server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🎧 How to Use

1. Click the large glowing **"Listen"** button on the homepage.
2. Grant microphone access when prompted by your browser.
3. Play music near your device. The animated concentric rings and real-time audio visualizer will show captured sound frequencies.
4. SoundFind will sample 10–12 seconds of music (or click **"Stop Early"** at any time).
5. The audio sample is analyzed by the AudD recognition API.
6. When recognized, explore the full song card, listen to the 30-second preview, view lyrics, or jump straight to Spotify/Apple Music!
7. Your discovered songs are automatically saved in the **"Recently Identified"** section.

---

## 📁 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── popular/
│   │   │   └── route.ts         # Trending songs endpoint (iTunes RSS)
│   │   └── recognize/
│   │       └── route.ts         # Audio recognition & rate limiting
│   ├── globals.css              # Custom styling, glow keyframes & glassmorphism
│   ├── layout.tsx               # Root layout & SEO metadata
│   └── page.tsx                 # Main application interface
├── components/
│   ├── AboutSection.tsx         # Technical architecture & privacy info
│   ├── AudioVisualizer.tsx      # 60fps HTML5 Canvas frequency spectrum visualizer
│   ├── Footer.tsx               # Footer with badges and attribution
│   ├── MicPermissionModal.tsx   # Microphone troubleshoot & guide modal
│   ├── MusicRecognitionButton.tsx # Centerpiece listening button with concentric rings
│   ├── Navbar.tsx               # Responsive navigation bar & API config modal trigger
│   ├── PopularMusic.tsx         # Live trending charts & preview player
│   ├── RecentSearches.tsx       # LocalStorage search history cards
│   ├── SettingsModal.tsx        # Client-side API token management modal
│   └── SongResultCard.tsx       # High-res song card, player & streaming links
├── lib/
│   ├── audio-recorder.ts        # MediaStream, MediaRecorder & Web Audio analyser
│   └── music-api.ts             # AudD API client & iTunes enrichment
├── types/
│   └── music.ts                 # Full TypeScript interfaces & types
├── .env.example                 # Example environment variables
├── package.json                 # Project dependencies & scripts
├── tailwind.config.ts           # Custom Tailwind animations & color palette
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🔒 Security & Privacy

- **No Persistent Audio Storage**: Microphone audio is held temporarily in volatile memory solely for the purpose of computing audio fingerprints and is discarded immediately.
- **Server-Side API Key Protection**: Backend API routes shield API secrets from client-side exposure.
- **Rate Limiting**: Built-in sliding-window rate limiting prevents abuse.
- **Payload Validation**: Audio payloads are verified for valid mime types and bounded between 2KB and 15MB.

---

## 📄 License
MIT License. Created for music lovers and audio explorers.
