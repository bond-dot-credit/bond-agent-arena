import { getAllAgents } from '@/lib/services/agentService';
import AgentsClient from '../components/AgentsClient';
import Header from '../components/Header';
import AgentCarousel from '../components/AgentCarousel';
import { Component as EtheralShadow } from '../components/ui/etheral-shadow';

export default async function AgentsPage() {
  const agents = await getAllAgents();

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
          {/* Token Prices */}
          <AgentCarousel />

          {/* Agents Content */}
          <AgentsClient agents={agents} />
        </div>
      </div>
    </div>
  );
}
