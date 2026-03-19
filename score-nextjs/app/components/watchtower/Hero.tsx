'use client';
import { useEffect, useState } from 'react';
import type { WatchtowerSummary } from '@/lib/watchtower-data';

const flywheelNodes = [
  { label: 'ERC-8004 Identity',    desc: 'Verifiable onchain ID',  color: '#3b82f6', x: 300, y: 60  },
  { label: 'Onchain Activity',      desc: 'Transaction history',    color: '#a855f7', x: 490, y: 155 },
  { label: 'Watchtower Monitoring', desc: 'Continuous scoring',     color: '#4545e9', x: 490, y: 335 },
  { label: 'Credit Scoring',        desc: 'Bond Score output',      color: '#22c55e', x: 300, y: 430 },
  { label: 'Capital Allocation',    desc: 'Vault access & terms',   color: '#f59e0b', x: 110, y: 335 },
  { label: 'Agent Performance',     desc: 'Yield & risk metrics',   color: '#f97316', x: 110, y: 155 },
];

function FlywheelSVG() {
  return (
    <svg viewBox="0 0 600 490" width="118%" height="auto" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '-9%' }}>
      <defs>
        {flywheelNodes.map((node, i) => (
          <marker key={`arrow-${i}`} id={`hw-arrow-${i}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={node.color} opacity={0.4} />
          </marker>
        ))}
      </defs>
      {flywheelNodes.map((_, i) => {
        const from = flywheelNodes[i];
        const to = flywheelNodes[(i + 1) % flywheelNodes.length];
        const cx = 300, cy = 245;
        const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
        const ctrlX = midX + (cx - midX) * 0.35, ctrlY = midY + (cy - midY) * 0.35;
        const destIdx = (i + 1) % flywheelNodes.length;
        return (
          <path key={`conn-${i}`} d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
            fill="none" stroke={to.color} strokeWidth={1.2} strokeDasharray="4,4" opacity={0.4}
            markerEnd={`url(#hw-arrow-${destIdx})`} />
        );
      })}
      {flywheelNodes.map((node, i) => {
        const w = 130, h = 46;
        return (
          <g key={`node-${i}`}>
            <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={8} fill={`${node.color}14`} stroke={node.color} strokeWidth={1.5} />
            <text x={node.x} y={node.y - 4} textAnchor="middle" style={{ fill: 'var(--white)' }} fontSize={11} fontWeight={700}>{node.label}</text>
            <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#71717a" fontSize={9}>{node.desc}</text>
          </g>
        );
      })}
      <text x={300} y={242} textAnchor="middle" style={{ fill: 'var(--white)' }} fontSize={14} fontWeight={700}>Agent Reputation</text>
      <text x={300} y={259} textAnchor="middle" fill="#71717a" fontSize={10}>Flywheel</text>
    </svg>
  );
}

export default function Hero() {
  const [summary, setSummary] = useState<WatchtowerSummary | null>(null);

  useEffect(() => {
    fetch('/api/watchtower/summary').then(r => r.json()).then(setSummary).catch(() => {});
  }, []);

  function formatTimeAgo(ts: string): string {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero-glow" />
        <div className="hero-g2" />
        <div className="hero-grid">
          <div>
            <div className="chip" style={{ borderColor: 'rgba(69,69,233,0.35)', background: 'rgba(69,69,233,0.06)' }}>
              <div className="chip-dot" style={{ background: 'var(--lime)', boxShadow: '0 0 6px rgba(69,69,233,0.5)' }} />
              <span style={{ color: 'var(--lime)' }}>LIVE</span>
              <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
              <span>ERC-8004 × bond.credit</span>
            </div>
            <h1 className="hero-h1">
              WATCHTOWER
              <span style={{ fontSize: '0.52em', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--s1)', lineHeight: 1.3, display: 'block', marginTop: 6 }}>
                The Agentic Credit Intelligence System
              </span>
            </h1>
            <blockquote className="hero-quote">
              &ldquo;In credit markets, what you did matters more than what people think of you.&rdquo;
            </blockquote>
            <p className="hero-p">
              The monitoring and risk intelligence layer of bond.credit. Every agent is
              continuously observed, scored across five dimensions, and assigned a Bond Score
              that determines their credit capacity and vault allocation.
            </p>
            <div className="hero-meta">
              <div className="hm">
                <div className="hm-l">AGENTS MONITORED</div>
                <div className="hm-v">{summary ? summary.total_agents : <span className="skel-line" style={{ display: 'inline-block', width: 20, height: 14 }} />}</div>
              </div>
              <div className="hm">
                <div className="hm-l">AVG BOND SCORE</div>
                <div className="hm-v" style={{ color: 'var(--lime)' }}>{summary ? summary.avg_bond_score : <span className="skel-line" style={{ display: 'inline-block', width: 30, height: 14 }} />}</div>
              </div>
              <div className="hm">
                <div className="hm-l">TOTAL CAPACITY</div>
                <div className="hm-v">TBD</div>
              </div>
              <div className="hm">
                <div className="hm-l">LAST UPDATED</div>
                <div className="hm-v">{summary ? formatTimeAgo(summary.last_updated) : <span className="skel-line" style={{ display: 'inline-block', width: 40, height: 14 }} />}</div>
              </div>
            </div>
          </div>
          <div className="hero-svg-col">
            <FlywheelSVG />
          </div>
        </div>
      </div>
    </header>
  );
}
