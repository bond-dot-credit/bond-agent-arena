'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save data to backend/database
    console.log('Waitlist submission:', { name, email });
    alert('Thanks for joining the waitlist!');
    setShowWaitlistModal(false);
    setName('');
    setEmail('');
  };

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
              href="/agents"
              className={`text-sm font-semibold transition-colors duration-300 ${
                pathname === '/agents'
                  ? 'text-white border-b-2 border-[#c9b382] pb-1'
                  : 'text-gray-400 hover:text-[#c9b382]'
              }`}
            >
              AGENTS
            </a>
          </nav>

          {/* Right side links */}
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1"
            >
              JOIN THE PLATFORM WAITLIST
              <span className="text-xs">↗</span>
            </button>
            <a href="https://bond.credit" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1">
              ABOUT BOND.CREDIT
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            {/* Modal Card */}
            <div className="bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] border border-white/10 rounded-xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <h2 className="text-2xl font-bold text-[#c9b382] mb-2">Join the Waitlist</h2>
              <p className="text-gray-400 text-sm mb-6">Be the first to access the Bond Credit platform</p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9b382] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9b382] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#c9b382] hover:bg-[#d4c49a] text-black font-bold rounded-lg transition-colors duration-300"
                >
                  Join Waitlist
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
