'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import AgentCarousel from './components/AgentCarousel';
import ChartWithData from './components/ChartWithData';
import Footer from './components/Footer';
import { Agent } from '@/lib/types';
import { getAllAgents } from '@/lib/services/agentService';

const SEASON_KPIS = [
  { label: 'Total Volume',  value: '$761,806', sub: '107 days',    color: 'var(--lime)'  },
  { label: 'Total Yield',   value: '$295.75',  sub: 'Season 0',    color: 'var(--green)' },
  { label: 'Capital APY',   value: '10.45%',   sub: 'blended',     color: 'var(--lime)'  },
  { label: 'Native APY',    value: '6.49%',    sub: 'ex-rewards',  color: 'var(--green)' },
  { label: 'Risk-Adj APY',  value: '8.47%',    sub: '0.5× weight', color: 'var(--amber)' },
];

const AGENT_CARDS = [
  { name: 'Sail.Money', rank: 1, color: '#3b82f6', grade: 'A+', gradeClass: 'grade-ap', bondScore: 91, capitalApy: '6.41%',  signal: 'safe',    perf: 78, risk: 94, stab: 92 },
  { name: 'ZyFAI',      rank: 2, color: '#a855f7', grade: 'A',  gradeClass: 'grade-a',  bondScore: 85, capitalApy: '10.17%', signal: 'safe',    perf: 88, risk: 88, stab: 76 },
  { name: 'Giza',       rank: 3, color: '#ccff00', grade: 'A',  gradeClass: 'grade-a',  bondScore: 82, capitalApy: '14.30%', signal: 'caution', perf: 85, risk: 72, stab: 80 },
  { name: 'Surf',       rank: 4, color: '#f97316', grade: 'B+', gradeClass: 'grade-bp', bondScore: 72, capitalApy: '16.49%', signal: 'caution', perf: 90, risk: 58, stab: 68 },
  { name: 'Mamo',       rank: 5, color: '#22c55e', grade: 'B',  gradeClass: 'grade-b',  bondScore: 67, capitalApy: '5.21%',  signal: 'caution', perf: 62, risk: 70, stab: 64 },
];

const BOTTOM_METRICS = [
  { label: 'Avg Daily Volume',        value: '$7,120',  icon: '📊' },
  { label: 'Avg Daily Yield',          value: '$2.76',   icon: '💰' },
  { label: 'Avg Transactions / Day',   value: '5.33',    icon: '⚡' },
  { label: 'Avg Yield / Transaction',  value: '$0.519',  icon: '📈' },
];

const SIG = {
  safe:    { color: 'var(--green)', label: '✓ Safe'    },
  caution: { color: 'var(--amber)', label: '⚠ Caution' },
  risk:    { color: 'var(--red)',   label: '✕ Risk'    },
} as Record<string, { color: string; label: string }>;

