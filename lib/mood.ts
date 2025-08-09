// Fetch and cache available Spotify seed genres
let cachedSpotifyGenres: string[] | null = null;
let lastFetchTime = 0;
const GENRE_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchAvailableSpotifyGenres(token: string): Promise<string[]> {
  const now = Date.now();
  if (cachedSpotifyGenres && (now - lastFetchTime < GENRE_CACHE_DURATION)) {
    console.log('Using cached Spotify genres');
    return cachedSpotifyGenres || [];
  }
  console.log('Fetching Spotify genres from API');
  const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    console.error('Failed to fetch Spotify genres:', response.status, await response.text());
    throw new Error('Failed to fetch Spotify genres');
  }
  const data = await response.json();
  console.log('Fetched Spotify genres:', data.genres);
  cachedSpotifyGenres = data.genres;
  lastFetchTime = now;
  return cachedSpotifyGenres || [];
}

/**
 * Given a mood, returns the intersection of mood genres/keywords and available Spotify genres.
 * If no match, returns ['pop'] as fallback.
 */
export async function getValidGenresForMood(mood: Mood, token: string): Promise<string[]> {
  console.log('Getting valid genres for mood:', mood);
  const moodInfo = moodQueryMap[mood as Mood];
  if (!moodInfo) {
    console.log('No mood info found, using fallback genre: pop');
    return ['pop'];
  }
  const availableGenres = await fetchAvailableSpotifyGenres(token);
  console.log('Available Spotify genres:', availableGenres);
  // Try to match mood genres
  const genreMatches = moodInfo.genres.filter(g => availableGenres.includes(g.toLowerCase()));
  console.log('Matched genres:', genreMatches);
  if (genreMatches.length > 0) return genreMatches;
  // Try to match keywords
  const keywordMatches = moodInfo.keywords.filter(k => availableGenres.includes(k.toLowerCase()));
  console.log('Matched keywords:', keywordMatches);
  if (keywordMatches.length > 0) return keywordMatches;
  console.log('No matches found, using fallback genre: pop');
  return ['pop'];
}
type Mood =
  | 'neutral'
  | any
  | 'happy'
  | 'sad'
  | 'romantic'
  | 'energetic'
  | 'chill'
  | 'angry'
  | 'motivated'
  | 'nostalgic'
  | 'melancholy'
  | 'party';

interface SongQuery {
  keywords: string[];
  genres: string[];
  moodTag: string;
  query: string;
  mood: string;
}

// Only use valid Spotify genre seeds in the genres arrays below
const moodQueryMap: Record<Mood, { keywords: string[]; genres: string[] }> = {
  happy: {
    keywords: ['uplifting', 'joy', 'feel good', 'sunshine', 'dance', 'excited', 'glad', 'delighted', 'cheerful', 'content', 'fly'],
    genres: ['pop', 'dance', 'happy'],
  },
  sad: {
    keywords: ['heartbreak', 'cry', 'lonely', 'tears','tired','sad', 'depressed', 'blue', 'tear'],
    genres: ['acoustic', 'indie', 'sad'],
  },
  tired:{
    keywords:['sleep', 'unwind', 'slow', 'dreamy', 'gentle', 'mellow', 'soft', 'soothe', 'fatigue', 'rest'],
    genres:['chill', 'ambient', 'acoustic', 'sleep'],
  },
  sleepy:{
    keywords:['sleep', 'unwind', 'slow', 'dreamy', 'gentle', 'mellow', 'soft', 'soothe', 'fatigue', 'rest'],
    genres:['chill', 'ambient', 'acoustic', 'sleep'],
  },
  stressed:{
    keywords:['stress', 'anxiety', 'stressed', 'overwhelmed', 'anxious', 'nervous', 'stressed', 'overwhelmed', 'anxious', 'nervous'],
    genres:['chill', 'ambient', 'acoustic'],
  },
  anxious:{
    keywords:['anxious', 'nervous', 'stressed', 'overwhelmed', 'anxious', 'nervous', 'stressed', 'overwhelmed', 'anxious', 'nervous'],
    genres:['chill', 'ambient', 'acoustic'],
  },
  romantic: {
    keywords: ['love', 'romance', 'kiss', 'passionate', 'crush', 'affection', 'in love'],
    genres: ['romance', 'r-n-b', 'soul'],
  },
  energetic: {
    keywords: ['hype', 'power', 'drive', 'intense', 'excited', 'glad', 'delighted', 'cheerful', 'content', 'fly'],
    genres: ['rock', 'edm', 'dance'],
  },
  chill: {
    keywords: ['relax', 'lofi', 'calm', 'vibe', 'relaxed', 'peaceful', 'easygoing'],
    genres: ['chill', 'ambient', 'lofi'],
  },
  angry: {
    keywords: ['rage', 'revenge', 'scream', 'burn', 'mad', 'furious', 'rage', 'annoyed'],
    genres: ['metal', 'hard-rock', 'punk'],
  },
  motivated: {
    keywords: ['grind', 'win', 'focus', 'hustle', 'driven', 'ambitious', 'determined', 'focused'],
    genres: ['hip-hop', 'trap', 'work-out'],
  },
  nostalgic: {
    keywords: ['memory', 'throwback', 'old times', 'nostalgic', 'memory', 'remember', 'old times', 'reminisce'],
    genres: ['80s', '90s', 'classic-rock'],
  },
  melancholy: {
    keywords: ['blue', 'slow', 'aching', 'mourn', 'melancholy', 'gloomy', 'mournful', 'wistful'],
    genres: ['indie', 'ambient', 'sad'],
  },
  party: {
    keywords: ['club', 'bass', 'drink', 'fun', 'party', 'celebrate', 'fun', 'club', 'dance'],
    genres: ['edm', 'party', 'dance'],
  },
};

