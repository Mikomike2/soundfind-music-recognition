import { NextRequest, NextResponse } from 'next/server';
import { SongData } from '@/types/music';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Query parameter q is required.' },
      { status: 400 }
    );
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://itunes.apple.com/search?term=${encoded}&entity=song&limit=5`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: 'External search provider returned an error.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: SongData[] = (data.results || []).map((item: any, index: number) => {
      const title = item.trackName || 'Unknown Title';
      const artist = item.artistName || 'Unknown Artist';
      const album = item.collectionName || 'Single';
      const cover = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '600x600bb')
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

      return {
        id: `search-${item.trackId || index}-${Date.now()}`,
        title,
        artist,
        album,
        albumCoverUrl: cover,
        genre: item.primaryGenreName || 'Music',
        releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2024',
        identifiedAt: new Date().toISOString(),
        source: 'itunes',
        confidence: 100,
        links: {
          spotify: `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`,
          appleMusic: item.trackViewUrl || item.collectionViewUrl,
          youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} audio`)}`,
          audioPreview: item.previewUrl,
        },
      };
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
