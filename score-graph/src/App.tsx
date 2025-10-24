import React, { useEffect } from 'react';
import Header from './components/Header';
import AgentCarousel from './components/AgentCarousel';
import CryptoGrid from './components/CryptoGrid';
import Chart from './components/Chart';
import ModelStats from './components/ModelStats';
import StatusBar from './components/StatusBar';
import { Component as EtheralShadow } from './components/ui/etheral-shadow';

function App() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>
      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-4 max-w-[1600px]">
          {/* Agent Carousel */}
          <AgentCarousel />

          {/* Combined Chart and Leaderboard */}
          <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md border border-white/10 rounded-2xl p-5 relative shadow-2xl mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-3">
                <Chart />
              </div>
              <div>
                <ModelStats />
              </div>
            </div>
          </div>

          <StatusBar />
        </div>
      </div>
    </div>
  );
}

export default App;
