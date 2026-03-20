'use client';

import { useState, useEffect, useRef } from 'react';
import AgentCarousel from './components/AgentCarousel';
import ChartWithData from './components/ChartWithData';
import InfoTabs from './components/InfoTabs';
import Footer from './components/Footer';
import { Agent } from '@/lib/types';
import { getAllAgents } from '@/lib/services/agentService';

const SEASON_KPIS = [
  { label: 'Total Volume',  value: '$761,806', sub: '107 days',  color: 'var(--lime)' },
  { label: 'Total Yield',   value: '$295.75',  sub: 'Genesis',   color: 'var(--green)' },
  { label: 'Capital APY',   value: '10.45%',   sub: 'blended',   color: 'var(--lime)' },
  { label: 'Native APY',    value: '6.49%',    sub: 'ex-rewards', color: 'var(--green)' },
  { label: 'Risk-Adj APY',  value: '8.47%',    sub: '0.5× reward', color: 'var(--amber)' },
];

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'aua' | 'apy'>('aua');
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    getAllAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <AgentCarousel />

      <main style={{ flex: 1 }}>
        {/* Hero / Status bar */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="wt-container py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="chip">
                  <span className="chip-dot" />
                  Genesis Complete
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--s2)' }}>
                  Nov 5, 2025 – Feb 19, 2026
                </span>
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

        {/* Portfolio KPI bar */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
          <div className="wt-container">
            <div className="kpi-grid">
              {SEASON_KPIS.map((k) => (
                <div key={k.label} style={{
                  background: 'var(--card)',
                  padding: '22px 24px',
                  transition: 'background 0.15s',
                }}>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--s2)', marginTop: '6px', lineHeight: 1.5 }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="wt-container py-6" style={{ marginBottom: '40px', marginTop: '8px' }}>
          <div className="page-grid">
            {/* Chart panel */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-3">
                  <div ref={dropRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setDropOpen(o => !o)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'var(--card2)', border: '1px solid var(--border2)',
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                        fontSize: '0.6875rem', fontWeight: 700, color: 'var(--white)',
                        letterSpacing: '0.06em', fontFamily: 'inherit', textTransform: 'uppercase',
                      }}
                    >
                      {chartType === 'aua' ? 'Total Account Value' : 'Daily APY'}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {dropOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
                        background: 'var(--card)', border: '1px solid var(--border2)',
                        borderRadius: 8, overflow: 'hidden', minWidth: 210,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      }}>
                        {([
                          { value: 'aua' as const, label: 'Total Account Value', sub: 'AUA per agent over time' },
                          { value: 'apy' as const, label: 'Daily APY',           sub: 'Annual yield rate by agent' },
                        ]).map(({ value, label, sub }, i, arr) => (
                          <button
                            key={value}
                            onClick={() => { setChartType(value); setDropOpen(false); }}
                            style={{
                              display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left',
                              padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--card2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: chartType === value ? 'var(--lime)' : 'var(--white)' }}>{label}</span>
                            <span style={{ fontSize: '0.625rem', color: 'var(--s2)', marginTop: 2 }}>{sub}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 8px var(--green)' }} />
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--s2)' }}>AUA · Genesis</span>
              </div>
              <div style={{ padding: '20px' }}>
                {isLoading ? (
                  <div style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <ChartWithData agents={agents} chartType={chartType} />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar" style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
              <InfoTabs agents={agents} />
            </div>
          </div>

          {/* Bottom metrics strip */}
          <div className="bottom-strip">
            {[
              { label: 'Avg Daily Volume',        value: '$7,120' },
              { label: 'Avg Daily Yield',         value: '$2.76' },
              { label: 'Avg Transactions / Day',  value: '5.33' },
              { label: 'Avg Yield / Transaction', value: '$0.519' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--card)', padding: '12px 16px' }}>
                <div className="kpi-label">{m.label}</div>
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
