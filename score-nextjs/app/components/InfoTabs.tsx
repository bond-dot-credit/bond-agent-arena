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
  const [tab, setTab] = useState<'leaderboard' | 'about' | 'contestants'>('leaderboard');
  const [expanded, setExpanded] = useState<string | null>(null);

  const orderedAgents = ORDERED.map(name => ({
    name,
    meta: AGENT_META[name],
    agent: agents.find(a => a.agent === name),
  })).filter(a => a.meta);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
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
    <div className="flex flex-col h-full" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)', padding: '0 8px', gap: '20px' }}>
        <button style={tabStyle(tab === 'leaderboard')} onClick={() => setTab('leaderboard')}>Board</button>
        <button style={tabStyle(tab === 'about')} onClick={() => setTab('about')}>About</button>
        <button style={tabStyle(tab === 'contestants')} onClick={() => setTab('contestants')}>Genesis</button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 16px 16px 16px' }}>

        {/* ── LEADERBOARD TAB ── */}
        {tab === 'leaderboard' && (
          <div>
            {/* Portfolio KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Yield', value: SEASON.totalYield, color: 'var(--green)' },
                { label: 'Capital APY', value: SEASON.capitalApy, color: 'var(--lime)' },
                { label: 'Native APY', value: SEASON.nativeApy, color: 'var(--green)' },
                { label: 'Avg Bond Score', value: SEASON.avgBondScore, color: 'var(--lime)' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
                  <div className="kpi-label" style={{ fontSize: '0.625rem', marginBottom: '4px' }}>{k.label}</div>
                  <div className="kpi-value" style={{ color: k.color, fontSize: '1.25rem', lineHeight: 1.2 }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Agent rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderedAgents.map(({ name, meta }, idx) => (
                <div key={name}>
                  <button
                    onClick={() => setExpanded(expanded === name ? null : name)}
                    style={{
                      width: '100%', background: 'var(--card2)', border: '1px solid var(--border)',
                      borderRadius: '6px', padding: '16px', cursor: 'pointer',
                      borderLeft: `3px solid ${meta.color}`,
                      minHeight: '140px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#222222')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--card2)')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1rem', color: 'var(--s2)', fontWeight: 700, width: '20px', lineHeight: 1 }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--white)' }}>{name}</span>
                        <span className={`grade ${meta.gradeClass}`}>{meta.grade}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.75rem', fontFamily: 'var(--mono)', fontWeight: 700, color: meta.color, lineHeight: 1 }}>
                            {meta.bondScore}
                          </div>
                          <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, letterSpacing: '0.04em' }}>BOND SCORE</div>
                        </div>
                        <span style={{ color: 'var(--s2)', fontSize: '0.75rem', transform: expanded === name ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
                      </div>
                    </div>

                    {/* Mini dimension bars */}
                    <div style={{ marginTop: '8px' }}>
                      {[
                        { l: 'PERF', v: meta.perf  },
                        { l: 'RISK', v: meta.risk  },
                        { l: 'STAB', v: meta.stab  },
                      ].map(d => (
                        <div key={d.l} className="flex items-center gap-2" style={{ marginBottom: '4px', height: '24px' }}>
                          <span style={{ width: '35px', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--s2)' }}>{d.l}</span>
                          <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden', margin: '0 6px' }}>
                            <div style={{ height: '100%', width: `${d.v}%`, background: meta.color, borderRadius: '1px', transition: 'width 1s ease' }} />
                          </div>
                          <span style={{ width: '20px', textAlign: 'right', fontSize: '0.6875rem', fontFamily: 'var(--mono)', color: 'var(--white)', fontWeight: 700 }}>{d.v}</span>
                        </div>
                      ))}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded === name && (
                    <div style={{
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      borderTop: 'none', borderRadius: '0 0 6px 6px',
                      borderLeft: `3px solid ${meta.color}`,
                      padding: '16px',
                    }}>
                      {/* Dimension bars full */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Bond Score Breakdown
                        </div>
                        {[
                          { l: 'PERF', v: meta.perf,  w: '30%' },
                          { l: 'RISK', v: meta.risk,  w: '25%' },
                          { l: 'STAB', v: meta.stab,  w: '20%' },
                          { l: 'SENT', v: meta.sent,  w: '15%' },
                          { l: 'PROV', v: meta.prov,  w: '10%' },
                        ].map(d => (
                          <div key={d.l} className="flex items-center gap-2" style={{ marginBottom: '5px' }}>
                            <span style={{ width: '32px', fontSize: '0.625rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.04em' }}>{d.l}</span>
                            <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${d.v}%`, background: meta.color, borderRadius: '2px' }} />
                            </div>
                            <span style={{ width: '22px', textAlign: 'right', fontSize: '0.6875rem', fontFamily: 'var(--mono)', color: 'var(--s1)', fontWeight: 600 }}>{d.v}</span>
                            <span style={{ width: '28px', textAlign: 'right', fontSize: '0.5625rem', color: 'var(--s2)' }}>{d.w}</span>
                          </div>
                        ))}
                      </div>

                      {/* Risk metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                        {[
                          { label: 'Sharpe',   value: meta.sharpe.toFixed(2) },
                          { label: 'Drawdown', value: `-${meta.drawdown}%`   },
                          { label: 'Leverage', value: meta.leverage           },
                          { label: 'Liquidity', value: meta.liquidity         },
                          { label: 'Diversity', value: `${meta.diversity} protocols` },
                          { label: 'Capacity', value: `$${(meta.capacity/1000).toFixed(1)}k` },
                        ].map(m => (
                          <div key={m.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 8px' }}>
                            <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{m.label}</div>
                            <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--white)' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Yield breakdown */}
                      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Genesis Performance</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                          {[
                            { l: 'Volume',      v: meta.volume     },
                            { l: 'Total Yield', v: meta.yield      },
                            { l: 'Capital APY', v: meta.capitalApy, color: 'var(--lime)' },
                            { l: 'Native APY',  v: meta.nativeApy, color: 'var(--green)' },
                            { l: 'Reward Dep.', v: meta.rewardDep, color: parseFloat(meta.rewardDep) > 30 ? 'var(--amber)' : 'var(--green)' },
                          ].map(m => (
                            <div key={m.l} className="flex justify-between items-center" style={{ fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--s2)' }}>{m.l}</span>
                              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: (m as { l: string; v: string; color?: string }).color || 'var(--white)' }}>{m.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <SignalPill sig={meta.signal} />
                        <span style={{ fontSize: '0.625rem', color: 'var(--s2)' }}>Genesis · 107 days</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
              Powered by <span style={{ color: 'var(--white)', fontWeight: 600 }}>bond.credit</span> × <span style={{ color: 'var(--white)', fontWeight: 600 }}>iExec</span> × <span style={{ color: 'var(--white)', fontWeight: 600 }}>EigenCloud</span>
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

            {/* Season KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Total Volume',   value: SEASON.totalVolume,  color: 'var(--lime)' },
                { label: 'Total Yield',    value: SEASON.totalYield,   color: 'var(--green)' },
                { label: 'Capital APY',    value: SEASON.capitalApy,   color: 'var(--lime)' },
                { label: 'Native APY',     value: SEASON.nativeApy,    color: 'var(--green)' },
                { label: 'Risk-Adj APY',   value: SEASON.riskAdjApy,   color: 'var(--amber)' },
                { label: 'Agents',         value: `${SEASON.totalAgents}`, color: 'var(--white)' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                  <div className="kpi-label" style={{ fontSize: '0.625rem', marginBottom: '4px' }}>{k.label}</div>
                  <div className="kpi-value" style={{ color: k.color, fontSize: '1.125rem', lineHeight: 1.2 }}>{k.value}</div>
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
                        <span className={`grade ${meta.gradeClass}`}>{meta.grade}</span>
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
