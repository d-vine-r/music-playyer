import type { Song, MoodAnalysis, LocationData } from "@/types"

// Minimal runtime-safe fetch wrapper
async function safeJsonFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, cache: 'no-store' })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  return JSON.parse(text) as T
}

export class SpotifyService {
  // Simulated Spotify API - In production, you'd use the actual Spotify Web API
  private static readonly SAMPLE_SONGS: Song[] = [
    {
      id: "1",
      name: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.73,
        valence: 0.33,
        danceability: 0.51,
        acousticness: 0.0,
        instrumentalness: 0.0,
        liveness: 0.09,
        speechiness: 0.06,
        tempo: 171,
      },
      genres: ["pop", "electronic"],
      isPopularInRegion: true,
    },
    {
      id: "2",
      name: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "2:58",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.66,
        valence: 0.56,
        danceability: 0.56,
        acousticness: 0.11,
        instrumentalness: 0.0,
        liveness: 0.31,
        speechiness: 0.15,
        tempo: 166,
      },
      genres: ["pop", "rock"],
      isPopularInRegion: false,
    },
    {
      id: "3",
      name: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.82,
        valence: 0.7,
        danceability: 0.7,
        acousticness: 0.0,
        instrumentalness: 0.0,
        liveness: 0.07,
        speechiness: 0.05,
        tempo: 103,
      },
      genres: ["pop", "dance"],
      isPopularInRegion: true,
    },
    {
      id: "4",
      name: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.55,
        valence: 0.56,
        danceability: 0.55,
        acousticness: 0.12,
        instrumentalness: 0.0,
        liveness: 0.33,
        speechiness: 0.05,
        tempo: 95,
      },
      genres: ["pop", "rock"],
      isPopularInRegion: false,
    },
    {
      id: "5",
      name: "drivers license",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "4:02",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.43,
        valence: 0.15,
        danceability: 0.56,
        acousticness: 0.72,
        instrumentalness: 0.0,
        liveness: 0.1,
        speechiness: 0.04,
        tempo: 144,
      },
      genres: ["pop", "indie"],
      isPopularInRegion: true,
    },
    {
      id: "6",
      name: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "F*CK LOVE 3: OVER YOU",
      duration: "2:21",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.76,
        valence: 0.48,
        danceability: 0.59,
        acousticness: 0.07,
        instrumentalness: 0.0,
        liveness: 0.11,
        speechiness: 0.06,
        tempo: 169,
      },
      genres: ["pop", "hip-hop"],
      isPopularInRegion: false,
    },
    {
      id: "7",
      name: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: "3:58",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.76,
        valence: 0.56,
        danceability: 0.76,
        acousticness: 0.44,
        instrumentalness: 0.0,
        liveness: 0.1,
        speechiness: 0.07,
        tempo: 80,
      },
      genres: ["indie", "electronic"],
      isPopularInRegion: true,
    },
    {
      id: "8",
      name: "Industry Baby",
      artist: "Lil Nas X & Jack Harlow",
      album: "MONTERO",
      duration: "3:32",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.7,
        valence: 0.69,
        danceability: 0.73,
        acousticness: 0.02,
        instrumentalness: 0.0,
        liveness: 0.23,
        speechiness: 0.25,
        tempo: 149,
      },
      genres: ["hip-hop", "pop"],
      isPopularInRegion: false,
    },
    {
      id: "9",
      name: "Shivers",
      artist: "Ed Sheeran",
      album: "=",
      duration: "3:27",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.84,
        valence: 0.87,
        danceability: 0.63,
        acousticness: 0.02,
        instrumentalness: 0.0,
        liveness: 0.09,
        speechiness: 0.06,
        tempo: 141,
      },
      genres: ["pop", "dance"],
      isPopularInRegion: true,
    },
    {
      id: "10",
      name: "Bad Habits",
      artist: "Ed Sheeran",
      album: "=",
      duration: "3:50",
      albumArt: "/placeholder.svg?height=64&width=64",
      audioFeatures: {
        energy: 0.89,
        valence: 0.45,
        danceability: 0.72,
        acousticness: 0.01,
        instrumentalness: 0.0,
        liveness: 0.31,
        speechiness: 0.04,
        tempo: 126,
      },
      genres: ["pop", "electronic"],
      isPopularInRegion: false,
    },
  ]

  static async searchSongs(moodAnalysis: MoodAnalysis, location: LocationData | null): Promise<Song[]> {
    // Prefer real Spotify Web API if environment variables are set
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    try {
      if (clientId && clientSecret) {
        // Build up to three seed genres from mood analysis
        const seedGenres = (moodAnalysis.genres || []).filter(Boolean).slice(0, 3)
        const resp = await safeJsonFetch<{ tracks: any[] }>(`/api/spotify/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed_genres: seedGenres, limit: 10 }),
        })

        // Map Spotify tracks to our Song type where possible
        const mapped: Song[] = (resp.tracks || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          artist: Array.isArray(t.artists) ? t.artists.map((a: any) => a.name).join(', ') : '',
          album: t.album?.name ?? '',
          duration: t.duration_ms ? `${Math.floor(t.duration_ms / 60000)}:${String(Math.floor((t.duration_ms % 60000) / 1000)).padStart(2, '0')}` : '',
          albumArt: t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? '/placeholder.svg?height=64&width=64',
          previewUrl: t.preview_url ?? undefined,
          externalUrl: t.external_urls?.spotify ?? undefined,
          audioFeatures: {
            energy: 0,
            valence: 0,
            danceability: 0,
            acousticness: 0,
            instrumentalness: 0,
            liveness: 0,
            speechiness: 0,
            tempo: 0,
          },
          genres: seedGenres,
          isPopularInRegion: !!location,
        }))

        if (mapped.length > 0) return mapped
      }
    } catch (e) {
      // Fall back to local sample scoring if API fails
      console.error('Spotify API failed, falling back to samples:', e)
    }

    // Simulate API delay for fallback
    await new Promise((resolve) => setTimeout(resolve, 800))

    const scoredSongs = this.SAMPLE_SONGS.map((song) => ({
      song,
      score: this.calculateMoodScore(song, moodAnalysis, location),
    }))

    return scoredSongs
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.song)
  }

  private static calculateMoodScore(song: Song, mood: MoodAnalysis, location: LocationData | null): number {
    let score = 0

    // Audio features matching (weighted)
    const energyDiff = Math.abs(song.audioFeatures.energy - mood.energy)
    const valenceDiff = Math.abs(song.audioFeatures.valence - mood.valence)
    const danceabilityDiff = Math.abs(song.audioFeatures.danceability - mood.danceability)

    score += (1 - energyDiff) * 0.3
    score += (1 - valenceDiff) * 0.3
    score += (1 - danceabilityDiff) * 0.2

    // Genre matching
    const genreMatch = song.genres.some((genre) => mood.genres.includes(genre))
    if (genreMatch) score += 0.15

    // Location-based popularity boost
    if (location && song.isPopularInRegion) {
      score += 0.05
    }

    // Tempo matching (within reasonable range)
    const tempoDiff = Math.abs(song.audioFeatures.tempo - mood.tempo)
    if (tempoDiff < 20) score += 0.05

    return Math.max(0, Math.min(1, score))
  }
}