export function getSongQueryByMood(mood: Mood): SongQuery {
  const normalizedMood = typeof mood === 'string' ? mood.trim().toLowerCase() : '';
  const moodInfo = moodQueryMap[normalizedMood as Mood];
  if (!moodInfo) {
    const fallback = typeof mood === 'string' && normalizedMood ? normalizedMood : 'happy';
    return {
      keywords: [fallback],
      genres: ['happy'],
      mood: fallback,
      moodTag: fallback,
      query: `${fallback} genre:happy`,
    };
  }
  const keywords = moodInfo.keywords;
  const genres = moodInfo.genres;

  // Use only the first keyword and genre for the query
  const keywordPart = keywords[0];
  const genrePart = genres[0];

  return {
    keywords,
    genres,
    mood: normalizedMood,
    moodTag: normalizedMood,
    query: `${keywordPart} genre:${genrePart}`,
  };
}

/**
 * Auto-detects mood from a given text using keyword matching.
 * Returns the detected mood string, or 'neutral' if none found.
 */
export function detectMoodFromText(text: string): Mood {
  if (!text || typeof text !== 'string') return 'neutral';
  const normalized = text.toLowerCase();

  // Map of mood to keywords
  const moodKeywords: Record<Mood, string[]> = {
    happy: ['happy', 'joy', 'excited', 'glad', 'delighted', 'cheerful', 'content'],
    sad: ['sad', 'down', 'unhappy', 'depressed', 'cry', 'blue', 'tear'],
    romantic: ['love', 'romantic', 'crush', 'passion', 'affection'],
    energetic: ['energetic', 'hype', 'pumped', 'active', 'motivated', 'excited'],
    chill: ['chill', 'relaxed', 'calm', 'peaceful', 'easygoing'],
    angry: ['angry', 'mad', 'furious', 'rage', 'annoyed'],
    motivated: ['motivated', 'driven', 'ambitious', 'determined', 'focused'],
    nostalgic: ['nostalgic', 'memory', 'remember', 'old times', 'reminisce'],
    melancholy: ['melancholy', 'gloomy', 'mournful', 'wistful'],
    party: ['party', 'celebrate', 'fun', 'club', 'dance'],
    neutral: [],
  };

  // Check for each mood's keywords in the text
  for (const mood in moodKeywords) {
    if (mood === 'neutral') continue;
    for (const keyword of moodKeywords[mood as Mood]) {
      if (normalized.includes(keyword)) {
        return mood as Mood;
      }
    }
  }

  return 'neutral';
}
