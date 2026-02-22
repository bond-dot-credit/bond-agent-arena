import Header from '../components/Header';
import AgentCarousel from '../components/AgentCarousel';
import CryptoGrid from '../components/CryptoGrid';
import Footer from '../components/Footer';
import { getAllAgents } from '@/lib/services/agentService';

export default async function LeaderboardPage() {
  const agents = await getAllAgents();

  return (
    <div
      className="relative min-h-screen bg-white text-black overflow-x-hidden flex flex-col"
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        <div className="container mx-auto px-4 max-w-[1600px] flex-1">
          <div>
            <AgentCarousel />
          </div>

          <div className="mb-6 md:mb-8 mt-6 md:mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Agent <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Live performance rankings of autonomous yield agents
            </p>
          </div>

          <div>
            <CryptoGrid agents={agents} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
