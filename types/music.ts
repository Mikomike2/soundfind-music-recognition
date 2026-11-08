export type RecognitionStatus =
  | 'idle'
  | 'requesting_permission'
  | 'permission_denied'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error';

export interface MusicLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  deezer?: string;
  audioPreview?: string;
}

export interface SongData {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCoverUrl: string;
  releaseDate?: string;
  genre?: string;
  label?: string;
  links: MusicLinks;
  lyricsSnippet?: string;
  identifiedAt: string; // ISO date string
  confidence?: number;
  duration?: string;
  source?: 'audd' | 'acrcloud' | 'itunes' | 'demo';
}

export interface RecognitionApiResponse {
  success: boolean;
  song?: SongData;
  error?: string;
  details?: string;
  code?: 'NO_MATCH' | 'API_KEY_MISSING' | 'API_ERROR' | 'INVALID_AUDIO' | 'RATE_LIMITED';
}

export interface RecognitionHistoryItem extends SongData {
  searchedAt: number; // timestamp
}

export interface PopularSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCoverUrl: string;
  genre: string;
  releaseDate: string;
  previewUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
}
