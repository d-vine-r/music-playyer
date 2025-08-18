import { NextResponse } from 'next/server'
import { MoodAnalyzer } from '@/lib/mood'
import { LocationService } from '@/lib/location-service'

// Ensure Node.js runtime for server-only features like Buffer
export const runtime = 'nodejs'

interface RecommendationRequest {
  seed_genres: string[]
  limit?: number
}

// Fetch Spotify access token via Client Credentials Flow
async function fetchToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials in environment')
  }
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })
  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    throw new Error(`Token fetch failed: ${errText}`)
  }
  const { access_token } = await tokenRes.json()
  return access_token
}

export async function POST(request: Request) {
  try {
    // Accept location in request body
    const { seed_genres, limit = 10, location } = (await request.json()) as RecommendationRequest & { location?: string };
    if (!seed_genres || seed_genres.length === 0) {
      return NextResponse.json({ error: 'No seed_genres provided' }, { status: 400 })
    }
    const token = await fetchToken()

    // Get location from request or LocationService
    let userLocation = location;
    if (!userLocation) {
      try {
        const locData = await LocationService.getCurrentLocation();
        userLocation = locData?.country;
      } catch (e) {
        userLocation = undefined;
      }
    }

    // Get popular artists for location
    // const popularArtists = userLocation ? MoodAnalyzer.getPopularArtists(userLocation) : [];
    // Combine genres and artists for search
    const queryParts = [...seed_genres];
    const query = queryParts.join(' ');

    // Search tracks via Spotify Search endpoint (using mood seed genres + local artists)
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!searchRes.ok) {
      const errText = await searchRes.text()
      throw new Error(`Search fetch failed: ${errText}`)
    }
    const searchJson = await searchRes.json()
    const tracks: any[] = searchJson.tracks?.items || []

    // Fetch audio features
    const ids = tracks.map(t => t.id).join(',')
    let featuresMap: Record<string, any> = {}
    if (ids) {
      const featRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (featRes.ok) {
        const featJson = await featRes.json()
        featJson.audio_features.forEach((f: any) => {
          if (f && f.id) featuresMap[f.id] = f
        })
      }
    }

    // Combine
    const enriched = tracks.map(t => ({
      ...t,
      audio_features: featuresMap[t.id] || null,
    }))
    return NextResponse.json({ tracks: enriched })
  } catch (err: any) {
    console.error('Recommendations route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}