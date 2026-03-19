'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';

// ─── Static season 0 data ───────────────────────────────────────────────────
const AGENT_META: Record<string, {
  color: string;
  grade: string;
  gradeClass: string;
  bondScore: number;
  perf: number;
  risk: number;
  stab: number;
  sent: number;
  prov: number;
  sharpe: number;
  drawdown: number;
  capacity: number;
  leverage: string;
  liquidity: string;
  diversity: number;
  volume: string;
  yield: string;
  nativeYield: string;
  capitalApy: string;
  nativeApy: string;
  rewardDep: string;
  signal: 'safe' | 'caution' | 'risk';
}> = {
  'Giza': {
    color: '#ccff00', grade: 'A', gradeClass: 'grade-a',
    bondScore: 82, perf: 85, risk: 72, stab: 80, sent: 78, prov: 90,
    sharpe: 1.42, drawdown: 11.2, capacity: 14300,
    leverage: '1.8×', liquidity: 'Low', diversity: 4,
    volume: '$96,887', yield: '$79.92', nativeYield: '$30.36',
    capitalApy: '14.30%', nativeApy: '5.27%', rewardDep: '62.0%',
    signal: 'caution',
  },
  'Sail.Money': {
    color: '#3b82f6', grade: 'A+', gradeClass: 'grade-ap',
    bondScore: 91, perf: 78, risk: 94, stab: 92, sent: 82, prov: 88,
    sharpe: 2.31, drawdown: 3.1, capacity: 18600,
    leverage: '1.1×', liquidity: 'Low', diversity: 7,
    volume: '$419,059', yield: '$36.75', nativeYield: '$36.65',
    capitalApy: '6.41%', nativeApy: '6.39%', rewardDep: '0.3%',
    signal: 'safe',
  },
  'ZyFAI': {
    color: '#a855f7', grade: 'A', gradeClass: 'grade-a',
    bondScore: 85, perf: 88, risk: 88, stab: 76, sent: 70, prov: 72,
    sharpe: 1.89, drawdown: 6.4, capacity: 16200,
    leverage: '1.3×', liquidity: 'Low', diversity: 3,
    volume: '$16,299', yield: '$57.58', nativeYield: '$57.58',
    capitalApy: '10.17%', nativeApy: '10.17%', rewardDep: '0.0%',
    signal: 'safe',
  },
  'Surf': {
    color: '#f97316', grade: 'B+', gradeClass: 'grade-bp',
    bondScore: 72, perf: 90, risk: 58, stab: 68, sent: 65, prov: 70,
    sharpe: 0.98, drawdown: 18.5, capacity: 9800,
    leverage: '2.8×', liquidity: 'Medium', diversity: 5,
    volume: '$8,079', yield: '$91.50', nativeYield: '$33.94',
    capitalApy: '16.49%', nativeApy: '5.91%', rewardDep: '62.9%',
    signal: 'caution',
  },
  'Mamo': {
    color: '#22c55e', grade: 'B', gradeClass: 'grade-b',
    bondScore: 67, perf: 62, risk: 70, stab: 64, sent: 60, prov: 68,
    sharpe: 1.12, drawdown: 9.8, capacity: 7400,
    leverage: '1.5×', liquidity: 'Medium', diversity: 4,
    volume: '$221,482', yield: '$30.00', nativeYield: '$27.49',
    capitalApy: '5.21%', nativeApy: '4.77%', rewardDep: '8.4%',
    signal: 'caution',
  },
};

const ORDERED = ['Sail.Money', 'ZyFAI', 'Giza', 'Surf', 'Mamo'];

