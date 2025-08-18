export interface Song {
    id: string
    name: string
    artist: string
    album: string
    duration: string
    albumArt: string
    previewUrl?: string
    externalUrl?: string
    audioFeatures: AudioFeatures
    genres: string[]
    isPopularInRegion: boolean
    imageUrl?: string
    releaseDate: string
    popularity: string
  }
  
  export interface AudioFeatures {
    energy: number
    valence: number
    danceability: number
    acousticness: number
    instrumentalness: number
    liveness: number
    speechiness: number
    tempo: number
  }
  
  export interface MoodAnalysis {
    energy: number
    valence: number
    danceability: number
    tempo: number
    genres: string[]
    keySignature: "major" | "minor" | "mixed"
    acousticness: number
    instrumentalness: number
    liveness: number
    speechiness: number
    moodTags: string[]
  }
  
  export interface LocationData {
    city: string
    country: string
    latitude: number
    longitude: number
    timezone: string
  }
  