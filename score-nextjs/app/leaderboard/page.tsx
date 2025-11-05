import Header from '../components/Header';
import AgentCarousel from '../components/AgentCarousel';
import CryptoGrid from '../components/CryptoGrid';
import Footer from '../components/Footer';
import { Component as EtheralShadow } from '../components/ui/etheral-shadow';
import { getAllAgents } from '@/lib/services/agentService';

export default async function LeaderboardPage() {
  const agents = await getAllAgents();

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        <div className="container mx-auto px-4 max-w-[1600px] flex-1">
          {/* Token Prices */}
          <AgentCarousel />

          {/* Page Title */}
          <div className="mb-6 md:mb-8 mt-6 md:mt-8">
            <h1 className="text-2xl md:text-4xl font-bold text-[#c9b382] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Agent Leaderboard</h1>
            <p className="text-gray-400 text-sm md:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Live performance rankings of autonomous yield agents</p>
          </div>

          {/* Detailed Leaderboard Grid */}
          <CryptoGrid agents={agents} />
        </div>

        <Footer />
      </div>
    </div>
  );
}
