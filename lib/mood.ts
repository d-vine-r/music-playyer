/*
  MoodAnalyzer.ts
  ----------------
  Drop-in logic for mapping user mood → searchable keywords → platform queries (Spotify & Audiomack)
  and lightweight recommendations (including optional country-aware suggestions).

  ✅ What you get
  - Robust mood normalization (handles free-text like "i feel kinda low but chill")
  - Mood → facets (energy/valence/tempo) → keyword expansion
  - Country-aware genre augmentations (e.g., NG → afrobeats, highlife)
  - Search query builders for Spotify & Audiomack (no API key required for search URLs)
  - Handy recommendSongs() that returns curated picks + platform search links

  💡 How to use (Next.js / TS)
  import { MoodAnalyzer } from "./MoodAnalyzer";
  
  const analyzer = new MoodAnalyzer();
  const result = analyzer.analyzeMood({ mood: "tired but hopeful", countryCode: "NG" });
  const queries = analyzer.buildPlatformQueries(result);
  const recs = analyzer.recommendSongs(result);

  You can plug queries into your UI or call platform APIs.
*/

export type CountryCode =
  | "US" | "GB" | "CA" | "AU" | "NZ"
  | "NG" | "GH" | "ZA" | "KE" | "UG" | "TZ"
  | "FR" | "DE" | "ES" | "IT" | "NL" | "SE" | "NO" | "DK"
  | "BR" | "MX" | "AR" | "CO" | "CL"
  | "JP" | "KR" | "CN" | "IN" | "PH" | "ID" | "MY" | "SG"
  | "AE" | "SA" | "TR" | "EG"
  | string; // allow others gracefully

export type MoodCategory =
  | "happy" | "calm" | "sad" | "focused" | "romantic"
  | "energetic" | "party" | "chill" | "confident" | "angry"
  | "nostalgic" | "sleepy" | "motivated" | "melancholic";

export interface MoodAnalysis {
  raw: string;
  category: MoodCategory;
  /** Derived facets influence keyword generation */
  facets: {
    energy: "low" | "medium" | "high";
    valence: "low" | "medium" | "high"; // perceived positivity
    tempo: "slow" | "mid" | "fast";
  };
  /** Keyword groups prioritized for searching */
  keywords: string[];
  /** Optional country code (ISO-3166 alpha-2) */
  countryCode?: CountryCode;
}

export interface PlatformQuery {
  platform: "spotify" | "audiomack";
  /** A human-readable label describing the query */
  label: string;
  /** A shareable search URL (no auth required) */
  url: string;
  /** Raw search terms you can pass to platform APIs */
  terms: string[];
}

export interface Recommendation {
  title: string;
  artist: string;
  /** Shareable search links for this track on platforms */
  links: {
    spotify: string;
    audiomack: string;
  };
  /** Why this was picked */
  reason: string;
}

const NORMALIZATION_RULES: Array<{
  pattern: RegExp;
  category: MoodCategory;
  facets?: Partial<MoodAnalysis["facets"]>;
}> = [
  { pattern: /\b(happy|joy|cheer(y|ful)|good|great|amazing|awesome)\b/i, category: "happy", facets: { valence: "high" } },
  { pattern: /\b(calm|relax|serene|peaceful|zen|soothe|unwind)\b/i, category: "calm", facets: { energy: "low", tempo: "slow" } },
  { pattern: /\b(sad|blue|down|depress(ed)?|cry|heartbroken|lonely)\b/i, category: "sad", facets: { valence: "low", energy: "low" } },
  { pattern: /\b(study|focus|concentrate|deep work|productive)\b/i, category: "focused", facets: { energy: "medium", tempo: "mid" } },
  { pattern: /\b(romance|romantic|love|date|cuddle|valentine)\b/i, category: "romantic", facets: { valence: "high", tempo: "mid" } },
  { pattern: /\b(hype|pumped|turn ?up|gym|workout|beast|go time)\b/i, category: "energetic", facets: { energy: "high", tempo: "fast" } },
  { pattern: /\b(party|friday night|club|rave|dancefloor)\b/i, category: "party", facets: { energy: "high", tempo: "fast", valence: "high" } },
  { pattern: /\b(chill|mellow|lofi|late night|vibes?)\b/i, category: "chill", facets: { energy: "low", tempo: "slow" } },
  { pattern: /\b(confident|boss|swagger|walk in|unstoppable)\b/i, category: "confident", facets: { energy: "high", valence: "high" } },
  { pattern: /\b(angry|rage|mad|furious|aggressive)\b/i, category: "angry", facets: { energy: "high", valence: "low", tempo: "fast" } },
  { pattern: /\b(nostalgia|nostalgic|throwback|old school|memories)\b/i, category: "nostalgic", facets: { tempo: "mid" } },
  { pattern: /\b(sleepy|tired|drowsy|bedtime|lullaby)\b/i, category: "sleepy", facets: { energy: "low", tempo: "slow" } },
  { pattern: /\b(motivated|inspire(d)?|driven|goals?|grind)\b/i, category: "motivated", facets: { energy: "high", valence: "high", tempo: "fast" } },
  { pattern: /\b(melancholy|melancholic|wistful|bittersweet)\b/i, category: "melancholic", facets: { valence: "low", tempo: "slow" } },
];

