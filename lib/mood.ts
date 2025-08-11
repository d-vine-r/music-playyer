import type { MoodAnalysis } from "@/types"

export class MoodAnalyzer {
  private static readonly MOOD_KEYWORDS = {
    // Energy levels
    high_energy: ["energetic", "pumped", "excited", "hyper", "intense", "workout", "party", "dance"],
    low_energy: ["tired", "sleepy", "calm", "peaceful", "relaxed", "chill", "mellow", "ambient"],

    // Emotional valence
    positive: ["happy", "joyful", "excited", "euphoric", "upbeat", "cheerful", "optimistic", "celebration","uplifting", "joy", "feel good", "sunshine", "dance", "excited", "glad", "delighted", "cheerful", "content", "fly"],
    negative: ["sad", "depressed", "melancholic", "heartbroken", "lonely", "angry", "frustrated", "dark"],

    // Specific moods
    romantic: ["romantic", "love", "intimate", "sensual", "date", "valentine"],
    nostalgic: ["nostalgic", "memories", "throwback", "vintage", "old", "reminisce"],
    motivational: ["motivated", "determined", "focused", "driven", "success", "achievement"],
    contemplative: ["thoughtful", "introspective", "philosophical", "deep", "meditative"],

    // Activity-based
    workout: ["gym", "exercise", "running", "cardio", "fitness", "training"],
    study: ["focus", "concentration", "studying", "work", "productivity"],
    party: ["party", "celebration", "club", "dancing", "social"],
    sleep: ["sleep", "bedtime", "lullaby", "night", "dreams", "sleep", "unwind", "slow", "dreamy", "gentle", "mellow", "soft", "soothe", "fatigue", "rest"],
  }

  private static readonly GENRE_MAPPING = {
    high_energy: ["electronic", "rock", "pop", "hip-hop", "dance"],
    low_energy: ["ambient", "classical", "folk", "indie", "acoustic"],
    positive: ["pop", "reggae", "funk", "disco", "soul"],
    negative: ["blues", "alternative", "grunge", "emo", "indie"],
    romantic: ["r&b", "soul", "jazz", "acoustic", "indie"],
    nostalgic: ["classic rock", "oldies", "vintage", "retro"],
    workout: ["electronic", "hip-hop", "rock", "metal", "dance"],
    study: ["lo-fi", "classical", "ambient", "instrumental"],
    party: ["dance", "electronic", "hip-hop", "pop", "reggaeton"],
  }

  static analyzeMood(moodText: string): MoodAnalysis {
    const text = moodText.toLowerCase()
    let energy = 0.5
    let valence = 0.5
    let danceability = 0.5

    // Analyze energy level
    const highEnergyScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.high_energy)
    const lowEnergyScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.low_energy)

    if (highEnergyScore > lowEnergyScore) {
      energy = Math.min(1, 0.7 + highEnergyScore * 0.3)
    } else if (lowEnergyScore > 0) {
      energy = Math.max(0, 0.3 - lowEnergyScore * 0.3)
    }

    // Analyze emotional valence
    const positiveScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.positive)
    const negativeScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.negative)

    if (positiveScore > negativeScore) {
      valence = Math.min(1, 0.6 + positiveScore * 0.4)
    } else if (negativeScore > 0) {
      valence = Math.max(0, 0.4 - negativeScore * 0.4)
    }

    // Analyze danceability
    const danceScore = this.calculateKeywordScore(text, [...this.MOOD_KEYWORDS.party, ...this.MOOD_KEYWORDS.workout])
    if (danceScore > 0) {
      danceability = Math.min(1, 0.6 + danceScore * 0.4)
    }

    // Additional mood-specific adjustments
    const romanticScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.romantic)
    if (romanticScore > 0) {
      energy = Math.max(0.2, energy - 0.2) // Lower energy for romantic
      valence = Math.min(1, valence + 0.2) // More positive
      danceability = Math.max(0.1, danceability - 0.3) // Less danceable
    }

    const workoutScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.workout)
    if (workoutScore > 0) {
      energy = Math.min(1, energy + 0.3) // High energy for workout
      danceability = Math.min(1, danceability + 0.3) // More danceable
    }

    const sleepScore = this.calculateKeywordScore(text, this.MOOD_KEYWORDS.sleep)
    if (sleepScore > 0) {
      energy = Math.max(0, energy - 0.4) // Very low energy
      valence = Math.max(0.3, valence) // Slightly positive
      danceability = Math.max(0, danceability - 0.4) // Not danceable
    }

    // Determine genres
    const genres = this.determineGenres(text)

    // Calculate tempo based on energy and mood
    const baseTempo = 120
    const tempoVariation = (energy - 0.5) * 60
    const tempo = Math.round(baseTempo + tempoVariation)

    // Determine key signature (major for positive, minor for negative)
    const keySignature = valence > 0.6 ? "major" : valence < 0.4 ? "minor" : "mixed"

    return {
      energy,
      valence,
      danceability,
      tempo,
      genres,
      keySignature,
      acousticness: this.calculateAcousticness(text),
      instrumentalness: this.calculateInstrumentalness(text),
      liveness: this.calculateLiveness(text),
      speechiness: this.calculateSpeechiness(text),
      moodTags: this.extractMoodTags(text),
    }
  }

  static getDefaultHappyMood(): MoodAnalysis {
    return {
      energy: 0.7,
      valence: 0.8,
      danceability: 0.6,
      tempo: 128,
      genres: ["pop", "dance", "electronic"],
      keySignature: "major",
      acousticness: 0.3,
      instrumentalness: 0.1,
      liveness: 0.2,
      speechiness: 0.3,
      moodTags: ["happy", "upbeat", "energetic"],
    }
  }

  private static calculateKeywordScore(text: string, keywords: string[]): number {
    let score = 0
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 1
      }
    })
    return Math.min(1, (score / keywords.length) * 2)
  }

  private static determineGenres(text: string): string[] {
    const genreScores: { [key: string]: number } = {}

    Object.entries(this.GENRE_MAPPING).forEach(([mood, genres]) => {
      const keywords = this.MOOD_KEYWORDS[mood as keyof typeof this.MOOD_KEYWORDS] || []
      const score = this.calculateKeywordScore(text, keywords)

      genres.forEach((genre) => {
        genreScores[genre] = (genreScores[genre] || 0) + score
      })
    })

    // Return top 3 genres
    return Object.entries(genreScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre)
  }

  private static calculateAcousticness(text: string): number {
    const acousticKeywords = ["acoustic", "unplugged", "folk", "classical", "intimate"]
    return this.calculateKeywordScore(text, acousticKeywords)
  }

  private static calculateInstrumentalness(text: string): number {
    const instrumentalKeywords = ["instrumental", "no vocals", "classical", "ambient", "study"]
    return this.calculateKeywordScore(text, instrumentalKeywords)
  }

  private static calculateLiveness(text: string): number {
    const liveKeywords = ["live", "concert", "audience", "performance"]
    return this.calculateKeywordScore(text, liveKeywords)
  }

  private static calculateSpeechiness(text: string): number {
    const speechKeywords = ["rap", "hip-hop", "spoken", "podcast", "talk"]
    return this.calculateKeywordScore(text, speechKeywords)
  }

  private static extractMoodTags(text: string): string[] {
    const tags: string[] = []

    Object.entries(this.MOOD_KEYWORDS).forEach(([mood, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        tags.push(mood.replace("_", " "))
      }
    })

    return tags.slice(0, 5) // Limit to 5 tags
  }
}
