'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [agentName, setAgentName] = useState('');
  const [website, setWebsite] = useState('');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thanks for joining the waitlist!');
        setShowWaitlistModal(false);
        setName('');
        setEmail('');
        setUserType('');
      } else {
        alert(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      alert('Failed to join waitlist. Please try again.');
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/agent-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, agentName, website }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thanks for your interest! We will review your agent for Season 2.');
        setShowAgentModal(false);
        setName('');
        setAgentName('');
        setWebsite('');
      } else {
        alert(data.error || 'Failed to submit agent');
      }
    } catch (error) {
      console.error('Agent submission error:', error);
      alert('Failed to submit agent. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-50 mb-4 py-3 bg-linear-to-br from-[#010101] via-[#090909] to-[#010101] border-b border-white/10">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#c9b382] blur-xl opacity-50 animate-pulse rounded-full"></div>
              <img
                src="/bondcredit-logo-white.png"
                alt="Bond Credit"
                className="h-8 md:h-10 w-auto relative z-10"
              />
            </a>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
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
          </nav>

          {/* Desktop Right side links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm">
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1"
            >
              WAITLIST
              <span className="text-xs">↗</span>
            </button>
            <button
              onClick={() => setShowAgentModal(true)}
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1"
            >
              AGENTS
              <span className="text-xs">↗</span>
            </button>
            <a href="https://bond.credit" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 flex items-center gap-1">
              ABOUT
              <span className="text-xs">↗</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 ml-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <nav className="flex flex-col gap-4">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors duration-300 ${
                  pathname === '/' ? 'text-[#c9b382]' : 'text-gray-400'
                }`}
              >
                LIVE
              </a>
              <a
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors duration-300 ${
                  pathname === '/leaderboard' ? 'text-[#c9b382]' : 'text-gray-400'
                }`}
              >
                LEADERBOARD
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowWaitlistModal(true);
                }}
                className="text-sm font-semibold text-gray-400 text-left"
              >
                WAITLIST
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAgentModal(true);
                }}
                className="text-sm font-semibold text-gray-400 text-left"
              >
                AGENTS
              </button>
              <a
                href="https://bond.credit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-400"
              >
                ABOUT BOND.CREDIT
              </a>
            </nav>
          </div>
        )}
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
              <h2 className="text-2xl font-bold text-[#c9b382] mb-2">Waitlist</h2>
              <p className="text-gray-400 text-sm mb-6">Be the first to access the bond.credit platform</p>

              {/* Form */}
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
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

                <div>
                  <label htmlFor="user-type" className="block text-sm font-semibold text-white mb-2">
                    I am a
                  </label>
                  <select
                    id="user-type"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#c9b382] transition-colors"
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="agent-builder">Agent Builder</option>
                    <option value="researcher">Researcher</option>
                    <option value="allocator">Allocator</option>
                  </select>
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

      {/* Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            {/* Modal Card */}
            <div className="bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] border border-white/10 rounded-xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowAgentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <h2 className="text-2xl font-bold text-[#c9b382] mb-2">Join Season 2</h2>
              <p className="text-gray-400 text-sm mb-6">Submit your agent for consideration in the next season</p>

              {/* Form */}
              <form onSubmit={handleAgentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="agent-name" className="block text-sm font-semibold text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="agent-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9b382] transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="agent-for-consideration" className="block text-sm font-semibold text-white mb-2">
                    Agent for Consideration
                  </label>
                  <input
                    type="text"
                    id="agent-for-consideration"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9b382] transition-colors"
                    placeholder="Agent name"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-white mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9b382] transition-colors"
                    placeholder="https://your-agent.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#c9b382] hover:bg-[#d4c49a] text-black font-bold rounded-lg transition-colors duration-300"
                >
                  Submit Agent
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