function AgentCard({ meta, liveAua, isTop }: {
  meta: typeof AGENT_CARDS[0];
  liveAua?: number;
  isTop: boolean;
}) {
  const sig = SIG[meta.signal];
  return (
    <div style={{
      background: 'var(--card2)',
      border: `1px solid ${isTop ? meta.color + '50' : 'var(--border)'}`,
      borderTop: `2px solid ${isTop ? meta.color : 'var(--border2)'}`,
      borderRadius: '8px',
      padding: '16px',
      flex: '1 1 175px',
      minWidth: '155px',
      maxWidth: '220px',
      boxShadow: isTop ? `0 0 24px ${meta.color}10` : 'none',
    }}>
      {/* Rank + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '20px', height: '20px', borderRadius: '50%',
          border: `1px solid ${isTop ? meta.color : 'var(--border2)'}`,
          fontSize: '0.625rem', fontWeight: 700,
          color: isTop ? meta.color : 'var(--s2)',
          fontFamily: 'var(--mono)', flexShrink: 0,
        }}>
          {meta.rank}
        </span>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: meta.color, flexShrink: 0,
          boxShadow: isTop ? `0 0 6px ${meta.color}` : 'none',
        }} />
        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {meta.name}
        </span>
        <span className={`grade ${meta.gradeClass}`} style={{ flexShrink: 0 }}>{meta.grade}</span>
      </div>

      {/* Bond Score — hero number */}
      <div style={{ marginBottom: '14px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.25rem', fontFamily: 'var(--mono)', fontWeight: 800, color: meta.color, lineHeight: 1 }}>
          {meta.bondScore}
        </div>
        <div style={{ fontSize: '0.5rem', color: 'var(--s2)', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: '3px' }}>
          Bond Score
        </div>
      </div>

      {/* PERF / RISK / STAB bars */}
      <div style={{ marginBottom: '12px' }}>
        {([
          { l: 'PERF', v: meta.perf },
          { l: 'RISK', v: meta.risk },
          { l: 'STAB', v: meta.stab },
        ] as { l: string; v: number }[]).map(d => (
          <div key={d.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '28px', fontSize: '0.5rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.04em' }}>{d.l}</span>
            <div style={{ flex: 1, height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${d.v}%`, background: meta.color, borderRadius: '1px' }} />
            </div>
            <span style={{ width: '20px', textAlign: 'right', fontSize: '0.5625rem', fontFamily: 'var(--mono)', color: 'var(--s1)' }}>{d.v}</span>
          </div>
        ))}
      </div>

      {/* Footer: APY + signal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--lime)' }}>
          {meta.capitalApy}
        </span>
        <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: sig.color }}>{sig.label}</span>
      </div>

      {/* Live AUA if available */}
      {liveAua != null && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.5rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AUA</span>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--mono)', fontWeight: 700, color: meta.color }}>
            ${liveAua.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AgentCarousel />

      <main style={{ flex: 1 }}>
        {/* Status bar */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="wt-container py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="chip">
                  <span className="chip-dot" />
                  Season 0 Complete
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--s2)' }}>Nov 5, 2024 – Feb 19, 2025</span>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: '0.6875rem', color: 'var(--s2)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  AGENTS: <span style={{ color: 'var(--white)', fontFamily: 'var(--mono)' }}>5</span>
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--s2)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  CAPITAL: <span style={{ color: 'var(--white)', fontFamily: 'var(--mono)' }}>$10,000</span>
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--s2)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  NEXT SEASON: <span style={{ color: 'var(--lime)', fontFamily: 'var(--mono)' }}>TBA</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI strip */}
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

        <div className="wt-container py-5">

          {/* Hero chart — full width */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--s2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Agent Account Value
                </span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 8px var(--green)' }} />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--s2)', fontFamily: 'var(--mono)' }}>AUA · Season 0</span>
            </div>
            <div style={{ padding: '12px' }}>
              {isLoading ? (
                <div style={{ height: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '2px solid var(--border)', borderTopColor: 'var(--lime)',
                      animation: 'spin 1s linear infinite', margin: '0 auto 8px',
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--s2)' }}>Loading agents…</span>
                  </div>
                </div>
              ) : (
                <ChartWithData agents={agents} />
              )}
            </div>
          </div>

          {/* Agent ranking cards */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--s2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Agent Rankings
              </span>
              <span style={{ fontSize: '0.625rem', color: 'var(--s2)' }}>Season 0 · ranked by Bond Score</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {AGENT_CARDS.map(meta => {
                const live = agents.find(a => a.agent === meta.name);
                return (
                  <AgentCard
                    key={meta.name}
                    meta={meta}
                    liveAua={live?.aua}
                    isTop={meta.rank === 1}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom metrics strip */}
          <div className="bottom-strip">
            {BOTTOM_METRICS.map(m => (
              <div key={m.label} style={{ background: 'var(--card)', padding: '12px 16px' }}>
                <div className="kpi-label">{m.icon} {m.label}</div>
                <div style={{ fontSize: '1.125rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--white)', lineHeight: 1, marginTop: '4px' }}>{m.value}</div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
