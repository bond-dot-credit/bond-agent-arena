import Header from '../components/Header';
import AgentCarousel from '../components/AgentCarousel';
import CryptoGrid from '../components/CryptoGrid';
import Footer from '../components/Footer';
import { getAllAgents } from '@/lib/services/agentService';

const SEASON_KPIS = [
  { label: 'Total Volume',  value: '$761,806', sub: '107 days',   color: 'var(--lime)'  },
  { label: 'Total Yield',   value: '$295.75',  sub: 'Season 0',   color: 'var(--green)' },
  { label: 'Capital APY',   value: '10.45%',   sub: 'blended',    color: 'var(--lime)'  },
  { label: 'Native APY',    value: '6.49%',    sub: 'ex-rewards', color: 'var(--green)' },
  { label: 'Risk-Adj APY',  value: '8.47%',    sub: '0.5× weight',color: 'var(--amber)' },
];

export default async function LeaderboardPage() {
  const agents = await getAllAgents();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AgentCarousel />

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="wt-container py-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="stag">Agentic Alpha · Season 0</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.1, marginBottom: '6px' }}>
            Agent <span style={{ color: 'var(--lime)' }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--s2)' }}>
            Risk-adjusted performance rankings for autonomous yield agents — Nov 2024 to Feb 2025
          </p>
        </div>
      </div>

      {/* KPI bar */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wt-container">
          <div className="kpi-grid">
            {SEASON_KPIS.map(k => (
              <div key={k.label} style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={{ color: k.color, fontSize: '1.25rem' }}>{k.value}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--s2)', marginTop: '2px' }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="wt-container py-6" style={{ flex: 1 }}>
        <CryptoGrid agents={agents} />
      </div>

      <Footer />
    </div>
  );
}
