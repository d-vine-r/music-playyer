import { NextResponse } from "next/server"
import { MoodAnalyzer } from "@/lib/mood"

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
    return NextResponse.json({ error: "Mood query param is required" }, { status: 400 })
  }

  try {
    // 1. Analyze mood
    const analyzer = new MoodAnalyzer()
    const analysis = analyzer.analyzeMood({ mood, countryCode: country })

    // 2. Generate queries (keywords + mood category)
    const keywordGroups = [
      `${analysis.category} music`,
      ...analysis.keywords.slice(0, 3),
      `${analysis.category} playlist`,
    ]

    // 3. Get Spotify token
    const { access_token } = await getSpotifyAccessToken()

    // 4. Perform parallel searches
    const searchResults = await Promise.all(
      keywordGroups.map(async (q) => {
        const res = await fetch(
          `${SPOTIFY_SEARCH_URL}?q=${encodeURIComponent(q)}&type=track&limit=5`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        if (!res.ok) return []
        const json = await res.json()
        return json?.tracks?.items || []
      })
    )

    // 5. Flatten, dedupe by track id
    const allTracks = searchResults.flat()
    const uniqueTracks = Array.from(new Map(allTracks.map((t: any) => [t.id, t])).values())

    return NextResponse.json({
      mood,
      analysis,
      count: uniqueTracks.length,
      tracks: uniqueTracks,
    })
  } catch (err: any) {
    console.error("Recommendation error:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
