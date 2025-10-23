import React, { useEffect } from 'react';
import Header from './components/Header';
import CryptoGrid from './components/CryptoGrid';
import Chart from './components/Chart';
import ModelStats from './components/ModelStats';
import StatusBar from './components/StatusBar';
import Particles from './components/Particles';

function App() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <div className="relative z-10 container mx-auto p-4">
        <Header />
        <CryptoGrid />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <Chart />
          </div>
          <div>
            <ModelStats />
          </div>
        </div>
        <StatusBar />
      </div>
    </div>
  );
}

export default App;
