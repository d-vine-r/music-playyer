"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Clock, TrendingUp } from "lucide-react"
import type { Song } from "@/types"

interface SwipeableCardProps {
  song: Song
  onSwipeLeftAction: () => void
  onSwipeRightAction: () => void
  onPlayToggleAction: () => void
  isPlaying: boolean
}

export function SwipeableCard({ song, onSwipeLeftAction, onSwipeRightAction, onPlayToggleAction, isPlaying }: SwipeableCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })

  const handleDragStart = (x: number, y: number) => {
    setIsDragging(true)
    startPos.current = { x, y }
  }

  const handleDragMove = (x: number, y: number) => {
    if (!isDragging) return
    const dx = x - startPos.current.x
    const dy = y - startPos.current.y
    setDragOffset({ x: dx, y: dy })
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) onSwipeRightAction()
      else onSwipeLeftAction()
    }
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // Global mouse events when dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY)
    const onMouseUp = () => handleDragEnd()
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [isDragging, dragOffset])

  const rotation = dragOffset.x * 0.1
  const opacity = 1 - Math.min(Math.abs(dragOffset.x) / 300, 0.8)

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Swipe indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
        <div className={`${dragOffset.x < -50 ? "opacity-75" : "opacity-0"} bg-red-500 w-16 h-16 rounded-full flex items-center justify-center transition-opacity`}>
          <span className="text-white text-2xl">✕</span>
        </div>
        <div className={`${dragOffset.x > 50 ? "opacity-75" : "opacity-0"} bg-green-500 w-16 h-16 rounded-full flex items-center justify-center transition-opacity`}>
          <span className="text-white text-2xl">♥</span>
        </div>
      </div>

      <Card
        className="bg-white/90 backdrop-blur-sm border border-gray-200 cursor-grab active:cursor-grabbing overflow-hidden"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y * 0.3}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
        onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
        onTouchStart={e => {
          const t = e.touches[0]
          handleDragStart(t.clientX, t.clientY)
        }}
        onTouchMove={e => {
          const t = e.touches[0]
          handleDragMove(t.clientX, t.clientY)
        }}
        onTouchEnd={handleDragEnd}
      >
        <CardContent className="p-0">
          {/* Album Art */}
          <div className="relative">
            <img
              src={song.albumArt || '/placeholder.svg'}
              alt={`${song.album} artwork`}
              className="w-full h-80 object-cover"
              draggable={false}
            />
            {/* Play/Pause Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                onPlayToggleAction()
              }}
            >
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                {isPlaying ? <Pause className="w-8 h-8 text-gray-800" /> : <Play className="w-8 h-8 text-gray-800" />}
              </div>
            </div>
          </div>

          {/* Song Details */}
          <div className="px-6 py-4 space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 leading-tight truncate">{song.name}</h3>
            <p className="text-sm text-gray-600 truncate">{song.artist}</p>
            <p className="text-sm text-gray-500 truncate">{song.album}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{song.duration}</span>
              </div>
              {song.isPopularInRegion && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Local Hit</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {song.genres.map(genre => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                {Math.round(song.audioFeatures.energy * 100)}% Energy
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {Math.round(song.audioFeatures.valence * 100)}% Positivity
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                {Math.round(song.audioFeatures.danceability * 100)}% Dance
              </Badge>
            </div>
            {/* External link to Spotify */}
            {song.externalUrl && (
              <div className="mt-4">
                <a href={song.externalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                  Play Full Track on Spotify
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
