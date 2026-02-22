import React from 'react';

const Card = () => {
  return (
    <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
      <div className="text-black rounded-2xl border border-black/5 bg-white/90 backdrop-blur-sm shadow-card duration-700 z-10 relative overflow-hidden hover:border-[#1172e1]/20 hover:shadow-card-hover hover:scale-105 w-[350px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1172e1]/5 to-[#2c88f8]/5 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div style={{animationDelay: '0.5s'}} className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[#1172e1]/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce" />
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-[#1172e1]/5 blur-xl animate-ping" />
          <div style={{animationDelay: '1s'}} className="absolute bottom-16 right-16 w-12 h-12 rounded-full bg-[#1172e1]/5 blur-lg animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1172e1]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>
        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-[#1172e1]/20 animate-ping" />
              <div style={{animationDelay: '0.5s'}} className="absolute inset-0 rounded-full border border-[#1172e1]/10 animate-pulse" />
              <div className="p-6 rounded-full backdrop-blur-lg border border-[#1172e1]/20 bg-white shadow-card transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-[#1172e1]/20">
                <div className="transform group-hover:rotate-180 transition-transform duration-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-current text-[#1172e1] group-hover:text-[#1575e4] transition-colors duration-300">
                    <path d="M5.164 0L.16 18.928L18.836 24L23.84 5.072L5.164 0ZM14.023 15.208L8.792 13.469L10.436 8.152L15.667 9.891L14.023 15.208Z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-3xl font-bold bg-gradient-to-r from-[#1172e1] via-[#1575e4] to-[#2c88f8] bg-clip-text text-transparent animate-pulse">
                Roblox
              </p>
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-gray-600 text-sm font-semibold leading-relaxed transform group-hover:text-gray-700 transition-colors duration-300">
                Showcase your
              </p>
              <p className="text-gray-600 text-sm leading-relaxed transform group-hover:text-gray-700 transition-colors duration-300">
                highlight your achievements,
              </p>
              <p className="text-gray-600 text-sm leading-relaxed transform group-hover:text-gray-700 transition-colors duration-300">
                and let others explore your creations
              </p>
              <p className="text-gray-600 text-sm leading-relaxed transform group-hover:text-gray-700 transition-colors duration-300">
                or join you in games.
              </p>
            </div>
            <div className="mt-6 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-[#1172e1] to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse" />
            <div className="flex space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-[#1172e1] rounded-full animate-bounce" />
              <div style={{animationDelay: '0.1s'}} className="w-2 h-2 bg-[#1172e1] rounded-full animate-bounce" />
              <div style={{animationDelay: '0.2s'}} className="w-2 h-2 bg-[#1172e1] rounded-full animate-bounce" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#1172e1]/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#1172e1]/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
}

export default Card;
