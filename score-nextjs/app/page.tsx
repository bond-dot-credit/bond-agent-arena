import Header from './components/Header';
import AgentCarousel from './components/AgentCarousel';
import ChartWithData from './components/ChartWithData';
import InfoTabs from './components/InfoTabs';
import Footer from './components/Footer';
import { Component as EtheralShadow } from './components/ui/etheral-shadow';
import { getAllAgents } from '@/lib/services/agentService';

export const runtime = 'edge';

export default async function Home() {
  // Fetch agents from Supabase
  const agents = await getAllAgents();

  return (
    <div className="relative min-h-screen bg-white text-black overflow-x-hidden flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        <div className="container mx-auto px-4 max-w-[1600px] flex-1">
          {/* Token Prices - Desktop only */}
          <AgentCarousel />

          {/* Combined Chart and Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 relative shadow-lg mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <ChartWithData agents={agents} />
              </div>
              <div className="lg:col-span-2">
                <InfoTabs agents={agents} />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
