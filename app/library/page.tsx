
import Link from "next/link";
import { Himage } from "@/components/Gallery"
import { getSquarePhotos } from '@/lib/mood';



export default async function MyLibrary() {
    const photos = await getSquarePhotos(9, 'nature');
  return (
    <section>
        <div className="min-h-screen p-8 pb-20 bg-background text-foreground">
        <main className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">Your Library</h1>

          {/* Featured Playlists Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-primary-accent">Featured Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.slice(0, 3).map((photo, index:number) => (
                <Link key={photo.id} href="/playlist">
                  <div className="bg-gray-100  rounded-xl p-6 cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="w-full h-60 rounded-lg mb-4 overflow-hidden">
                      <Himage 
                        photo={photo} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Playlist {index + 1}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {photo.photographer}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-outfit mb-4 text-primary-accent">Forgotten favourites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.slice(4, 7).map((photo, index) => (
                <Link key={photo.id} href="/playlist">
                  <div className="bg-gray-100  rounded-xl p-6 cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="w-full h-60 rounded-lg mb-4 overflow-hidden">
                      <Himage 
                        photo={photo} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Song Name {index + 1}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {photo.photographer}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Albums Section */}
          <section className="mb-12 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4 text-primary-accent">Featured Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.slice(0, 5).map((photo, index) => (
                <Link key={photo.id} href="/playlist">
                  <div className="bg-gray-100  rounded-xl p-6 cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="w-full h-60 rounded-lg mb-4 overflow-hidden">
                      <Himage 
                        photo={photo} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Album {index + 1}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {photo.photographer}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Artists Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder Artist Cards */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-100 rounded-xl p-6">
                  <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Artist Name</h3>
                  <p className="text-gray-600 dark:text-gray-400">Genre</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
    
  );
}
