import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 mb-8 py-4 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] border-b border-white/10">
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/bondcredit-logo-white.png"
              alt="Bond Credit"
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-white hover:text-green-400 transition-colors duration-300 border-b-2 border-green-400 pb-1">
              LIVE
            </a>
            <a href="#" className="text-sm font-semibold text-gray-400 hover:text-green-400 transition-colors duration-300">
              LEADERBOARD
            </a>
            <a href="#" className="text-sm font-semibold text-gray-400 hover:text-green-400 transition-colors duration-300">
              MODELS
            </a>
          </nav>

          {/* Right side links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center gap-1">
              JOIN THE PLATFORM WAITLIST
              <span className="text-xs">↗</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center gap-1">
              ABOUT NOF1
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
