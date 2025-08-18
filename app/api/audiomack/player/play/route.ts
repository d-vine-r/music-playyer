import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, id, session, album_id, playlist_id, hq, key } = await request.json();
    if (!query && !id) {
      return NextResponse.json({ error: 'Either query or track ID is required' }, { status: 400 });
    }

    let audioUrl = null;
    let title = 'Unknown Title';
    let artist = 'Unknown Artist';

    if (query) {
      // Use Audiomack API to search for DJ mixes
      const searchUrl = `https://api.audiomack.com/v1/search?q=${encodeURIComponent(query + ' dj mix')}`;
      const res = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch Audiomack search results' }, { status: 500 });
      }

      const data = await res.json();
      const firstResult = data?.results?.[0];

      if (!firstResult) {
        return NextResponse.json({ error: 'No DJ mix found' }, { status: 404 });
      }

      title = firstResult.title || title;
      artist = firstResult.artist || artist;
      audioUrl = firstResult.audioUrl || null;
    }

    if (id) {
      // Fetch track streaming source using Audiomack API
      const playUrl = `https://api.audiomack.com/v1/music/${id}/play`;
      const res = await fetch(playUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session, album_id, playlist_id, hq, key }),
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch track streaming source' }, { status: 500 });
      }

      const data = await res.json();
      audioUrl = data?.audioUrl || null;
      title = data?.title || title;
      artist = data?.artist || artist;
    }

    if (!audioUrl) {
      return NextResponse.json({ error: 'Failed to fetch audio URL' }, { status: 404 });
    }

    return NextResponse.json({
      audioUrl,
      title,
      artist,
    });
  } catch (err: any) {
    console.error('Audiomack play track route error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
