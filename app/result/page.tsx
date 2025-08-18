"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, Heart, X, SkipForward } from "lucide-react"
import { MoodAnalyzer } from "@/lib/mood"
import type { Song, MoodAnalysis } from "@/types"
import { LoadingAnimation } from "@/components/loading-animation"
import { SwipeableCard } from "@/components/swipeable-card"
import Player from "@/components/Player"

const analyzer = new MoodAnalyzer()

function ResultsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likedSongs, setLikedSongs] = useState<string[]>([])
  const [dismissedSongs, setDismissedSongs] = useState<string[]>([])

  // Mood input
  const mood = searchParams.get("mood") || ""
  const country = (searchParams.get("country") || "NG") as any

  // Analyze mood
  const analysis = analyzer.analyzeMood({ mood, countryCode: country })

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setMoodAnalysis(analysis as unknown as MoodAnalysis | null)

        const res = await fetch(`/api/spotify/recommendations?mood=${encodeURIComponent(mood)}&country=${country}`)
        const data = await res.json()

        console.log("API Response:", data) // Debugging log

        if (Array.isArray(data.tracks)) {
          const mapped: Song[] = data.tracks.map((t: any) => ({
            id: t.id,
            name: t.name,
            artist: Array.isArray(t.artists) ? t.artists.map((a: any) => a.name).join(", ") : "Unknown Artist", // Defensive check
            previewUrl: t.preview_url,
            externalUrl: t.external_urls?.spotify ?? "",
            imageUrl: t.album?.images?.[0]?.url,
          }))
          setSongs(mapped)
        } else {
          console.error("Unexpected data format for tracks:", data.tracks)
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (mood) {
      fetchRecommendations()
    }
  }, [mood])

  const currentSong = songs[currentSongIndex]
  const remainingSongs = songs.length - currentSongIndex - dismissedSongs.length - likedSongs.length

  const handleSwipeLeft = () => {
    if (currentSong) {
      setDismissedSongs((prev) => [...prev, currentSong.id])
      nextSong()
    }
  }

  const handleSwipeRight = () => {
    if (currentSong) {
      setLikedSongs((prev) => [...prev, currentSong.id])
      nextSong()
    }
  }

  const nextSong = () => {
    setIsPlaying(false)
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex((prev) => prev + 1)
    }
  }

  const togglePlay = () => {}

  if (loading) {
    return <LoadingAnimation mood={mood} keywords={analysis.keywords} />
  }

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">All done! 🎉</h2>
          <p className="text-blue-200 mb-6">You've gone through all the songs for this mood.</p>
          <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700">
            Discover More Music
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <p className="text-white font-medium">"{mood}"</p>
            <p className="text-blue-200 text-sm">{remainingSongs} songs remaining</p>
          </div>

          <Button variant="ghost" onClick={nextSong} className="text-white hover:bg-white/20">
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Mood Analysis */}
        {moodAnalysis && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-purple-300">{analysis.facets.energy}</div>
                  <div className="text-xs text-blue-200">Energy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-300">{analysis.facets.valence}</div>
                  <div className="text-xs text-blue-200">Positivity</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-300">{analysis.facets.tempo}</div>
                  <div className="text-xs text-blue-200">Tempo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Swipeable Card */}
        <div className="flex justify-center mb-8">
          <SwipeableCard
            song={currentSong}
            onSwipeLeftAction={handleSwipeLeft}
            onSwipeRightAction={handleSwipeRight}
            onPlayToggleAction={togglePlay}
            isPlaying={isPlaying}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <Button
            size="lg"
            variant="outline"
            onClick={handleSwipeLeft}
            className="w-16 h-16 rounded-full border-red-400 text-red-400 hover:bg-red-400 hover:text-white bg-transparent"
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white text-purple-900 hover:bg-gray-100"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleSwipeRight}
            className="w-16 h-16 rounded-full border-green-400 text-green-400 hover:bg-green-400 hover:text-white bg-transparent"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-blue-200 text-sm">
          <p>Swipe left to dismiss • Swipe right to like • Tap to play</p>
        </div>

        {/* Player */}
        <div className="flex justify-center mt-8">
          <Player
            audioUrl={currentSong.previewUrl}
            title={currentSong.name}
            artist={currentSong.artist}
          />
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <LoadingAnimation mood="" />
        </div>
      }
    >
      <ResultsInner />
    </Suspense>
  )
}
