import Header from './components/Header';
import AgentCarousel from './components/AgentCarousel';
import ChartWithData from './components/ChartWithData';
import InfoTabs from './components/InfoTabs';
import Footer from './components/Footer';
import { Component as EtheralShadow } from './components/ui/etheral-shadow';
import { getAllAgents } from '@/lib/services/agentService';

export default async function Home() {
  // Fetch agents from Supabase
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

          {/* Combined Chart and Leaderboard */}
          <div className="bg-linear-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md border border-white/10 rounded-2xl p-5 relative shadow-2xl mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
              <div className="lg:col-span-5">
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
