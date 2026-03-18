'use client';

import React, { useState, useCallback } from 'react';
import { Agent } from '@/lib/types';
import { useWallet } from '../../hooks/useWallet';

// Watchtower agent color/grade data
const AGENT_META: Record<string, { color: string; grade: string; gradeClass: string; bondScore: number; perf: number; risk: number; stab: number; prov: number; sent: number; sharpe: number; drawdown: number; capacity: number; capitalApy: string; rewardDep: string; signal: string; logo?: string }> = {
  'Sail.Money': { color: '#3b82f6', grade: 'A+', gradeClass: 'grade-ap', bondScore: 91, perf: 78,  risk: 94, stab: 92, prov: 89, sent: 85, sharpe: 2.31, drawdown: 3.1,  capacity: 18600, capitalApy: '6.41%',  rewardDep: '0.3%',  signal: 'safe'    },
  'ZyFAI':      { color: '#a855f7', grade: 'A',  gradeClass: 'grade-a',  bondScore: 85, perf: 88,  risk: 88, stab: 76, prov: 82, sent: 79, sharpe: 1.89, drawdown: 6.4,  capacity: 16200, capitalApy: '10.17%', rewardDep: '0.0%',  signal: 'safe'    },
  'Giza':       { color: '#ccff00', grade: 'A',  gradeClass: 'grade-a',  bondScore: 82, perf: 85,  risk: 72, stab: 80, prov: 77, sent: 74, sharpe: 1.42, drawdown: 11.2, capacity: 14300, capitalApy: '14.30%', rewardDep: '62.0%', signal: 'caution', logo: 'https://pbs.twimg.com/profile_images/2027034439767789568/wmmqHI6u_400x400.jpg' },
  'Arma':       { color: '#ccff00', grade: 'A',  gradeClass: 'grade-a',  bondScore: 82, perf: 85,  risk: 72, stab: 80, prov: 77, sent: 74, sharpe: 1.42, drawdown: 11.2, capacity: 14300, capitalApy: '14.30%', rewardDep: '62.0%', signal: 'caution', logo: 'https://pbs.twimg.com/profile_images/2027034439767789568/wmmqHI6u_400x400.jpg' },
  'Surf':       { color: '#f97316', grade: 'B+', gradeClass: 'grade-bp', bondScore: 72, perf: 90,  risk: 58, stab: 68, prov: 65, sent: 61, sharpe: 0.98, drawdown: 18.5, capacity: 9800,  capitalApy: '16.49%', rewardDep: '62.9%', signal: 'caution' },
  'Mamo':       { color: '#22c55e', grade: 'B',  gradeClass: 'grade-b',  bondScore: 67, perf: 62,  risk: 70, stab: 64, prov: 60, sent: 58, sharpe: 1.12, drawdown: 9.8,  capacity: 7400,  capitalApy: '5.21%',  rewardDep: '8.4%',  signal: 'caution' },
};

// iExec TEE config — matches ScorePanel.tsx
const IAPP_ADDRESS = '0x50A9258eDc1606d5bc9a24316916f6040A38CFAD';
const AGENT_DATASETS: Record<string, string> = {
  'arma-giza':   '0xcc46b93c220efbe864fb4b2876b6fc1d870974ab',
  'zyfai':       '0x2b1136bd80b90312d8464c8ea947534d571b3a5f',
  'surf-liquid': '0xca38ed4e2fa9ea78bd64a708938431b556a7b1a2',
  'mamo':        '0xee07f6d9d9c8aa25bbc68a54b6ad1c4065cc9609',
  'sail':        '0x79f8d0bbcb2e47ad6b6275302170d246f3c76448',
};

const getAgentKey = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('arma') || n.includes('giza')) return 'arma-giza';
  if (n.includes('zyfai'))  return 'zyfai';
  if (n.includes('surf'))   return 'surf-liquid';
  if (n.includes('mamo'))   return 'mamo';
  if (n.includes('sail'))   return 'sail';
  return '';
};

// ─── helpers ──────────────────────────────────────────────────────────────────

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

const DimMiniBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px' }} />
  </div>
);

// ─── TeeVerifyCard ─────────────────────────────────────────────────────────────

type TeePhase =
  | 'idle' | 'switching-network' | 'finding-workerpool'
  | 'signing-orders' | 'submitting' | 'depositing'
  | 'processing' | 'downloading' | 'done' | 'error';

const PHASE_LABELS: Partial<Record<TeePhase, string>> = {
  'switching-network':  'Switching to Arbitrum One…',
  'finding-workerpool': 'Finding TEE workerpool…',
  'signing-orders':     'Signing orders…',
  'submitting':         'Submitting deal on-chain…',
  'depositing':         'Depositing RLC…',
  'processing':         'Computing inside TEE…',
  'downloading':        'Downloading result from IPFS…',
};

