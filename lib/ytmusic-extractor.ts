// lib/ytmusic-extractor.ts
import type { Song } from "@/types"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const YTMusic = require("ytmusic-api")

let api: any = null

/**
 * Initialize YTMusic client once.
 */
export async function initYTMusic() {
  if (!api) {
    api = new YTMusic()
    await api.initialize() // bootstraps headers/cookies internally
  }
  return api
}

export class YTMusicExtractor {
  /**
   * Search YouTube Music for songs
   * @param query - Search query
   * @param limit - Number of results
   */
  static async searchSongs(query: string, limit = 5): Promise<Song[]> {
    const client = await initYTMusic()
    const results = await client.search(query, "song") // "song" filter supported by ytmusic-api

    return results.slice(0, limit).map((r: any) => ({
        id: r.videoId,
        name: r.name,
        artist: r.artist?.name || r.artists?.[0]?.name || "Unknown",
        previewUrl: `https://music.youtube.com/watch?v=${r.videoId}`,
        externalUrl: `https://music.youtube.com/watch?v=${r.videoId}`,
        imageUrl: r.thumbnails?.[0]?.url,
        album: r.album?.name,
        isPopularInRegion: r.isPopularInRegion,
        albumArt: r.album?.art,
        audioFeatures: r.audioFeatures,
        releaseDate: r.releaseDate,
        genres: r.genres,
        duration: r.duration,
        popularity: r.popularity,
    }))
  }
}
