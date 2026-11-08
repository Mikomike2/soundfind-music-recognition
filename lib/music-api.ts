import { SongData, RecognitionApiResponse, PopularSong } from '@/types/music';

/**
 * Recognize song using AudD API
 */
export async function recognizeWithAudD(
  audioBuffer: Buffer,
  mimeType: string = 'audio/webm'
): Promise<RecognitionApiResponse> {
  const apiToken = process.env.AUDD_API_TOKEN || 'test';

  try {
    const formData = new FormData();
    // Convert Buffer to Blob for standard Fetch FormData
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer;

    const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    const audioBlob = new Blob([arrayBuffer], { type: mimeType });
    formData.append('file', audioBlob, `recording.${extension}`);
    formData.append('api_token', apiToken);
    formData.append('return', 'spotify,apple_music,deezer,lyrics');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        code: 'API_ERROR',
        error: `Music recognition service returned HTTP ${response.status}`,
        details: errText,
      };
    }

    const data = await response.json();

    const errorCode = data.error?.error_code;
    const isTokenIssue =
      errorCode === 19 ||
      errorCode === 900 ||
      errorCode === 901 ||
      errorCode === 902 ||
      data.result?.title === 'dashboard.audd.io' ||
      data.result?.artist?.includes('Please receive an api_token');

    if (isTokenIssue) {
      const isCustomToken = apiToken && apiToken !== 'test';
      return {
        success: false,
        code: 'API_KEY_MISSING',
        error: isCustomToken
          ? 'AudD Account Activation / Limit: Your personal token was accepted, but AudD reports: "the limit was reached". Please check your email inbox to verify your AudD registration link and activate your 300 free requests on dashboard.audd.io.'
          : 'AudD API token required: The default trial token ("test") is restricted by AudD. Please configure your free personal API token from dashboard.audd.io (300 free requests), or test instantly using Demo Mode.',
        details: data.error?.error_message || 'Free personal token required by AudD to recognize live microphone audio.',
      };
    }

    if (data.status === 'error') {
      const errorMsg = data.error?.error_message || 'Recognition service encountered an error';
      return {
        success: false,
        code: 'API_ERROR',
        error: errorMsg,
        details: `Error code: ${errorCode}`,
      };
    }

    if (!data.result) {
      return {
        success: false,
        code: 'NO_MATCH',
        error: 'No music was recognized in this sample. Please try holding your device closer to the audio source and try again.',
      };
    }

    const res = data.result;
    const title = res.title || 'Unknown Title';
    const artist = res.artist || 'Unknown Artist';
    const album = res.album || 'Single';
    const releaseDate = res.release_date;

    // Spotify extraction
    const spotifyUrl =
      res.spotify?.external_urls?.spotify ||
      `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`;
    const spotifyImg = res.spotify?.album?.images?.[0]?.url;
    const spotifyPreview = res.spotify?.preview_url;

    // Apple Music extraction
    let appleMusicImg: string | undefined;
    if (res.apple_music?.artwork?.url) {
      appleMusicImg = res.apple_music.artwork.url
        .replace('{w}', '600')
        .replace('{h}', '600');
    }
    const appleMusicUrl =
      res.apple_music?.url ||
      `https://music.apple.com/us/search?term=${encodeURIComponent(`${artist} ${title}`)}`;
    const applePreview = res.apple_music?.previews?.[0]?.url;

    // Lyrics extraction
    const lyricsSnippet = res.lyrics?.lyrics
      ? res.lyrics.lyrics.slice(0, 300) + (res.lyrics.lyrics.length > 300 ? '...' : '')
      : undefined;

    // YouTube link
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} audio`)}`;

    // Best album cover
    let albumCoverUrl =
      spotifyImg ||
      appleMusicImg ||
      '';

    let previewUrl = spotifyPreview || applePreview;
    let genre = 'Music';

    // Enrich with iTunes if missing cover or preview
    if (!albumCoverUrl || !previewUrl) {
      try {
        const enriched = await enrichFromItunes(artist, title);
        if (enriched) {
          if (!albumCoverUrl && enriched.coverUrl) albumCoverUrl = enriched.coverUrl;
          if (!previewUrl && enriched.previewUrl) previewUrl = enriched.previewUrl;
          if (enriched.genre) genre = enriched.genre;
        }
      } catch {
        // Enrichment failure is non-fatal
      }
    }

    if (!albumCoverUrl) {
      albumCoverUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80`;
    }

    const song: SongData = {
      id: `${artist}-${title}-${Date.now()}`.replace(/\s+/g, '-').toLowerCase(),
      title,
      artist,
      album,
      albumCoverUrl,
      releaseDate,
      genre,
      label: res.label,
      links: {
        spotify: spotifyUrl,
        appleMusic: appleMusicUrl,
        youtube: youtubeUrl,
        deezer: res.deezer?.link,
        audioPreview: previewUrl,
      },
      lyricsSnippet,
      identifiedAt: new Date().toISOString(),
      source: 'audd',
    };

    return {
      success: true,
      song,
    };
  } catch (error) {
    const isAbort = (error as Error).name === 'AbortError';
    return {
      success: false,
      code: 'API_ERROR',
      error: isAbort
        ? 'Music recognition timed out. The server took too long to respond.'
        : 'Failed to communicate with music recognition server.',
      details: (error as Error).message,
    };
  }
}

/**
 * Enrich song details with iTunes search (for 600x600 HD artwork, 30s preview audio, genre)
 */
export async function enrichFromItunes(
  artist: string,
  title: string
): Promise<{ coverUrl?: string; previewUrl?: string; genre?: string; album?: string } | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      const coverUrl = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '600x600bb')
        : undefined;

      return {
        coverUrl,
        previewUrl: item.previewUrl,
        genre: item.primaryGenreName,
        album: item.collectionName,
      };
    }
  } catch {
    // Return null on failure
  }
  return null;
}

/**
 * Fetch live top popular/trending songs using iTunes Chart API
 */
export async function getPopularSongs(): Promise<PopularSong[]> {
  try {
    const response = await fetch('https://itunes.apple.com/us/rss/topsongs/limit=12/json', {
      next: { revalidate: 1800 }, // Cache 30 minutes
    });

    if (!response.ok) {
      return getFallbackPopularSongs();
    }

    const data = await response.json();
    const entries = data?.feed?.entry;

    if (!entries || !Array.isArray(entries)) {
      return getFallbackPopularSongs();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return entries.map((entry: any, index: number) => {
      const title = entry['im:name']?.label || 'Unknown Title';
      const artist = entry['im:artist']?.label || 'Unknown Artist';
      const album = entry['im:collection']?.['im:name']?.label || 'Top Hit';
      const genre = entry['category']?.attributes?.label || 'Pop';
      const releaseDate = entry['im:releaseDate']?.attributes?.label || '2025';
      const id = entry?.id?.attributes?.['im:id'] || `popular-${index}`;

      // Images in feed: entry['im:image'] is array [55x55, 60x60, 170x170]
      const rawImage = entry['im:image']?.[2]?.label || '';
      const albumCoverUrl = rawImage ? rawImage.replace('170x170bb', '600x600bb') : '';

      // Preview audio
      const previewUrl = entry?.link?.find((l: { attributes?: { title?: string; href?: string } }) =>
        l.attributes?.title === 'Preview'
      )?.attributes?.href;

      return {
        id,
        title,
        artist,
        album,
        albumCoverUrl,
        genre,
        releaseDate,
        previewUrl,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`,
        appleMusicUrl: entry?.link?.[0]?.attributes?.href,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} audio`)}`,
      };
    });
  } catch {
    return getFallbackPopularSongs();
  }
}