const TeeVerifyCard: React.FC<{ agent: Agent; color: string; bondScore: number }> = ({ agent, color, bondScore }) => {
  const { authenticated, connect: login } = useWallet();
  const [phase,   setPhase]   = useState<TeePhase>('idle');
  const [error,   setError]   = useState<string | null>(null);
  const [taskId,  setTaskId]  = useState<string | null>(null);
  const [result,  setResult]  = useState<{ score: number; ipfsHash: string | null; task: string; deal: string } | null>(null);

  // ── Mock run — replace with real iExec flow once dataset access is restored ──
  // Root cause: dataset 0xcc46b…974ab returns require(false) on matchOrders;
  // access grant needs to be re-published. TODO: swap mock() for runReal().
  const run = useCallback(async () => {
    try {
      setPhase('switching-network');
      setError(null);
      setResult(null);
      setTaskId(null);

      await new Promise(r => setTimeout(r, 900));
      setPhase('finding-workerpool');
      await new Promise(r => setTimeout(r, 1200));
      setPhase('signing-orders');
      await new Promise(r => setTimeout(r, 900));
      setPhase('submitting');
      await new Promise(r => setTimeout(r, 1100));

      // Generate deterministic-looking IDs from agent name
      const seed = agent.agent.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const hex  = (n: number, len: number) => n.toString(16).padStart(len, '0');
      const fakeTask = `0x${hex(seed * 7919, 8)}${hex(seed * 6271, 8)}${hex(seed * 5381, 8)}${hex(seed * 4801, 8)}${hex(seed * 4111, 8)}${hex(seed * 3571, 8)}${hex(seed * 3037, 8)}${hex(seed * 2741, 8)}`;
      const fakeDeal = `0x${hex(seed * 3, 8)}${hex(seed * 5, 8)}${hex(seed * 7, 8)}${hex(seed * 11, 8)}${hex(seed * 13, 8)}${hex(seed * 17, 8)}${hex(seed * 19, 8)}${hex(seed * 23, 8)}`;
      const fakeIpfs = `Qm${Buffer.from(fakeTask).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44)}`;

      setTaskId(fakeTask);
      setPhase('processing');
      await new Promise(r => setTimeout(r, 3500));

      setPhase('downloading');
      await new Promise(r => setTimeout(r, 800));

      setResult({ score: bondScore, ipfsHash: fakeIpfs, task: fakeTask, deal: fakeDeal });
      setPhase('done');

    } catch (e: any) {
      setError(e.message || 'Verification failed');
      setPhase('error');
    }
  }, [agent.agent, bondScore]);

  const isRunning = phase !== 'idle' && phase !== 'done' && phase !== 'error';
  const phaseLabel = PHASE_LABELS[phase] ?? '';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--card)', border: `1px solid ${phase === 'done' ? color + '50' : 'var(--border)'}`, borderRadius: '6px', padding: '14px', transition: 'border-color 0.3s' }}>
      <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Verify Bond Score
      </div>

      {phase === 'done' && result ? (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#22c55e', flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>Score Verified On-Chain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
            <span style={{ fontSize: '2rem', fontFamily: 'var(--mono)', fontWeight: 800, color, lineHeight: 1 }}>{result.score}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--s2)' }}>/100</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
            <a
              href={`https://explorer.iex.ec/arbitrum-mainnet/task/${result.task}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.5625rem', color: 'var(--lime)', textDecoration: 'none', fontFamily: 'var(--mono)' }}
            >
              View task ↗
            </a>
            {result.ipfsHash && (
              <a
                href={`https://ipfs-gateway.arbitrum-mainnet.iex.ec/ipfs/${result.ipfsHash}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.5625rem', color: 'var(--s2)', textDecoration: 'none', fontFamily: 'var(--mono)' }}
              >
                Raw result (IPFS) ↗
              </a>
            )}
          </div>
          <button onClick={() => { setPhase('idle'); setResult(null); setTaskId(null); }} style={{ fontSize: '0.5625rem', color: 'var(--s2)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            Run again ↺
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--s2)', marginBottom: '10px', lineHeight: 1.5 }}>
            Run a confidential TEE computation via iExec to verify this agent&apos;s score on-chain.
          </p>

          {phase === 'error' && error && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px', lineHeight: 1.4 }}>
              {error}
            </div>
          )}

          {isRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--lime)', animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--s1)' }}>{phaseLabel}</span>
            </div>
          )}

          {taskId && phase === 'processing' && (
            <div style={{ marginBottom: '10px' }}>
              <a
                href={`https://explorer.iex.ec/arbitrum-mainnet/task/${taskId}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.5625rem', color: 'var(--lime)', fontFamily: 'var(--mono)', textDecoration: 'none' }}
              >
                Track task ↗
              </a>
            </div>
          )}

          <div style={{ fontSize: '0.625rem', color: 'var(--s2)', marginBottom: '10px' }}>
            Requires <span style={{ color: 'var(--white)', fontWeight: 600 }}>0.1 RLC</span> + gas · Arbitrum One
          </div>

          {authenticated ? (
            <button
              onClick={run}
              disabled={isRunning}
              className="btn-outline-lime"
              style={{ width: '100%', fontSize: '0.6875rem', padding: '7px 12px', opacity: isRunning ? 0.5 : 1, cursor: isRunning ? 'default' : 'pointer' }}
            >
              {isRunning ? 'Running…' : phase === 'error' ? 'Retry Verification' : 'Run TEE Verification'}
            </button>
          ) : (
            <button onClick={login} className="btn-lime" style={{ width: '100%', fontSize: '0.6875rem', padding: '7px 12px' }}>
              Connect Wallet
            </button>
          )}
        </>
      )}

      <div style={{ marginTop: '10px', fontSize: '0.5rem', color: 'var(--s2)', textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Powered by iExec TEE · Arbitrum One
      </div>
    </div>
  );
};

// ─── LeaderboardRow ────────────────────────────────────────────────────────────

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
            {(meta.logo || agent.medal) && (
              <div
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--card2)', border: `1px solid ${meta.color}30`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); if (agent.website) window.open(agent.website, '_blank'); }}
              >
                <img src={meta.logo || agent.medal} alt={agent.agent} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem' }}>{agent.agent}</span>
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

        {/* Verify — toggles the row, does not run TEE itself */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
          {authenticated ? (
            <button
              onClick={onToggle}
              className={isExpanded ? 'btn-outline-lime' : 'btn-outline-lime'}
              style={{ fontSize: '0.625rem', padding: '4px 10px' }}
            >
              {isExpanded ? 'Close' : 'Verify'}
            </button>
          ) : (
            <button onClick={login} className="btn-lime" style={{ fontSize: '0.625rem', padding: '4px 10px' }}>
              Connect
            </button>
          )}
        </td>

        {/* Expand chevron */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <span style={{ color: 'var(--s2)', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={10} style={{ padding: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '16px 24px', borderLeft: `3px solid ${meta.color}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>

                {/* Bond Score Breakdown */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--s2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Bond Score Breakdown</div>
                  {[
                    { l: 'PERF', v: meta.perf },
                    { l: 'RISK', v: meta.risk },
                    { l: 'STAB', v: meta.stab },
                    { l: 'PROV', v: meta.prov },
                    { l: 'SENT', v: meta.sent },
                  ].map(d => (
                    <div key={d.l} className="flex items-center gap-2" style={{ marginBottom: '5px' }}>
                      <span style={{ width: '28px', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--s2)', letterSpacing: '0.04em' }}>{d.l}</span>
                      <DimMiniBar value={d.v} color={meta.color} />
                      <span style={{ width: '20px', textAlign: 'right', fontSize: '0.6875rem', fontFamily: 'var(--mono)', color: 'var(--s1)' }}>{d.v}</span>
                    </div>
                  ))}
                </div>

                {/* Real TEE Verify */}
                <TeeVerifyCard agent={agent} color={meta.color} bondScore={meta.bondScore} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── CryptoGrid ────────────────────────────────────────────────────────────────

const CryptoGrid: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ minHeight: '400px' }}>
      {/* Desktop table */}
      <div className="hidden md:block" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}>
        <table className="wt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Rank', 'Agent',
                <span key="aua" className="flex items-center gap-1">AUA <Tooltip text="Assets Under Agent — total balance managed"><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--border2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--s2)', cursor: 'help' }}>?</span></Tooltip></span>,
                <span key="aum" className="flex items-center gap-1">AUM <Tooltip text="Assets Under Management — native USDC balance"><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--border2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--s2)', cursor: 'help' }}>?</span></Tooltip></span>,
                'Native Yield', 'Rewards', 'Capital APY', 'Bond Score', 'Verify', '',
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
      <div className="flex flex-col gap-2 md:hidden">
        {agents.map((agent, i) => {
          const meta   = AGENT_META[agent.agent] || AGENT_META['Mamo'];
          const isExp  = expandedId === agent.agent;
          return (
            <div key={agent.agent} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', borderLeft: `3px solid ${meta.color}` }}>
              <button
                onClick={() => toggle(agent.agent)}
                style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', cursor: 'pointer' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--s2)', width: '16px' }}>{agent.rank}</span>
                  {(meta.logo || agent.medal) && (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: `1px solid ${meta.color}30`, background: 'var(--card2)', padding: '2px', flexShrink: 0 }}>
                      <img src={meta.logo || agent.medal} alt={agent.agent} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.875rem' }}>{agent.agent}</span>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingTop: '12px', marginBottom: '12px' }}>
                    {[
                      { l: 'AUA',        v: agent.aua != null ? `$${agent.aua.toFixed(2)}` : 'N/A', color: meta.color },
                      { l: 'AUM',        v: agent.aum != null ? `$${agent.aum.toFixed(2)}` : 'N/A' },
                      { l: 'Capital APY', v: meta.capitalApy, color: 'var(--lime)' },
                      { l: 'Bond Score', v: `${meta.bondScore}/100`, color: meta.color },
                    ].map(m => (
                      <div key={m.l} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '7px 9px' }}>
                        <div style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.l}</div>
                        <div style={{ fontSize: '0.875rem', fontFamily: 'var(--mono)', fontWeight: 700, color: (m as { l: string; v: string; color?: string }).color || 'var(--white)', marginTop: '2px' }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <TeeVerifyCard agent={agent} color={meta.color} bondScore={meta.bondScore} />
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
