"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Clock, TrendingUp } from "lucide-react"
import type { Song } from "@/types"

interface SwipeableCardProps {
  song: Song
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onPlay: () => void
  isPlaying: boolean
}

export function SwipeableCard({ song, onSwipeLeft, onSwipeRight, onPlay, isPlaying }: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setStartPos({ x: clientX, y: clientY })
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleEnd = () => {
    if (!isDragging) return

    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipeRight()
      } else {
        onSwipeLeft()
      }
    }

    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd()
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, startPos])

  const rotation = dragOffset.x * 0.1
  const opacity = 1 - Math.abs(dragOffset.x) * 0.002

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Swipe indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none z-10">
        <div
          className={`w-20 h-20 rounded-full bg-red-500 flex items-center justify-center transition-opacity ${
            dragOffset.x < -50 ? "opacity-80" : "opacity-0"
          }`}
        >
          <span className="text-white text-2xl">✕</span>
        </div>
        <div
          className={`w-20 h-20 rounded-full bg-green-500 flex items-center justify-center transition-opacity ${
            dragOffset.x > 50 ? "opacity-80" : "opacity-0"
          }`}
        >
          <span className="text-white text-2xl">♥</span>
        </div>
      </div>

      <Card
        ref={cardRef}
        className="bg-white/95 backdrop-blur-md border-white/20 cursor-grab active:cursor-grabbing select-none overflow-hidden"
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-0">
          {/* Album Art */}
          <div className="relative">
            <img
              src={song.albumArt || "/placeholder.svg"}
              alt={song.album}
              className="w-full h-80 object-cover"
              draggable={false}
            />

            {/* Play button overlay */}
            <div
              className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
            >
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-gray-800" />
                ) : (
                  <Play className="w-8 h-8 text-gray-800 ml-1" />
                )}
              </div>
            </div>
          </div>

          {/* Song Info */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{song.name}</h3>
              <p className="text-lg text-gray-600">{song.artist}</p>
              <p className="text-sm text-gray-500">{song.album}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {song.duration}
              </div>
              {song.isPopularInRegion && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Local Hit
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {Math.round(song.audioFeatures.energy * 100)}% Energy
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {Math.round(song.audioFeatures.valence * 100)}% Happy
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {Math.round(song.audioFeatures.danceability * 100)}% Dance
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1">
              {song.genres.map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