/**
 * Fallback popular songs in case external iTunes RSS is blocked or offline
 */
export function getFallbackPopularSongs(): PopularSong[] {
  return [
    {
      id: 'pop-1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      albumCoverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      genre: 'Synth-Pop',
      releaseDate: '2020',
      spotifyUrl: 'https://open.spotify.com/search/The%20Weeknd%20Blinding%20Lights',
      youtubeUrl: 'https://www.youtube.com/results?search_query=The+Weeknd+Blinding+Lights',
    },
    {
      id: 'pop-2',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      albumCoverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      genre: 'Nu-Disco / Pop',
      releaseDate: '2020',
      spotifyUrl: 'https://open.spotify.com/search/Dua%20Lipa%20Levitating',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Dua+Lipa+Levitating',
    },
    {
      id: 'pop-3',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3: OVER YOU',
      albumCoverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      genre: 'Pop Rock',
      releaseDate: '2021',
      spotifyUrl: 'https://open.spotify.com/search/The%20Kid%20LAROI%20Stay',
      youtubeUrl: 'https://www.youtube.com/results?search_query=The+Kid+LAROI+Stay',
    },
    {
      id: 'pop-4',
      title: 'As It Was',
      artist: 'Harry Styles',
      album: "Harry's House",
      albumCoverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      genre: 'Indie Pop',
      releaseDate: '2022',
      spotifyUrl: 'https://open.spotify.com/search/Harry%20Styles%20As%20It%20Was',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Harry+Styles+As+It+Was',
    },
  ];
}

