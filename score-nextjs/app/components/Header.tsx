'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/Button';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [agentName, setAgentName] = useState('');
  const [website, setWebsite] = useState('');
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowWalletDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch('/api/token-prices');
        if (response.ok) {
          const data = await response.json();
          const prices: TokenPrice[] = [
            { symbol: 'BTC', price: data.bitcoin?.usd || 0, change24h: data.bitcoin?.usd_24h_change || 0 },
            { symbol: 'ETH', price: data.ethereum?.usd || 0, change24h: data.ethereum?.usd_24h_change || 0 },
            { symbol: 'MAMO', price: data.mamo?.usd || 0, change24h: data.mamo?.usd_24h_change || 0 },
            { symbol: 'GIZA', price: data.giza?.usd || 0, change24h: data.giza?.usd_24h_change || 0 }
          ];
          setTokenPrices(prices);
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
      }
    };
    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container mx-auto px-3 md:px-4 max-w-[1600px]">
          {/* Mobile Header */}
          <div className="lg:hidden py-2">
            <div className="flex items-center justify-between mb-2">
              <a href="/" className="flex flex-col">
                <img
                  src="/bond.credit%20logo_black.svg"
                  alt="bond.credit"
                  className="h-4 w-auto"
                />
                <span className="text-[9px] text-black/40 font-medium">Agentic Alpha</span>
              </a>
              <div className="flex items-center gap-3">
                {ready && !authenticated ? (
                  <Button size="sm" onClick={login}>
                    Connect
                  </Button>
                ) : ready && authenticated ? (
                  <button
                    onClick={logout}
                    className="text-xs font-medium text-gray-600 hover:text-[#1172E1] transition-colors"
                  >
                    {truncateAddress(user?.wallet?.address || '')}
                  </button>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <a href="/" className={`flex items-center gap-1 transition-colors ${pathname === '/' ? 'text-black font-medium' : 'text-gray-500'}`}>
                  LIVE
                  {pathname === '/' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                </a>
                <a href="/leaderboard" className={`transition-colors ${pathname === '/leaderboard' ? 'text-black font-medium' : 'text-gray-500'}`}>LEADERBOARD</a>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowWaitlistModal(true)} className="text-gray-500 hover:text-black">
                  Waitlist
                </button>
                <button onClick={() => setShowAgentModal(true)} className="text-gray-500 hover:text-black">
                  Agents
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-16 md:h-20">
            {/* Logo + Slogan */}
            <div className="flex flex-col">
              <motion.a 
                href="/" 
                className="flex items-center group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src="/bond.credit%20logo_black.svg"
                  alt="bond.credit"
                  className="h-4 w-auto"
                />
              </motion.a>
              <span className="text-[10px] text-black/40 font-medium tracking-wide">Agentic Alpha</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {[
                { href: '/', label: 'LIVE', showLiveDot: true },
                { href: '/leaderboard', label: 'LEADERBOARD', showLiveDot: false },
              ].map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm text-black/60 hover:text-black transition-colors cursor-pointer ${
                    pathname === item.href ? 'text-black font-medium' : ''
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-1.5 relative z-10">
                    {item.label}
                    {item.showLiveDot && (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </span>
                  {pathname === item.href && (
                    <div
                      className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-[#1172E1] rounded-full"
                    />
                  )}
                </motion.a>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-5">
              {ready && !authenticated ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 2500 2500" fill="none">
                    <path d="M1250 0C559.17 0 0 559.17 0 1250s559.17 1250 1250 1250 1250-559.17 1250-1250S1940.83 0 1250 0z" fill="#28A0F0"/>
                    <path d="M1560.27 1148.87c-47.68 12.31-90.09 28.25-125.45 47.68-47.68-62.78-108.52-90.09-179.4-82.58-70.82 7.51-124.38 47.68-155.57 120.5-29.97 70.82-44.96 155.57-44.96 249.12 0 95.28 15.82 177.67 47.68 249.12 31.19 73.45 84.75 112.78 155.57 120.5 70.88 7.51 131.72-20.06 179.4-82.58 35.37 19.43 77.78 35.37 125.45 47.68 62.78 16.01 132.54 15.01 203.33-3.13 78.08-20.06 138.01-60.22 179.4-120.5 41.39-60.22 62.01-132.54 62.01-215.76 0-82.44-20.62-154.76-62.01-214.94-41.39-60.22-101.33-100.33-179.4-120.5-70.78-18.14-140.55-19.14-203.33-3.13zM1093.26 1604.8c-28.06 34.08-66.09 51.23-112.78 51.23-45.78 0-84.68-17.15-112.78-51.23-28.06-34.08-42.24-81.24-42.24-140.55 0-58.4 14.18-105.56 42.24-139.64 28.06-34.08 66.09-51.23 112.78-51.23 45.78 0 84.68 17.15 112.78 51.23 28.06 34.08 42.24 81.24 42.24 139.64 0 59.31-14.18 106.47-42.24 140.55z" fill="#fff"/>
                  </svg>
                  <Button size="sm" onClick={login}>
                    CONNECT WALLET <span className="ml-1">→</span>
                  </Button>
                </div>
              ) : ready && authenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 2500 2500" fill="none">
                      <path d="M1250 0C559.17 0 0 559.17 0 1250s559.17 1250 1250 1250 1250-559.17 1250-1250S1940.83 0 1250 0z" fill="#28A0F0"/>
                      <path d="M1560.27 1148.87c-47.68 12.31-90.09 28.25-125.45 47.68-47.68-62.78-108.52-90.09-179.4-82.58-70.82 7.51-124.38 47.68-155.57 120.5-29.97 70.82-44.96 155.57-44.96 249.12 0 95.28 15.82 177.67 47.68 249.12 31.19 73.45 84.75 112.78 155.57 120.5 70.88 7.51 131.72-20.06 179.4-82.58 35.37 19.43 77.78 35.37 125.45 47.68 62.78 16.01 132.54 15.01 203.33-3.13 78.08-20.06 138.01-60.22 179.4-120.5 41.39-60.22 62.01-132.54 62.01-215.76 0-82.44-20.62-154.76-62.01-214.94-41.39-60.22-101.33-100.33-179.4-120.5-70.78-18.14-140.55-19.14-203.33-3.13zM1093.26 1604.8c-28.06 34.08-66.09 51.23-112.78 51.23-45.78 0-84.68-17.15-112.78-51.23-28.06-34.08-42.24-81.24-42.24-140.55 0-58.4 14.18-105.56 42.24-139.64 28.06-34.08 66.09-51.23 112.78-51.23 45.78 0 84.68 17.15 112.78 51.23 28.06 34.08 42.24 81.24 42.24 139.64 0 59.31-14.18 106.47-42.24 140.55z" fill="#fff"/>
                    </svg>
                    {truncateAddress(user?.wallet?.address || '')}
                    <svg className={`w-3 h-3 transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Wallet Dropdown */}
                  {showWalletDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                      <a
                        href={`https://arbiscan.io/address/${user?.wallet?.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowWalletDropdown(false)}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                        View Wallet
                      </a>
                      <button
                        onClick={() => {
                          setShowWalletDropdown(false);
                          logout();
                        }}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button size="sm" disabled>Loading...</Button>
              )}
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="flex items-center gap-1 text-sm text-black/60 hover:text-black transition-colors cursor-pointer"
              >
                Waitlist
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </button>
              <button
                onClick={() => setShowAgentModal(true)}
                className="flex items-center gap-1 text-sm text-black/60 hover:text-black transition-colors cursor-pointer"
              >
                Agents
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </button>
              <a 
                href="https://x.com/bondoncredit?s=21" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-sm text-black/60 hover:text-black transition-colors cursor-pointer"
              >
                About
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlistModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWaitlistModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
              className="fixed inset-0 m-auto z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <button
                    onClick={() => setShowWaitlistModal(false)}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Join Waitlist</span>
                  <div className="w-10" />
                </div>

                <div className="p-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-20 h-20 mx-auto mb-6"
                  >
                    <div className="absolute inset-0 bg-[#1172E1]/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-[#1172E1]/30 rounded-full" />
                    <div className="relative w-full h-full bg-[#1172E1] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-center text-black mb-2"
                  >
                    Get Early Access
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-500 text-center mb-6"
                  >
                    Be the first to access the bond.credit platform
                  </motion.p>

                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleWaitlistSubmit} 
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="user-type" className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
                      <select
                        id="user-type"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                      >
                        <option value="" disabled>Select your role</option>
                        <option value="agent-builder">Agent Builder</option>
                        <option value="researcher">Researcher</option>
                        <option value="allocator">Allocator</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full mt-2">
                      Join Waitlist
                    </Button>
                  </motion.form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Agent Modal */}
      <AnimatePresence>
        {showAgentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgentModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
              className="fixed inset-0 m-auto z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <button
                    onClick={() => setShowAgentModal(false)}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Submit Agent</span>
                  <div className="w-10" />
                </div>

                <div className="p-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-20 h-20 mx-auto mb-6"
                  >
                    <div className="absolute inset-0 bg-[#1172E1]/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-[#1172E1]/30 rounded-full" />
                    <div className="relative w-full h-full bg-[#1172E1] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-center text-black mb-2"
                  >
                    Join Season 2
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-500 text-center mb-6"
                  >
                    Season 0 has ended. Submit your agent for the next Season.
                  </motion.p>

                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleAgentSubmit} 
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        id="agent-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="agent-for-consideration" className="block text-sm font-medium text-gray-700 mb-1.5">Agent Name</label>
                      <input
                        type="text"
                        id="agent-for-consideration"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                        placeholder="Agent name"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                      <input
                        type="url"
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1172E1]/20 focus:border-[#1172E1] transition-all"
                        placeholder="https://your-agent.com"
                      />
                    </div>

                    <Button type="submit" className="w-full mt-2">
                      Submit Agent
                    </Button>
                  </motion.form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
