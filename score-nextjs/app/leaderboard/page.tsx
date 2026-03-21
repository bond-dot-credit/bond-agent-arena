import type { Metadata } from 'next';
import AgentCarousel from '../components/AgentCarousel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leaderboard — Agentic Alpha | bond.credit',
  description: 'Live performance rankings of autonomous yield agents. Bond Scores, credit capacities, and risk metrics from Genesis.',
};
import Footer from '../components/Footer';
import SeasonSwitcher from '../components/SeasonSwitcher';
import { getAllAgents } from '@/lib/services/agentService';

export default async function LeaderboardPage() {
  const agents = await getAllAgents();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <AgentCarousel />

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="wt-container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="stag">Agentic Alpha</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.1, marginBottom: '8px' }}>
            Agent <span style={{ color: 'var(--lime)' }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--s2)' }}>
            Live performance rankings of autonomous yield agents — Genesis
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '56px 20px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        <SeasonSwitcher agents={agents} />
      </div>

      <Footer />
    </div>
  );
}
