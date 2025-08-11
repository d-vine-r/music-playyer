import { NextResponse } from 'next/server'

// Server-side route to fetch Spotify recommendations using Client Credentials flow
// Expects JSON body: { seed_genres: string[], market?: string, limit?: number }

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Spotify token error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const seedGenres: string[] = Array.isArray(body?.seed_genres) ? body.seed_genres.filter(Boolean) : []
    const limit: number = Number(body?.limit) || 10
    const market: string | undefined = typeof body?.market === 'string' ? body.market : undefined

    if (seedGenres.length === 0) {
      return NextResponse.json({ error: 'seed_genres is required' }, { status: 400 })
    }

    const accessToken = await getSpotifyAccessToken()

    const params = new URLSearchParams({
      seed_genres: seedGenres.slice(0, 3).join(','),
      limit: String(Math.min(Math.max(limit, 1), 50)),
    })
    if (market) params.set('market', market)

    const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`

    const recRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    const text = await recRes.text()
    if (!recRes.ok) {
      return NextResponse.json({ error: text || 'Spotify API error' }, { status: recRes.status })
    }

    const data = JSON.parse(text)
    return NextResponse.json({ tracks: data.tracks ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}

