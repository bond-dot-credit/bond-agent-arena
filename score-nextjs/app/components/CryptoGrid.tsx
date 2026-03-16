'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import { useWallet } from '../../hooks/useWallet';

// Watchtower agent color/grade data
const AGENT_META: Record<string, { color: string; grade: string; gradeClass: string; bondScore: number; perf: number; risk: number; stab: number; sharpe: number; drawdown: number; capacity: number; capitalApy: string; rewardDep: string; signal: string }> = {
  'Sail.Money': { color: '#3b82f6', grade: 'A+', gradeClass: 'grade-ap', bondScore: 91, perf: 78,  risk: 94, stab: 92, sharpe: 2.31, drawdown: 3.1,  capacity: 18600, capitalApy: '6.41%',  rewardDep: '0.3%',  signal: 'safe'    },
  'ZyFAI':      { color: '#a855f7', grade: 'A',  gradeClass: 'grade-a',  bondScore: 85, perf: 88,  risk: 88, stab: 76, sharpe: 1.89, drawdown: 6.4,  capacity: 16200, capitalApy: '10.17%', rewardDep: '0.0%',  signal: 'safe'    },
  'Giza':       { color: '#ccff00', grade: 'A',  gradeClass: 'grade-a',  bondScore: 82, perf: 85,  risk: 72, stab: 80, sharpe: 1.42, drawdown: 11.2, capacity: 14300, capitalApy: '14.30%', rewardDep: '62.0%', signal: 'caution' },
  'Surf':       { color: '#f97316', grade: 'B+', gradeClass: 'grade-bp', bondScore: 72, perf: 90,  risk: 58, stab: 68, sharpe: 0.98, drawdown: 18.5, capacity: 9800,  capitalApy: '16.49%', rewardDep: '62.9%', signal: 'caution' },
  'Mamo':       { color: '#22c55e', grade: 'B',  gradeClass: 'grade-b',  bondScore: 67, perf: 62,  risk: 70, stab: 64, sharpe: 1.12, drawdown: 9.8,  capacity: 7400,  capitalApy: '5.21%',  rewardDep: '8.4%',  signal: 'caution' },
};

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

const SignalPill = ({ sig }: { sig: string }) => {
  const map = { safe: { cls: 'sig-safe', label: '✓ Safe' }, caution: { cls: 'sig-caution', label: '⚠ Caution' }, risk: { cls: 'sig-risk', label: '✕ Risk' } } as Record<string, { cls: string; label: string }>;
  const { cls, label } = map[sig] || map.caution;
  return <span className={`sig ${cls}`}>{label}</span>;
};

const DimMiniBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px' }} />
  </div>
);

