import axios from 'axios';

const API_KEY = process.env.PEXELS_API_KEY;
const client = axios.create({
  baseURL: 'https://api.pexels.com/v1',
  headers: { Authorization: API_KEY },
});

export async function getSquarePhotos(count: number, query = 'nature') {
  try {
    const searchResponse = await client.get(`/search?query=${query}&per_page=80`);
    const allPhotos = searchResponse.data.photos;

    const squarePhotos = allPhotos.filter((photo: any) => {
      const aspectRatio = photo.width / photo.height;
      return aspectRatio > 0.9 && aspectRatio < 1.1;
    });

    const shuffled = [...squarePhotos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Pexels API error:', error);
    return [];
  }
}