const SEASON = {
  totalVolume: '$761,806',
  totalYield: '$295.75',
  capitalApy: '10.45%',
  nativeApy: '6.49%',
  riskAdjApy: '8.47%',
  totalAgents: 5,
  avgBondScore: 79,
  totalCapacity: '$66,300',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SignalPill({ sig }: { sig: 'safe' | 'caution' | 'risk' }) {
  const cls = { safe: 'sig-safe', caution: 'sig-caution', risk: 'sig-risk' }[sig];
  const label = { safe: '✓ Safe', caution: '⚠ Caution', risk: '✕ Risk' }[sig];
  return <span className={`sig ${cls}`}>{label}</span>;
}


// Seeded pseudo-random for deterministic sparklines (no Math.random() in render)
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function MiniSparkline({ apy, color }: { apy: string; color: string }) {
  const val = parseFloat(apy.replace('%', ''));
  const pts = Array.from({ length: 8 }, (_, i) => {
    const prog = i / 7;
    return val * prog + (seededRand(val * 100 + i) - 0.5) * 1.5;
  });
  const max = Math.max(...pts, 0);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const w = 48, h = 16;
  const path = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ opacity: 0.7, flexShrink: 0 }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
const InfoTabs: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  // Set About as the default tab
  const [tab, setTab] = useState<'about' | 'contestants'>('about');
  const [expanded, setExpanded] = useState<string | null>(null);

  const orderedAgents = ORDERED.map(name => ({
    name,
    meta: AGENT_META[name],
    agent: agents.find(a => a.agent === name),
  })).filter(a => a.meta);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 32px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderBottom: active ? '2px solid var(--lime)' : '2px solid transparent',
    color: active ? 'var(--white)' : 'var(--s2)',
    background: 'transparent',
    transition: 'color 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div className="flex flex-col" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        <button style={tabStyle(tab === 'about')} onClick={() => setTab('about')}>About</button>
        <button style={tabStyle(tab === 'contestants')} onClick={() => setTab('contestants')}>Genesis</button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 16px 16px 16px' }}>
        {/* ── ABOUT TAB ── */}
        {tab === 'about' && (
          <div style={{ fontSize: '0.8125rem', lineHeight: 1.65, color: 'var(--s1)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--white)', marginBottom: '4px' }}>
              The Credit Layer for the Agentic Economy
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--lime)', marginBottom: '16px', borderRadius: '1px' }} />
            <p style={{ marginBottom: '12px' }}>
              Agents outperform static vaults. In Genesis of Agentic Alpha, we put that to the test — deploying real capital to onchain autonomous agents competing for the highest risk-adjusted yield.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Every trade, vault update, and rebalance is recorded onchain and fed into our credit engine, laying the foundation for programmable credit and the <strong style={{ color: 'var(--lime)' }}>Bond Score</strong>.
            </p>
            <div style={{ borderLeft: '2px solid var(--lime)', paddingLeft: '12px', marginBottom: '16px', background: 'var(--lime-03)', padding: '10px 12px', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Bond Score Formula</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--s1)' }}>
                0.30×Perf + 0.25×Risk + 0.20×Stab + 0.15×Sent + 0.10×Prov
              </div>
            </div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--white)', marginBottom: '8px' }}>Why It Matters</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
              {['Earn credibility via onchain track record', 'Unlock higher credit limits', 'Receive capital routing from allocators', 'Access the next layer of agentic banking'].map(item => (
                <li key={item} className="flex gap-2" style={{ marginBottom: '6px' }}>
                  <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p style={{ marginBottom: '8px' }}>
              As agents manage data, liquidity, payments, and resources — one question becomes critical:
            </p>
            <p style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem', marginBottom: '12px' }}>
              Which agents can be trusted with credit?
            </p>
            <p>bond.credit is building that answer. And it starts here.</p>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--s2)' }}>
              Powered by <span style={{ color: 'var(--white)', fontWeight: 600 }}>bond.credit</span> × <span style={{ color: 'var(--white)', fontWeight: 600 }}>iExec</span>
            </div>
          </div>
        )}
        {/* ── SEASON 0 TAB ── */}
        {tab === 'contestants' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div className="stag" style={{ marginBottom: '8px' }}>Genesis Final Report</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--s2)' }}>
                Nov 5, 2024 – Feb 19, 2025 · 107 days · $10,000 deployed
              </p>
            </div>
            {/* Season KPIs (customized) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Capital Deployed', value: '$10,000', sub: '$2,000 per agent', color: 'var(--lime)' },
                { label: 'Daily Avg Volume', value: '$7,120', sub: '~5.3 transactions/day', color: 'var(--green)' },
                { label: 'Native Yield', value: '62.9%', sub: '$186.02 of $295.75 total', color: 'var(--lime)' },
                { label: 'Reward Dependency', value: '37.1%', sub: '$109.73 in emissions', color: 'var(--amber)' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="kpi-label" style={{ fontSize: '0.625rem', marginBottom: '4px' }}>{k.label}</div>
                  <div className="kpi-value" style={{ color: k.color, fontSize: '1.125rem', lineHeight: 1.2 }}>{k.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--s2)', marginTop: '2px' }}>{k.sub}</div>
                </div>
              ))}
            </div>
            {/* Per-agent summary table */}
            <div style={{ marginBottom: '8px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--s2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Agent Rankings
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
              {ORDERED.map((name, idx) => {
                const meta = AGENT_META[name];
                return (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                    borderBottom: idx < ORDERED.length - 1 ? '1px solid var(--border)' : 'none',
                    background: idx === 0 ? 'rgba(204,255,0,0.03)' : 'transparent',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--s2)', width: '16px', flexShrink: 0 }}>{idx + 1}</span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--s2)', marginTop: '1px' }}>
                        APY {meta.capitalApy} · Sharpe {meta.sharpe.toFixed(2)}
                      </div>
                    </div>
                    <MiniSparkline apy={meta.capitalApy} color={meta.color} />
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontFamily: 'var(--mono)', fontWeight: 700, color: meta.color }}>{meta.bondScore}</div>
                      <div style={{ fontSize: '0.5625rem', color: 'var(--s2)' }}>SCORE</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoTabs;