const LeaderboardRow: React.FC<{
  agent: Agent;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ agent, index, isExpanded, onToggle }) => {
  const { authenticated, connect: login } = useWallet();
  const meta = AGENT_META[agent.agent] || AGENT_META['Mamo'];

  const fmt = (v?: number) => v != null ? `$${v.toFixed(2)}` : 'N/A';
  const rankColor = index === 0 ? 'var(--lime)' : index === 1 ? 'var(--s1)' : index === 2 ? 'var(--amber)' : 'var(--s2)';

  return (
    <>
      <tr
        style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--card2)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isExpanded ? 'var(--card2)' : 'transparent')}
        onClick={onToggle}
      >
        {/* Rank */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${rankColor}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: rankColor }}>
            {agent.rank}
          </span>
        </td>

        {/* Agent */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            {agent.medal && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--card2)', border: `1px solid ${meta.color}30`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); if (agent.website) window.open(agent.website, '_blank'); }}
              >
                <img src={agent.medal} alt={agent.agent} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem' }}>{agent.agent}</span>
            <span className={`grade ${meta.gradeClass}`}>{meta.grade}</span>
          </div>
        </td>

        {/* AUA */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', fontWeight: 600, color: meta.color }}>
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
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--lime)' }}>
          {meta.capitalApy}
        </td>

        {/* Bond Score */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1rem', color: meta.color, lineHeight: 1 }}>
              {meta.bondScore}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--s2)' }}>/100</span>
          </div>
        </td>

        {/* Expand */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <span style={{ color: 'var(--s2)', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={9} style={{ padding: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '16px 24px', borderLeft: `3px solid ${meta.color}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {/* Score breakdown */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Bond Score Breakdown</div>
                  {[
                    { l: 'PERF', v: meta.perf  },
                    { l: 'RISK', v: meta.risk  },
                    { l: 'STAB', v: meta.stab  },
                  ].map(d => (
                    <div key={d.l} className="flex items-center gap-2" style={{ marginBottom: '5px' }}>
                      <span style={{ width: '28px', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.04em' }}>{d.l}</span>
                      <DimMiniBar value={d.v} color={meta.color} />
                      <span style={{ width: '20px', textAlign: 'right', fontSize: '0.6875rem', fontFamily: 'var(--mono)', color: 'var(--s1)' }}>{d.v}</span>
                    </div>
                  ))}
                </div>

                {/* Risk metrics */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Risk Metrics</div>
                  {[
                    { l: 'Sharpe',    v: meta.sharpe.toFixed(2) },
                    { l: 'Drawdown',  v: `-${meta.drawdown}%` },
                    { l: 'Reward Dep.', v: meta.rewardDep, highlight: parseFloat(meta.rewardDep) > 30 },
                    { l: 'Capacity',  v: `$${(meta.capacity/1000).toFixed(1)}k` },
                  ].map(m => (
                    <div key={m.l} className="flex justify-between items-center" style={{ marginBottom: '5px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--s2)' }}>{m.l}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: (m as { l: string; v: string; highlight?: boolean }).highlight ? 'var(--amber)' : 'var(--white)' }}>{m.v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '8px' }}>
                    <SignalPill sig={meta.signal} />
                  </div>
                </div>

                {/* TEE Verify */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Verify Bond Score</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--s2)', marginBottom: '10px', lineHeight: 1.5 }}>
                    Run a confidential TEE computation via iExec to verify this agent's score on-chain.
                  </p>
                  <div style={{ fontSize: '0.625rem', color: 'var(--s2)', marginBottom: '10px' }}>
                    Requires <span style={{ color: 'var(--white)', fontWeight: 600 }}>0.1 RLC</span> + gas on Arbitrum One
                  </div>
                  {authenticated ? (
                    <button className="btn-outline-lime" style={{ width: '100%', fontSize: '0.6875rem', padding: '7px 12px' }}>
                      Run TEE Verification
                    </button>
                  ) : (
                    <button onClick={login} className="btn-lime" style={{ width: '100%', fontSize: '0.6875rem', padding: '7px 12px' }}>
                      Connect Wallet
                    </button>
                  )}
                  <div style={{ marginTop: '10px', fontSize: '0.5625rem', color: 'var(--s2)', textAlign: 'center', letterSpacing: '0.04em' }}>
                    POWERED BY IEXEC TEE · ARBITRUM ONE
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const CryptoGrid: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Desktop table */}
      <div className="hidden md:block" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Rank', 'Agent',
                <span className="flex items-center gap-1">AUA <Tooltip text="Assets Under Agent — total balance managed"><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--border2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--s2)', cursor: 'help' }}>?</span></Tooltip></span>,
                <span className="flex items-center gap-1">AUM <Tooltip text="Assets Under Management — native USDC balance"><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--border2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--s2)', cursor: 'help' }}>?</span></Tooltip></span>,
                'Native Yield', 'Rewards', 'Capital APY', 'Bond Score', ''
              ].map((h, i) => (
                <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--s2)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, i) => (
              <LeaderboardRow
                key={agent.agent}
                agent={agent}
                index={i}
                isExpanded={expandedId === agent.agent}
                onToggle={() => toggle(agent.agent)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {agents.map((agent, i) => {
          const meta = AGENT_META[agent.agent] || AGENT_META['Mamo'];
          const isExp = expandedId === agent.agent;
          return (
            <div key={agent.agent} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', borderLeft: `3px solid ${meta.color}` }}>
              <button
                onClick={() => toggle(agent.agent)}
                style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', cursor: 'pointer' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--s2)', width: '16px' }}>{agent.rank}</span>
                  {agent.medal && (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: `1px solid ${meta.color}30`, background: 'var(--card2)', padding: '2px', flexShrink: 0 }}>
                      <img src={agent.medal} alt={agent.agent} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem' }}>{agent.agent}</span>
                  <span className={`grade ${meta.gradeClass}`}>{meta.grade}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontFamily: 'var(--mono)', fontWeight: 700, color: meta.color }}>{meta.bondScore}</div>
                    <div style={{ fontSize: '0.5rem', color: 'var(--s2)' }}>BOND SCORE</div>
                  </div>
                  <span style={{ color: 'var(--s2)', transform: isExp ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
                </div>
              </button>

              {isExp && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingTop: '12px' }}>
                    {[
                      { l: 'AUA',        v: agent.aua != null ? `$${agent.aua.toFixed(2)}` : 'N/A', color: meta.color },
                      { l: 'AUM',        v: agent.aum != null ? `$${agent.aum.toFixed(2)}` : 'N/A' },
                      { l: 'Capital APY', v: meta.capitalApy, color: 'var(--lime)' },
                      { l: 'Sharpe',     v: meta.sharpe.toFixed(2) },
                      { l: 'Drawdown',   v: `-${meta.drawdown}%`, color: 'var(--red)' },
                      { l: 'Capacity',   v: `$${(meta.capacity/1000).toFixed(1)}k` },
                    ].map(m => (
                      <div key={m.l} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '7px 9px' }}>
                        <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.l}</div>
                        <div style={{ fontSize: '0.875rem', fontFamily: 'var(--mono)', fontWeight: 700, color: (m as { l: string; v: string; color?: string }).color || 'var(--white)', marginTop: '2px' }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <SignalPill sig={meta.signal} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoGrid;
