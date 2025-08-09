const SPOTIFY_CLIENT_ID = '78e9602b9eb94acd82c54578f78170f8';
const REDIRECT_URI = 'http://localhost:3000/result'; // Change to your deployed URL

export default function loginWithSpotify() {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
  ];
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}`;
  window.location.href = authUrl;
}