"use client"

import { useEffect, useState } from "react"
import { Music, Heart, Zap, Moon } from "lucide-react"

interface LoadingAnimationProps {
  mood: string
  keywords?: string[]
}

export function LoadingAnimation({ mood, keywords = [] }: LoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Music, text: "Analyzing your mood...", color: "text-purple-400" },
    { icon: Heart, text: "Finding emotional resonance...", color: "text-pink-400" },
    { icon: Zap, text: "Matching energy levels...", color: "text-yellow-400" },
    { icon: Moon, text: "Curating perfect songs...", color: "text-blue-400" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Generate particle positions client-side to avoid hydration mismatches
  const [particles, setParticles] = useState<{ left: string; top: string; animationDelay: string; animationDuration: string;}[]>([])

  useEffect(() => {
    const p = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }))
    setParticles(p)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Floating music notes */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 animate-spin">
            <Music className="w-8 h-8 text-white/60 absolute top-0 left-1/2 transform -translate-x-1/2" />
            <Music className="w-6 h-6 text-white/40 absolute top-1/2 right-0 transform -translate-y-1/2" />
            <Music className="w-10 h-10 text-white/80 absolute bottom-0 left-1/2 transform -translate-x-1/2" />
            <Music className="w-4 h-4 text-white/30 absolute top-1/2 left-0 transform -translate-y-1/2" />
          </div>

          {/* Pulsing center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-purple-500/30 rounded-full animate-pulse flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Mood display */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Finding music for "{mood}"</h2>
          {keywords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {keywords.map((kw, i) => (
                <span key={`${kw}-${i}`} className="px-2 py-1 text-xs rounded-full bg-white/15 text-white/90 border border-white/20">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Loading steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center gap-3 transition-all duration-500 ${
                    isActive ? "scale-110 opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${step.color} ${isActive ? "animate-bounce" : ""}`} />
                  <span className="text-white text-lg">{step.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Floating particles */}
        {particles.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
        <div
        key={i}
        className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
        style={{
        left: p.left,
        top: p.top,
        animationDelay: p.animationDelay,
        animationDuration: p.animationDuration,
        }}
        />
        ))}
        </div>
        )}
      </div>
    </div>
  )
}
