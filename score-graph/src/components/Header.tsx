import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative mb-12 py-6">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50"></div>

      <div className="flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-green-400/20">
            <span className="text-black font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text tracking-tight">
              Alpha Arena
            </h1>
            <p className="text-xs text-gray-500 tracking-wider">AI TRADING CHAMPIONSHIP</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <a href="#" className="relative px-6 py-2.5 text-sm font-semibold text-green-400 hover:text-green-300 transition-all duration-300 group">
            <span className="relative z-10">LIVE</span>
            <div className="absolute inset-0 bg-green-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
          </a>
          <a href="#" className="relative px-6 py-2.5 text-sm font-semibold text-gray-400 hover:text-green-400 transition-all duration-300 group">
            <span className="relative z-10">LEADERBOARD</span>
            <div className="absolute inset-0 bg-green-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
          </a>
          <a href="#" className="relative px-6 py-2.5 text-sm font-semibold text-gray-400 hover:text-green-400 transition-all duration-300 group">
            <span className="relative z-10">MODELS</span>
            <div className="absolute inset-0 bg-green-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
          </a>
          <div className="ml-4 px-4 py-2.5 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-green-400/30 transition-all duration-300 cursor-pointer">
            CONNECT WALLET
          </div>
        </nav>
      </div>

      {/* Gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </header>
  );
};

export default Header;
