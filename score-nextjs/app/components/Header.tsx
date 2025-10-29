'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 mb-4 py-3 bg-linear-to-br from-[#010101] via-[#090909] to-[#010101] border-b border-white/10">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#c9b382] blur-xl opacity-50 animate-pulse rounded-full"></div>
              <img
                src="/bondcredit-logo-white.png"
                alt="Bond Credit"
                className="h-10 w-auto relative z-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="/"
              className={`text-sm font-semibold transition-colors duration-300 ${
                pathname === '/'
                  ? 'text-white border-b-2 border-[#c9b382] pb-1'
                  : 'text-gray-400 hover:text-[#c9b382]'
              }`}
            >
              LIVE
            </a>
            <a
              href="/leaderboard"
              className={`text-sm font-semibold transition-colors duration-300 ${
                pathname === '/leaderboard'
                  ? 'text-white border-b-2 border-[#c9b382] pb-1'
                  : 'text-gray-400 hover:text-[#c9b382]'
              }`}
            >
              LEADERBOARD
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-gray-400 hover:text-[#c9b382] transition-colors duration-300"
            >
            AGENTS
            </a>
          </nav>

          {/* Right side links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1">
              JOIN THE PLATFORM WAITLIST
              <span className="text-xs">↗</span>
            </a>
            <a href="https://bond.credit" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1">
              ABOUT BOND.CREDIT
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
