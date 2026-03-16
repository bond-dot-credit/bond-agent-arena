'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import { useWallet } from '../../hooks/useWallet';

const AGENT_META: Record<string, {
  color: string; grade: string; gradeClass: string; bondScore: number;
  perf: number; risk: number; stab: number; sent: number; prov: number;
  sharpe: number; drawdown: number; capacity: number;
  capitalApy: string; nativeApy: string; rewardDep: string;
  volume: string; totalYield: string; signal: string;
}> = {
  'Sail.Money': { color: '#3b82f6', grade: 'A+', gradeClass: 'grade-ap', bondScore: 91, perf: 78, risk: 94, stab: 92, sent: 82, prov: 88, sharpe: 2.31, drawdown: 3.1,  capacity: 18600, capitalApy: '6.41%',  nativeApy: '6.39%',  rewardDep: '0.3%',  volume: '$419,059', totalYield: '$36.75',  signal: 'safe'    },
  'ZyFAI':      { color: '#a855f7', grade: 'A',  gradeClass: 'grade-a',  bondScore: 85, perf: 88, risk: 88, stab: 76, sent: 70, prov: 72, sharpe: 1.89, drawdown: 6.4,  capacity: 16200, capitalApy: '10.17%', nativeApy: '10.17%', rewardDep: '0.0%',  volume: '$16,299',  totalYield: '$57.58',  signal: 'safe'    },
  'Giza':       { color: '#ccff00', grade: 'A',  gradeClass: 'grade-a',  bondScore: 82, perf: 85, risk: 72, stab: 80, sent: 78, prov: 90, sharpe: 1.42, drawdown: 11.2, capacity: 14300, capitalApy: '14.30%', nativeApy: '5.27%',  rewardDep: '62.0%', volume: '$96,887',  totalYield: '$79.92',  signal: 'caution' },
  'Surf':       { color: '#f97316', grade: 'B+', gradeClass: 'grade-bp', bondScore: 72, perf: 90, risk: 58, stab: 68, sent: 65, prov: 70, sharpe: 0.98, drawdown: 18.5, capacity: 9800,  capitalApy: '16.49%', nativeApy: '5.91%',  rewardDep: '62.9%', volume: '$8,079',   totalYield: '$91.50',  signal: 'caution' },
  'Mamo':       { color: '#22c55e', grade: 'B',  gradeClass: 'grade-b',  bondScore: 67, perf: 62, risk: 70, stab: 64, sent: 60, prov: 68, sharpe: 1.12, drawdown: 9.8,  capacity: 7400,  capitalApy: '5.21%',  nativeApy: '4.77%',  rewardDep: '8.4%',  volume: '$221,482', totalYield: '$30.00',  signal: 'caution' },
};

const SIG_MAP = {
  safe:    { cls: 'sig-safe',    label: '✓ Safe'    },
  caution: { cls: 'sig-caution', label: '⚠ Caution' },
  risk:    { cls: 'sig-risk',    label: '✕ Risk'    },
} as Record<string, { cls: string; label: string }>;

const SignalPill = ({ sig }: { sig: string }) => {
  const { cls, label } = SIG_MAP[sig] || SIG_MAP.caution;
  return <span className={`sig ${cls}`}>{label}</span>;
};

const DimBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px' }} />
  </div>
);

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </span>
      {show && (
        <div style={{
          position: 'absolute', zIndex: 50, width: '220px', padding: '10px 12px',
          background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--s1)', lineHeight: 1.5,
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

const ExpandedRow: React.FC<{ agent: Agent; meta: typeof AGENT_META[string] }> = ({ agent, meta }) => {
  const { authenticated, connect: login } = useWallet();
  return (
    <tr>
      <td colSpan={9} style={{ padding: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '16px 20px', borderLeft: `3px solid ${meta.color}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>

            {/* Bond Score */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Bond Score Breakdown</div>
              {[
                { l: 'PERF', v: meta.perf,  w: '30%' },
                { l: 'RISK', v: meta.risk,  w: '25%' },
                { l: 'STAB', v: meta.stab,  w: '20%' },
                { l: 'SENT', v: meta.sent,  w: '15%' },
                { l: 'PROV', v: meta.prov,  w: '10%' },
              ].map(d => (
                <div key={d.l} className="flex items-center gap-2" style={{ marginBottom: '7px' }}>
                  <span style={{ width: '32px', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.04em' }}>{d.l}</span>
                  <DimBar value={d.v} color={meta.color} />
                  <span style={{ width: '22px', textAlign: 'right', fontSize: '0.6875rem', fontFamily: 'var(--mono)', color: 'var(--s1)', fontWeight: 600 }}>{d.v}</span>
                  <span style={{ width: '28px', textAlign: 'right', fontSize: '0.5625rem', color: 'var(--s2)' }}>{d.w}</span>
                </div>
              ))}
            </div>

            {/* Risk & Season Data */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Risk & Season 0</div>
              {[
                { l: 'Sharpe',       v: meta.sharpe.toFixed(2) },
                { l: 'Max Drawdown', v: `-${meta.drawdown}%`,    warn: meta.drawdown > 12 },
                { l: 'Reward Dep.',  v: meta.rewardDep,          warn: parseFloat(meta.rewardDep) > 30 },
                { l: 'Volume',       v: meta.volume },
                { l: 'Total Yield',  v: meta.totalYield,          good: true },
                { l: 'Capacity',     v: `$${(meta.capacity / 1000).toFixed(1)}k` },
              ].map(m => (
                <div key={m.l} className="flex justify-between items-center" style={{ marginBottom: '6px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--s2)' }}>{m.l}</span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontWeight: 600,
                    color: (m as any).good ? 'var(--green)' : (m as any).warn ? 'var(--amber)' : 'var(--white)',
                  }}>{m.v}</span>
                </div>
              ))}
              <div style={{ marginTop: '10px' }}>
                <SignalPill sig={meta.signal} />
              </div>
            </div>

            {/* TEE Verify */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Verify Bond Score</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--s2)', marginBottom: '12px', lineHeight: 1.55 }}>
                Run a confidential TEE computation via iExec to verify this agent's score on-chain.
              </p>
              <div style={{ padding: '8px 10px', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', marginBottom: '2px' }}>Requires</div>
                <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--white)' }}>0.1 RLC + gas</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', marginTop: '2px' }}>Arbitrum One</div>
              </div>
              {authenticated ? (
                <button className="btn-outline-lime" style={{ width: '100%', fontSize: '0.6875rem', padding: '8px 12px' }}>
                  Run TEE Verification
                </button>
              ) : (
                <button onClick={login} className="btn-lime" style={{ width: '100%', fontSize: '0.6875rem', padding: '8px 12px' }}>
                  Connect to Verify
                </button>
              )}
              <div style={{ marginTop: '10px', fontSize: '0.5625rem', color: 'var(--s2)', textAlign: 'center', letterSpacing: '0.05em' }}>
                POWERED BY IEXEC TEE · ARBITRUM ONE
              </div>
            </div>

          </div>
        </div>
      </td>
    </tr>
  );
};

const CryptoGrid: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const fmt = (v?: number) => v != null ? `$${v.toFixed(2)}` : '—';

  const COLS = [
    { key: 'rank',       label: '#',           tip: null },
    { key: 'agent',      label: 'Agent',       tip: null },
    { key: 'aua',        label: 'AUA',         tip: 'Assets Under Agent — total balance managed by the agent including rewards' },
    { key: 'aum',        label: 'AUM',         tip: 'Assets Under Management — native USDC balance only' },
    { key: 'yield',      label: 'Native Yield', tip: 'Organic yield generated without token incentives' },
    { key: 'rewards',    label: 'Rewards',     tip: 'Token incentives received during Season 0' },
    { key: 'capitalApy', label: 'Capital APY', tip: 'Total return including rewards, annualised over Season 0' },
    { key: 'bondScore',  label: 'Bond Score',  tip: 'Composite risk-adjusted credit score (0–100)' },
    { key: 'expand',     label: '',            tip: null },
  ];

  return (
    <div>
      {/* Scrollable table wrapper */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--s2)',
                      whiteSpace: 'nowrap',
                      background: 'var(--bg2)',
                    }}
                  >
                    {col.tip ? (
                      <Tooltip text={col.tip}>
                        <span style={{ borderBottom: '1px dashed var(--border2)', cursor: 'help' }}>{col.label}</span>
                      </Tooltip>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, i) => {
                const meta = AGENT_META[agent.agent] || AGENT_META['Mamo'];
                const isExp = expandedId === agent.agent;
                const rankColor = i === 0 ? 'var(--lime)' : i === 1 ? 'var(--s1)' : i === 2 ? 'var(--amber)' : 'var(--s2)';

                return (
                  <React.Fragment key={agent.agent}>
                    <tr
                      onClick={() => toggle(agent.agent)}
                      style={{
                        borderBottom: isExp ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isExp ? 'var(--card2)' : 'transparent',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'var(--card2)'; }}
                      onMouseLeave={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '26px', height: '26px', borderRadius: '50%',
                          border: `1px solid ${rankColor}`,
                          fontSize: '0.6875rem', fontWeight: 700, color: rankColor,
                          fontFamily: 'var(--mono)',
                        }}>
                          {agent.rank}
                        </span>
                      </td>

                      {/* Agent */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, flexShrink: 0, boxShadow: `0 0 6px ${meta.color}60` }} />
                          {agent.medal && (
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'var(--card2)', border: `1px solid ${meta.color}40`,
                              overflow: 'hidden', padding: '3px', flexShrink: 0,
                            }}>
                              <img src={agent.medal} alt={agent.agent} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                          )}
                          <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem' }}>{agent.agent}</span>
                          <span className={`grade ${meta.gradeClass}`}>{meta.grade}</span>
                        </div>
                      </td>

                      {/* AUA */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', fontWeight: 700, color: meta.color }}>
                        {fmt(agent.aua)}
                      </td>

                      {/* AUM */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', color: 'var(--s1)' }}>
                        {fmt(agent.aum)}
                      </td>

                      {/* Native Yield */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                        {fmt(agent.nativeYield)}
                      </td>

                      {/* Rewards */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', color: 'var(--s1)' }}>
                        {fmt(agent.rewards)}
                      </td>

                      {/* Capital APY */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--lime)' }}>
                          {meta.capitalApy}
                        </span>
                      </td>

                      {/* Bond Score */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '1rem', color: meta.color, lineHeight: 1 }}>
                            {meta.bondScore}
                          </span>
                          <span style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 500 }}>/100</span>
                        </div>
                      </td>

                      {/* Expand */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          color: 'var(--s2)',
                          display: 'inline-block',
                          transform: isExp ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                          fontSize: '0.75rem',
                        }}>▾</span>
                      </td>
                    </tr>

                    {isExp && <ExpandedRow agent={agent} meta={meta} />}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--s2)' }}>
          Season 0 · Nov 5, 2024 – Feb 19, 2025 · 107 days · $10,000 deployed
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--s2)', fontFamily: 'var(--mono)' }}>
          Click any row to expand details
        </span>
      </div>
    </div>
  );
};

export default CryptoGrid;
