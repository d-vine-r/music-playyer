import Image from "next/image";
import { getSquarePhotos } from '@/lib/mood';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const photos = await getSquarePhotos(1, 'hip hop');
const photo = photos[0];

const Tracks = [
  {
    trackid: 1,
    Track: "Track Title",
    Artist: "Artist Name",
    Album: "Album Title",
  },
  {
    trackid: 2,
    Track: "Track Title",
    Artist: "Artist Name",
    Album: "Album Title",
  },
  {
    trcakid: 3,
    Track: "Track Title",
    Artist: "Artist Name",
    Album: "Album Title",
  },
  {
    trackid: 4,
    Track: "Track Title",
    Artist: "Artist Name",
    Album: "Album Title",
  },
  {
    trackid: 5,
    Track: "Track Title",
    Artist: "Artist Name",
    Album: "Album Title",
  }
]

export default async function Playlist() {
  return (
    <div className="min-h-screen p-8 pb-20 bg-background text-foreground">
      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Playlist Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-8 mb-8">
            <div className="w-48 h-48 bg-gray-300 rounded-xl flex-shrink-0">
              {photo && (
                <Image
                  src={photo.src.large2x}
                  alt={photo.alt || 'Playlist Cover'}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-mont font-bold">Hottest Hip Hop</h1>
              <p className="text-gray-600 font-outfit mt-2">Got some rad stuff you should listen to immediately. Find your favorites, discover the hottest new beats, and give me a follow.</p>
              <p className="text-gray-600 font-outfit mt-2">John Novitsky &middot; 10 Tracks &middot; 31:15 Duration</p>
              <div className="flex gap-4 mt-4">
                <button className="bg-primary-accent hover:bg-secondary-accent text-white px-6 py-2 rounded-full">Play</button>
                <button className="bg-gray-200 hover:bg-gray-300  text-gray-800  px-6 py-2 rounded-full">Add Playlist</button>
              </div>
            </div>
          </div>

          {/* Track List */}
          <Table>
            <TableHeader className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 border-b pb-2 mb-4 text-gray-600  text-sm uppercase">
              <TableRow>
                <TableHead className="w-12 font-mont font-bold">Track</TableHead>
                <TableHead className="w-12 font-mont font-bold">Artist</TableHead>
                <TableHead className="w-12 font-mont font-bold">Album</TableHead>
                <TableHead className="w-12 font-mont font-bold">Time</TableHead>
              </TableRow>
            </TableHeader>
            {/* Placeholder Tracks */}
            <TableBody>
              {Tracks.map((track) => (
                <TableRow key={track.trackid ?? track.trackid}>
                  <TableCell className="font-outfit">{track.Track}</TableCell>
                  <TableCell className="font-medium">{track.Artist}</TableCell>
                  <TableCell className="font-outfit">{track.Album}</TableCell>
                  <TableCell className="text-right">3:00</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-gray-100  rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Popular Tracks</h3>
            {/* Placeholder Popular Tracks */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center mb-2">
                <p>Track Name</p>
                <p className="text-gray-600  text-sm"> Plays</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-100  rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Stream Activity</h3>
            {/* Placeholder Chart */}
            <div className="w-full h-32 bg-gray-300  rounded"></div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Fans Also Like</h3>
            {/* Placeholder Artists */}
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full">{/* Placeholder Artist Image */}</div>
                <div>
                  <p className="font-semibold">Artist Name</p>
                  <p className="text-sm text-gray-600 "> Followers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
