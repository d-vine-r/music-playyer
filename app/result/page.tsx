'use client';

import React, { useEffect, useState } from 'react';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { detectMoodFromText, getSongQueryByMood } from '@/lib/mood';

const SPOTIFY_CLIENT_ID = '78e9602b9eb94acd82c54578f78170f8';
const SPOTIFY_CLIENT_SECRET = '06465ec8b4514690863f2a1ba5e9b39c';

const fetchSpotifyToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  return data.access_token;
};

// Use Recommendations API with up to three seed genres
const fetchSongs = async (token: string, seedGenres: string[]) => {
  const seed = (seedGenres || []).filter(Boolean).slice(0, 3).join(',');
  const params = new URLSearchParams({
    seed_genres: seed || 'pop',
    limit: '10',
  });
  const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`;
  console.log('Spotify Recommendations API URL:', url);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    console.error('Spotify API error:', response.status, text);
    return [];
  }
  const data = await response.json();
  return data.tracks || [];
};

export default function ResultPage() {
  const [chatResult, setChatResult] = useState('');
  const [detectedMood, setDetectedMood] = useState('neutral');
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('Chatresult');
      if (stored) setChatResult(stored);
    }
  }, []);

  useEffect(() => {
    if (!chatResult) return;
    const mood = detectMoodFromText(chatResult);
    setDetectedMood(mood);
  }, [chatResult]);

  useEffect(() => {
    if (!detectedMood) return;
    const getSongs = async () => {
      setLoading(true);
      try {
        const songQuery = getSongQueryByMood(detectedMood);
        const token = await fetchSpotifyToken();
        const genres = (songQuery.genres && songQuery.genres.length > 0) ? songQuery.genres.slice(0, 3) : ['pop'];
        const tracks = await fetchSongs(token, genres);
        setSongs(tracks);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
      setLoading(false);
    };
    getSongs();
  }, [detectedMood]);

  const openInSpotify = (song: any) => {
    if (song.external_urls && song.external_urls.spotify) {
      window.open(song.external_urls.spotify, '_blank');
    }
  };

  return (
    <main>
      <BackgroundGradientAnimation>
        <div className="absolute overflow-y-auto w-full mx-auto space-y-10 h-screen z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-2 text-2xl text-center sm:text-3xl md:text-4xl lg:text-7xl">
          <h3 className='text-center text-white font-mont align-middle p-8 pt-8 mt-32'>{chatResult}</h3>
          <div className="text-lg text-white w-full max-w-2xl mx-auto">
            <p className="mb-4 text-base text-white/80">Detected mood: <span className="font-semibold text-white">{detectedMood}</span></p>
            {/* Spotify Results */}
            <h4 className="text-xl font-bold mt-8 mb-2">Spotify Songs</h4>
            {loading ? (
              <p>Loading songs from Spotify...</p>
            ) : songs.length > 0 ? (
              <ul className="space-y-2">
                {songs.map((song) => (
                  <li
                    key={song.id}
                    className="bg-white/10 rounded-3xl shadow-lg p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between group"
                  >
                    <span>
                      <strong>{song.name}</strong> by {song.artists.map((a: any) => a.name).join(', ')}
                    </span>
                    <button
                      className="bg-white/30 rounded-3xl shadow-lg p-2 flex flex-col flex-wrap sm:flex-row sm:items-center sm:justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => openInSpotify(song)}
                    >
                      Open in Spotify
                    </button>
                    {song.album?.images?.[2]?.url && (
                      <img src={song.album.images[2].url} alt={song.name} className="w-12 h-12 rounded mt-2 sm:mt-0 sm:ml-4" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No songs found for "{chatResult}" on Spotify.</p>
            )}
          </div>
        </div>
      </BackgroundGradientAnimation>
    </main>
  );
}
