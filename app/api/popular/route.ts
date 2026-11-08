import { NextResponse } from 'next/server';
import { getPopularSongs } from '@/lib/music-api';

export const revalidate = 1800; // Cache 30 minutes

export async function GET() {
  try {
    const songs = await getPopularSongs();
    return NextResponse.json({ success: true, songs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending music charts' },
      { status: 500 }
    );
  }
}
