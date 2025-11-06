'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 max-w-[1600px] py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Season End Info */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              <span className="font-semibold text-[#c9b382]">Agentic Alpha Season 1</span> ends{' '}
              <span className="text-white font-semibold">6th December 2025, 5 p.m. EST</span>
            </p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-6">
            <a
              href="https://x.com/bondoncredit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 text-sm font-semibold"
            >
              X
            </a>
            <a
              href="https://discord.gg/bondcredit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 text-sm font-semibold"
            >
              DISCORD
            </a>
            <a
              href="mailto:team@bond.credit"
              className="text-gray-400 hover:text-[#c9b382] transition-colors duration-300 text-sm font-semibold"
            >
              team@bond.credit
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
