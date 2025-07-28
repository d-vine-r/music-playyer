import Link from 'next/link';
import { Search } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white">
      <div className="container mx-auto px-4 py-8 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-montserrat text-[#EC4067]">MUSON</div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="#" className="hover:text-[#662C91] transition-colors">Rankings</Link>
          <Link href="#" className="hover:text-[#662C91] transition-colors">Browse</Link>
          <Link href="#" className="hover:text-[#662C91] transition-colors">For You</Link>
          <Link href="/" className="hover:text-[#662C91] transition-colors">My Library</Link>
        </div>

        {/* Search Icon */}
        <Search/>
      </div>
    </nav>
  );
};

export default Navbar;
