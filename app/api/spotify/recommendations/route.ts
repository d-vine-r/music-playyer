import { NextResponse } from "next/server"
import { MoodAnalyzer } from "@/lib/mood"

// Spotify endpoints
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"
const SPOTIFY_RECOMMENDATIONS_URL = "https://api.spotify.com/v1/recommendations"

async function getSpotifyAccessToken() {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64")

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch Spotify token")
  }

  return res.json() as Promise<{ access_token: string }>
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mood = searchParams.get("mood") || ""
  const country = searchParams.get("country") || "US"

  if (!mood) {
    return NextResponse.json(
      { error: "Mood query param is required" },
      { status: 400 }
    )
  }

  try {
    // 1. Analyze mood
    const analyzer = new MoodAnalyzer()
    const analysis = analyzer.analyzeMood({ mood, countryCode: country })
    const recs = analyzer.recommendSongs(analysis, 5) // curated suggestions

    // 2. Get Spotify token
    const { access_token } = await getSpotifyAccessToken()

    // 3. Try to resolve curated songs → Spotify track IDs
    const trackIds: string[] = []
    for (const rec of recs) {
      const q = encodeURIComponent(`${rec.title} ${rec.artist}`)
      const res = await fetch(`${SPOTIFY_SEARCH_URL}?q=${q}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.tracks.items.length > 0) {
          trackIds.push(json.tracks.items[0].id)
        }
      }
    }

    // 4. Build seed genres from mood category
    const seedGenresMap: Record<string, string[]> = {
      happy: ["pop", "dance", "edm"],
      sad: ["acoustic", "piano", "indie"],
      chill: ["chill", "lofi", "ambient"],
      energetic: ["workout", "edm", "hip-hop"],
      party: ["party", "house", "dance"],
      romantic: ["r-n-b", "soul", "pop"],
      focused: ["focus", "study", "ambient"],
    }
    const seedGenres = seedGenresMap[analysis.category] || ["pop"]

    // 5. Call Spotify recommendations API
    const params = new URLSearchParams()
    params.set("limit", "20")

    if (seedGenres.length > 0) {
      params.set("seed_genres", seedGenres.slice(0, 5).join(","))
    }
    if (trackIds.length > 0) {
      params.set("seed_tracks", trackIds.slice(0, 5).join(","))
    }

    const recRes = await fetch(`${SPOTIFY_RECOMMENDATIONS_URL}?${params}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!recRes.ok) {
      throw new Error("Spotify recommendations request failed")
    }

    const data = await recRes.json()

    return NextResponse.json({
      mood,
      analysis,
      seedTracks: trackIds,
      seedGenres,
      recommendations: data.tracks,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
