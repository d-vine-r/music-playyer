import Image from "next/image";

export default function Playlist() {
  return (
    <div className="min-h-screen p-8 pb-20 bg-background text-foreground">
      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Playlist Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-8 mb-8">
            <div className="w-48 h-48 bg-gray-300 dark:bg-gray-700 rounded-xl flex-shrink-0">{/* Placeholder Image */}</div>
            <div>
              <h1 className="text-4xl font-bold">Hottest Hip Hop</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Got some rad stuff you should listen to immediately. Find your favorites, discover the hottest new beats, and give me a follow.</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">John Novitsky &middot; 10 Tracks &middot; 31:15 Duration</p>
              <div className="flex gap-4 mt-4">
                <button className="bg-primary-accent hover:bg-secondary-accent text-white px-6 py-2 rounded-full">Play</button>
                <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-300 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-full">Add Playlist</button>
              </div>
            </div>
          </div>

          {/* Track List */}
          <div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 border-b pb-2 mb-4 text-gray-600 dark:text-gray-400 text-sm uppercase">
              <div>Track</div>
              <div>Artist</div>
              <div>Album</div>
              <div className="w-12">Time</div>
              <div></div>
            </div>
            {/* Placeholder Tracks */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="grid grid-cols-  gap-4 items-center py-2 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded">{/* Placeholder Track Image */}</div>
                  <div>
                    <p className="font-semibold">Track Title</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Artist Name</p>
                  </div>
                </div>
                <div>Artist Name</div>
                <div>Album Title</div>
                <div>3:00</div>
                <div>+</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Popular Tracks</h3>
            {/* Placeholder Popular Tracks */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center mb-2">
                <p>Track Name</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm"> Plays</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Stream Activity</h3>
            {/* Placeholder Chart */}
            <div className="w-full h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Fans Also Like</h3>
            {/* Placeholder Artists */}
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full">{/* Placeholder Artist Image */}</div>
                <div>
                  <p className="font-semibold">Artist Name</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400"> Followers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
