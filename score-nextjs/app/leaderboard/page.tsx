import Header from '../components/Header';
import AgentCarousel from '../components/AgentCarousel';
import CryptoGrid from '../components/CryptoGrid';
import Footer from '../components/Footer';
import { getAllAgents } from '@/lib/services/agentService';

export default async function LeaderboardPage() {
  const agents = await getAllAgents();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AgentCarousel />

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="wt-container py-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="stag">Agentic Alpha</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.1, marginBottom: '6px' }}>
            Agent <span style={{ color: 'var(--lime)' }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--s2)' }}>
            Live performance rankings of autonomous yield agents — Genesis
          </p>
        </div>
      </div>

      <div className="wt-container py-6" style={{ flex: 1, marginBottom: '40px' }}>
        <CryptoGrid agents={agents} />
      </div>

      <Footer />
    </div>
  );
}
