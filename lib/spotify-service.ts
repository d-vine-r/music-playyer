// lib/spotify-service.ts
import type { Song } from "@/types"

export class SpotifyService {
  static mapSpotifyTrack(track: any): Song {
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      duration  : track.duration_ms,
      albumArt: track.album?.images?.[0]?.url || "/default-art.png",
      genres: track.genres || [],
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      imageUrl: track.album?.images?.[0]?.url || "/default-art.png", // fallback
      album: track.album?.name,
      releaseDate: track.album?.release_date,
      popularity: track.popularity,
    }
  }

  static mapSpotifyTracks(tracks: any[]): Song[] {
    return tracks.map((t) => SpotifyService.mapSpotifyTrack(t))
  }
}
