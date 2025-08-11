import type { Song, MoodAnalysis, LocationData } from "@/types"

// Minimal runtime-safe fetch wrapper
async function safeJsonFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, cache: "no-store" })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  return JSON.parse(text) as T
}

export class SpotifyService {
  // Fallback sample songs
  private static readonly SAMPLE_SONGS: Song[] = [
    // ... (existing sample songs as before) ...
  ]

  static async searchSongs(moodAnalysis: MoodAnalysis, location: LocationData | null): Promise<Song[]> {
    const seedGenres = (moodAnalysis.genres || []).filter(Boolean).slice(0, 3)
    try {
      const resp = await safeJsonFetch<{ tracks: any[] }>(`/api/spotify/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed_genres: seedGenres, limit: 10 }),
      })

      const mapped: Song[] = (resp.tracks || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: Array.isArray(t.artists) ? t.artists.map((a: any) => a.name).join(", ") : "",
        album: t.album?.name ?? "",
        duration: t.duration_ms
          ? `${Math.floor(t.duration_ms / 60000)}:${String(
              Math.floor((t.duration_ms % 60000) / 1000),
            ).padStart(2, "0")}`
          : "",
        albumArt:
          t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? "/placeholder.svg",
        previewUrl: t.preview_url ?? undefined,
        externalUrl: t.external_urls?.spotify ?? undefined,
        audioFeatures: {
          energy: t.audio_features?.energy ?? 0,
          valence: t.audio_features?.valence ?? 0,
          danceability: t.audio_features?.danceability ?? 0,
          acousticness: t.audio_features?.acousticness ?? 0,
          instrumentalness: t.audio_features?.instrumentalness ?? 0,
          liveness: t.audio_features?.liveness ?? 0,
          speechiness: t.audio_features?.speechiness ?? 0,
          tempo: t.audio_features?.tempo ?? 0,
        },
        genres: seedGenres,
        isPopularInRegion: !!location,
      }))
      if (mapped.length > 0) return mapped
    } catch (e) {
      console.error("Spotify recommendations fetch failed, using samples:", e)
    }

    // Fallback to local samples
    const scored = this.SAMPLE_SONGS.map((song) => ({ song, score: this.calculateMoodScore(song, moodAnalysis, location) }))
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.song)
  }

  private static calculateMoodScore(
    song: Song,
    mood: MoodAnalysis,
    location: LocationData | null,
  ): number {
    let score = 0
    const energyDiff = Math.abs(song.audioFeatures.energy - mood.energy)
    const valenceDiff = Math.abs(song.audioFeatures.valence - mood.valence)
    const danceDiff = Math.abs(song.audioFeatures.danceability - mood.danceability)
    score += (1 - energyDiff) * 0.3
    score += (1 - valenceDiff) * 0.3
    score += (1 - danceDiff) * 0.2
    if (song.genres.some((g) => mood.genres.includes(g))) score += 0.15
    if (location && song.isPopularInRegion) score += 0.05
    const tempoDiff = Math.abs(song.audioFeatures.tempo - mood.tempo)
    if (tempoDiff < 20) score += 0.05
    return Math.max(0, Math.min(1, score))
  }
}
