import Link from 'next/link';
import { Search } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="sticky w-full top-0 z-50 bg-white">
      <div className="container mx-auto px-4 py-8 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-mont font-bold text-[#EC4067]">MUSON</div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="#" className="hover:text-[#662C91] font-outfit transition-colors">Rankings</Link>
          <Link href="#" className="hover:text-[#662C91] font-outfit transition-colors">Browse</Link>
          <Link href="#" className="hover:text-[#662C91] font-outfit transition-colors">For You</Link>
          <Link href="#" className="hover:text-[#662C91] font-outfit transition-colors">Chat</Link>
          <Link href="/" className="hover:text-[#662C91] transition-colors">My Library</Link>
        </div>

        {/* Search Icon */}
        <Search/>
      </div>
    </nav>
  );
};

export default Navbar;