const CATEGORY_BASE_KEYWORDS: Record<MoodCategory, string[]> = {
  happy: ["feel-good", "sunny", "bright", "upbeat pop", "good vibes", "major key"],
  calm: ["ambient", "acoustic", "soothing", "soft piano", "gentle strings", "soundscape"],
  sad: ["ballad", "piano vocal", "heartbreak", "emo", "minor key", "slow burn"],
  focused: ["lofi beats", "instrumental", "minimal techno", "deep focus", "study beats"],
  romantic: ["love songs", "slow jam", "r&b", "soul", "duet", "serenade"],
  energetic: ["high energy", "workout", "power pop", "edm bangers", "trap bangers"],
  party: ["dance hits", "club", "edm", "house", "dancehall", "party mix"],
  chill: ["chillhop", "dream pop", "soft rock", "downtempo", "cozy", "late night"],
  confident: ["swagger", "anthem", "victory", "boss mode", "triumphant", "trap"],
  angry: ["hard rock", "metal", "drill", "rage", "aggressive bass", "punk"],
  nostalgic: ["throwback", "classics", "retro", "old school", "golden era", "mixtape"],
  sleepy: ["sleep", "lullaby", "soft piano", "white noise", "calm guitar", "rain sounds"],
  motivated: ["grind", "rise and grind", "hype", "anthem", "motivational", "victory"],
  melancholic: ["bittersweet", "indie folk", "ethereal", "sad girl", "dreampop", "slowcore"],
};

const FACET_KEYWORDS = {
  energy: {
    low: ["soft", "mellow", "gentle", "acoustic"],
    medium: ["steady", "groove", "mid-tempo"],
    high: ["banger", "uptempo", "aggressive", "big drop"],
  },
  valence: {
    low: ["moody", "dark", "minor"],
    medium: ["neutral", "vibey"],
    high: ["uplifting", "feelgood", "sunny"],
  },
  tempo: {
    slow: ["slow", "ballad", "downtempo"],
    mid: ["mid-tempo", "groove"],
    fast: ["fast", "uptempo", "high bpm"],
  },
} as const;

const COUNTRY_GENRE_HINTS: Partial<Record<CountryCode, string[]>> = {
  // Africa
  NG: ["afrobeats", "naija pop", "alté", "highlife"],
  GH: ["hiplife", "highlife", "afrobeats"],
  ZA: ["amapiano", "gqom", "south african house"],
  KE: ["gengetone", "kapuka", "afropop"],
  UG: ["afrobeats", "dancehall ug", "kadongo kamu"],
  TZ: ["bongo flava", "singeli"],
  EG: ["arab pop", "mahraganat"],
  // Americas
  US: ["pop", "hip hop", "r&b", "country"],
  CA: ["indie pop", "alt rock", "hip hop"],
  BR: ["funk carioca", "sertanejo", "mpb"],
  MX: ["regional mexicano", "latin pop", "corridos tumbados"],
  AR: ["trap argentino", "rock nacional"],
  CO: ["reggaeton", "vallenato"],
  CL: ["pop chileno", "trap chileno"],
  // Europe
  GB: ["uk rap", "grime", "drum and bass", "garage"],
  FR: ["rap français", "chanson", "electro"],
  DE: ["german rap", "techno", "schlager"],
  ES: ["flamenco pop", "reggaeton", "indie español"],
  IT: ["it-pop", "cantautori", "house it"],
  NL: ["dutch hip hop", "hardstyle"],
  SE: ["swedish pop", "electropop"],
  NO: ["norwegian pop", "indie nordic"],
  DK: ["danish pop", "tech house"],
  // Asia
  IN: ["bollywood", "indie hindi", "punjabi pop"],
  JP: ["j-pop", "city pop", "anisong"],
  KR: ["k-pop", "k-hip hop"],
  PH: ["opm", "pinoy pop"],
  ID: ["dangdut", "indie indonesia"],
  MY: ["malay pop"],
  SG: ["singapore indie", "mandopop"],
  // Middle East
  AE: ["arab pop", "khaleeji pop"],
  SA: ["khaleeji", "arab pop"],
  TR: ["turkish pop", "anatolian rock"],
};

