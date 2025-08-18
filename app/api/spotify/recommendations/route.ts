import { NextResponse } from "next/server"
import { MoodAnalyzer } from "@/lib/mood"

// Spotify token URL
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"

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
    const recs = analyzer.recommendSongs(analysis, 5)

    // 2. Get token
    const { access_token } = await getSpotifyAccessToken()

    // 3. For each recommended song → search on Spotify
    const trackResults = await Promise.all(
      recs.map(async (rec) => {
        const q = encodeURIComponent(`${rec.title} ${rec.artist}`)
        const res = await fetch(`${SPOTIFY_SEARCH_URL}?q=${q}&type=track&limit=1`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (!res.ok) return null
        const json = await res.json()
        const track = json?.tracks?.items?.[0]
        return track || null
      })
    )

    // 4. Flatten results and filter nulls
    const tracks = trackResults.filter((t): t is any => t !== null)

    return NextResponse.json({
      mood,
      analysis,
      count: tracks.length,
      tracks,
    })
  } catch (err: any) {
    console.error("Recommendation error:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