/**
 * Pre-configured rich demo songs for instant testing without an external API key
 */
export const DEMO_SONGS: SongData[] = [
  {
    id: 'demo-the-weeknd-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumCoverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    releaseDate: '2020-03-20',
    genre: 'Synth-Pop',
    label: 'XO / Republic Records',
    confidence: 99,
    duration: '3:20',
    source: 'demo',
    identifiedAt: new Date().toISOString(),
    links: {
      spotify: 'https://open.spotify.com/search/The%20Weeknd%20Blinding%20Lights',
      appleMusic: 'https://music.apple.com/us/search?term=The+Weeknd+Blinding+Lights',
      youtube: 'https://www.youtube.com/results?search_query=The+Weeknd+Blinding+Lights',
      deezer: 'https://www.deezer.com/search/The%20Weeknd%20Blinding%20Lights',
      audioPreview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/4a/1f/c5/4a1fc519-5d2f-4886-f4f6-fa5e6b72a44b/mzaf_10332822453629472314.plus.aac.p.m4a',
    },
    lyricsSnippet: "I've been on my own for long enough\nMaybe you can show me how to love, maybe\nI'm going through withdrawals\nYou don't even have to do too much\nYou can turn me on with just a touch, baby\nI look around and Sin City's cold and empty...",
  },
  {
    id: 'demo-dua-lipa-levitating',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    albumCoverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    releaseDate: '2020-03-27',
    genre: 'Nu-Disco / Pop',
    label: 'Warner Records',
    confidence: 97,
    duration: '3:23',
    source: 'demo',
    identifiedAt: new Date().toISOString(),
    links: {
      spotify: 'https://open.spotify.com/search/Dua%20Lipa%20Levitating',
      appleMusic: 'https://music.apple.com/us/search?term=Dua+Lipa+Levitating',
      youtube: 'https://www.youtube.com/results?search_query=Dua+Lipa+Levitating',
      deezer: 'https://www.deezer.com/search/Dua%20Lipa%20Levitating',
      audioPreview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/8e/3d/8c/8e3d8cf6-c322-9a3b-28f0-16ff4f169f4b/mzaf_7882208034505085354.plus.aac.p.m4a',
    },
    lyricsSnippet: "If you wanna run away with me, I know a galaxy\nAnd I can take you for a ride\nI had a premonition that we fell into a rhythm\nWhere the music don't stop for life\nGlitter in the sky, glitter in my eyes...",
  },
  {
    id: 'demo-harry-styles-as-it-was',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    albumCoverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    releaseDate: '2022-04-01',
    genre: 'Indie Pop',
    label: 'Columbia Records',
    confidence: 98,
    duration: '2:47',
    source: 'demo',
    identifiedAt: new Date().toISOString(),
    links: {
      spotify: 'https://open.spotify.com/search/Harry%20Styles%20As%20It%20Was',
      appleMusic: 'https://music.apple.com/us/search?term=Harry+Styles+As+It+Was',
      youtube: 'https://www.youtube.com/results?search_query=Harry+Styles+As+It+Was',
      audioPreview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/33/c2/f5/33c2f540-349f-b7a9-195c-9c0bb149e81b/mzaf_7302450550424564295.plus.aac.p.m4a',
    },
    lyricsSnippet: "Hold on, ring into the new\nI don't wanna talk about the way that it was\nLeave America, two kids follow her\nI don't wanna talk about who's doin' it first\nAs it was, you know it's not the same as it was...",
  },
];

/**
 * Returns a demo song for simulation or zero-configuration testing
 */
export async function getDemoRecognitionResult(songIndex?: number): Promise<RecognitionApiResponse> {
  const index =
    typeof songIndex === 'number'
      ? Math.abs(songIndex) % DEMO_SONGS.length
      : Math.floor(Math.random() * DEMO_SONGS.length);

  const baseSong = DEMO_SONGS[index];

  try {
    const enriched = await enrichFromItunes(baseSong.artist, baseSong.title);
    if (enriched) {
      return {
        success: true,
        song: {
          ...baseSong,
          albumCoverUrl: enriched.coverUrl || baseSong.albumCoverUrl,
          links: {
            ...baseSong.links,
            audioPreview: enriched.previewUrl || baseSong.links.audioPreview,
          },
          identifiedAt: new Date().toISOString(),
        },
      };
    }
  } catch {
    // Ignore enrichment failure
  }

  return {
    success: true,
    song: {
      ...baseSong,
      identifiedAt: new Date().toISOString(),
    },
  };
}