// Lightweight, evergreen curated seeds per mood (not exhaustive). These are *search prompts*, not guaranteed IDs.
const CURATED_SEEDS: Record<MoodCategory, Array<{ title: string; artist: string }>> = {
  happy: [
    { title: "Good as Hell", artist: "Lizzo" },
    { title: "Levitating", artist: "Dua Lipa" },
    { title: "Happy", artist: "Pharrell Williams" },
  ],
  calm: [
    { title: "Weightless", artist: "Marconi Union" },
    { title: "River Flows in You", artist: "Yiruma" },
    { title: "Holocene", artist: "Bon Iver" },
  ],
  sad: [
    { title: "Someone Like You", artist: "Adele" },
    { title: "Drivers License", artist: "Olivia Rodrigo" },
    { title: "Liability", artist: "Lorde" },
  ],
  focused: [
    { title: "Time", artist: "Hans Zimmer" },
    { title: "Daydream in Blue", artist: "I Monster" },
    { title: "Coffee Breath (Instrumental)", artist: "Lofi" },
  ],
  romantic: [
    { title: "Adorn", artist: "Miguel" },
    { title: "All of Me", artist: "John Legend" },
    { title: "Die For You", artist: "The Weeknd" },
  ],
  energetic: [
    { title: "POWER", artist: "Kanye West" },
    { title: "Titanium", artist: "David Guetta" },
    { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis" },
  ],
  party: [
    { title: "One Dance", artist: "Drake" },
    { title: "Turn Down for What", artist: "DJ Snake & Lil Jon" },
    { title: "Pepas", artist: "Farruko" },
  ],
  chill: [
    { title: "Nikes", artist: "Frank Ocean" },
    { title: "The Night We Met", artist: "Lord Huron" },
    { title: "Cherry Wine (Live)", artist: "Hozier" },
  ],
  confident: [
    { title: "HUMBLE.", artist: "Kendrick Lamar" },
    { title: "Savage Remix", artist: "Megan Thee Stallion & Beyoncé" },
    { title: "Run the World (Girls)", artist: "Beyoncé" },
  ],
  angry: [
    { title: "Bulls on Parade", artist: "Rage Against The Machine" },
    { title: "DUCKWORTH.", artist: "Kendrick Lamar" },
    { title: "Bleed It Out", artist: "Linkin Park" },
  ],
  nostalgic: [
    { title: "Smells Like Teen Spirit", artist: "Nirvana" },
    { title: "No Scrubs", artist: "TLC" },
    { title: "Billie Jean", artist: "Michael Jackson" },
  ],
  sleepy: [
    { title: "Clair de Lune", artist: "Debussy" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
    { title: "Weightless", artist: "Marconi Union" },
  ],
  motivated: [
    { title: "Stronger", artist: "Kanye West" },
    { title: "Lose Yourself", artist: "Eminem" },
    { title: "Can't Stop", artist: "Red Hot Chili Peppers" },
  ],
  melancholic: [
    { title: "Motion Picture Soundtrack", artist: "Radiohead" },
    { title: "I Know It's Over", artist: "The Smiths" },
    { title: "Skinny Love", artist: "Bon Iver" },
  ],
};

function unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function guessCategory(mood: string): { category: MoodCategory; facets: MoodAnalysis["facets"] } {
  const base: MoodAnalysis["facets"] = { energy: "medium", valence: "medium", tempo: "mid" };
  for (const rule of NORMALIZATION_RULES) {
    if (rule.pattern.test(mood)) {
      return {
        category: rule.category,
        facets: { ...base, ...(rule.facets || {}) },
      };
    }
  }
  // simple heuristics if no rule matched
  const toks = tokenize(mood);
  const negative = toks.some((t) => ["sad", "down", "tired", "lonely", "angry", "mad", "blue"].includes(t));
  const positive = toks.some((t) => ["happy", "good", "great", "calm", "chill", "love"].includes(t));
  const fallback: MoodCategory = negative ? "melancholic" : positive ? "happy" : "chill";
  return { category: fallback, facets: base };
}

function expandKeywords(category: MoodCategory, facets: MoodAnalysis["facets"], countryCode?: CountryCode): string[] {
  const base = CATEGORY_BASE_KEYWORDS[category];
  const f: string[] = [
    ...FACET_KEYWORDS.energy[facets.energy],
    ...FACET_KEYWORDS.valence[facets.valence],
    ...FACET_KEYWORDS.tempo[facets.tempo],
  ];
  const country = (countryCode && COUNTRY_GENRE_HINTS[countryCode]) || [];
  return unique([...base, ...f, ...country]);
}

function toSpotifySearchURL(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

function toAudiomackSearchURL(query: string): string {
  return `https://audiomack.com/search/${encodeURIComponent(query)}`;
}

function buildLabel(category: MoodCategory, countryCode?: CountryCode): string {
  return countryCode ? `${category} • ${countryCode}` : category;
}

export class MoodAnalyzer {
  analyzeMood({ mood, countryCode }: { mood: string; countryCode?: CountryCode }): MoodAnalysis {
    const { category, facets } = guessCategory(mood);
    const keywords = expandKeywords(category, facets, countryCode);
    return { raw: mood, category, facets, keywords, countryCode };
  }

  /**
   * Builds ready-to-open search URLs + raw terms for platform APIs.
   * You can pass the resulting terms into Spotify's Search API or Audiomack's search endpoints.
   */
  buildPlatformQueries(analysis: MoodAnalysis): PlatformQuery[] {
    const terms = analysis.keywords.slice(0, 6); // prioritize top 6 to keep queries tidy
    const primary = `${analysis.category} ${terms.slice(0, 3).join(" ")}`;
    const secondary = `${terms.slice(3, 6).join(" ")}`;

    const bundles = unique([
      primary,
      secondary,
      `${analysis.category} playlist`,
      `${analysis.category} ${analysis.facets.energy} energy`,
    ]).filter(Boolean);

    return [
      ...bundles.map<PlatformQuery>((q, i) => ({
        platform: "spotify",
        label: `${buildLabel(analysis.category, analysis.countryCode)} · S${i + 1}`,
        url: toSpotifySearchURL(q),
        terms: tokenize(q),
      })),
      ...bundles.map<PlatformQuery>((q, i) => ({
        platform: "audiomack",
        label: `${buildLabel(analysis.category, analysis.countryCode)} · A${i + 1}`,
        url: toAudiomackSearchURL(q),
        terms: tokenize(q),
      })),
    ];
  }

  /**
   * Returns curated, mood-aligned suggestions with platform search links.
   * If a countryCode is provided and we have genre hints, we prepend a regionally-relevant pick.
   */
  recommendSongs(analysis: MoodAnalysis, limit = 6): Recommendation[] {
    const seeds = CURATED_SEEDS[analysis.category];
    const pool: Array<{ title: string; artist: string; reason: string }> = [];

    // Country-aware preface (light-touch): pick one genre keyword as a reason
    const regional = analysis.countryCode && COUNTRY_GENRE_HINTS[analysis.countryCode];
    if (regional && regional.length > 0) {
      const regionTag = regional[0];
      // heuristic picks per region & mood
      if (analysis.category === "party" || analysis.category === "energetic") {
        pool.push({ title: "Sungba (Remix)", artist: "Asake ft. Burna Boy", reason: `high-energy ${regionTag}` });
      } else if (analysis.category === "chill" || analysis.category === "romantic") {
        pool.push({ title: "Essence", artist: "Wizkid ft. Tems", reason: `smooth ${regionTag}` });
      }
    }

    // Core curated seeds
    for (const s of seeds) {
      pool.push({ ...s, reason: `${analysis.category} vibes` });
    }

    const top = pool.slice(0, limit);

    return top.map((t) => ({
      title: t.title,
      artist: t.artist,
      reason: t.reason,
      links: {
        spotify: toSpotifySearchURL(`${t.title} ${t.artist}`),
        audiomack: toAudiomackSearchURL(`${t.title} ${t.artist}`),
      },
    }));
  }

  /**
   * Lightweight utility: generate a compact keyword string for UI chips or tags.
   */
  toKeywordChips(analysis: MoodAnalysis, max = 10): string[] {
    return analysis.keywords.slice(0, max);
  }

  /**
   * Optional: build API-friendly query objects (Spotify Web API example).
   * This does not call the API; it just prepares parameters you could feed into fetch().
   */
  buildSpotifyApiParams(analysis: MoodAnalysis): Array<{ q: string; type: string; limit: number }> {
    const base = [
      `${analysis.category}`,
      analysis.countryCode && COUNTRY_GENRE_HINTS[analysis.countryCode]?.[0],
      ...analysis.keywords.slice(0, 3),
    ].filter(Boolean) as string[];

    const q = unique(base).join(" ");
    return [
      { q, type: "track,playlist", limit: 10 },
      { q: `${q} ${analysis.facets.energy} energy`, type: "track", limit: 10 },
    ];
  }

  /**
   * Optional: build Audiomack-friendly search strings.
   * Audiomack search is keyword-based; you can pass these to your own search endpoint.
   */
  buildAudiomackSearchTerms(analysis: MoodAnalysis): string[] {
    const parts = [analysis.category, ...analysis.keywords.slice(0, 5)];
    return [unique(parts).join(" "), `${analysis.category} playlist`];
  }
}

export default MoodAnalyzer;
