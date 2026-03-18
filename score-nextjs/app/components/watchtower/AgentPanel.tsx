'use client';
import { useState } from 'react';
import type { AgentFull, AgentSummary } from '@/lib/watchtower-data';

/* ── helpers ─────────────────────────────────────────────────────────── */

function getSignal(metric: string, value: number | string): 'Safe' | 'Caution' | 'Risk' {
  const rules: Record<string, (v: number | string) => 'Safe' | 'Caution' | 'Risk'> = {
    sharpe:                (v) => (v as number) >= 1.5 ? 'Safe' : (v as number) >= 1.0 ? 'Caution' : 'Risk',
    max_drawdown:          (v) => (v as number) <= 8   ? 'Safe' : (v as number) <= 15  ? 'Caution' : 'Risk',
    leverage:              (v) => (v as number) <= 2   ? 'Safe' : (v as number) <= 3   ? 'Caution' : 'Risk',
    liquidation_proximity: (v) => v === 'Low' ? 'Safe' : v === 'Medium' ? 'Caution' : 'Risk',
    liquidity_exposure:    (v) => v === 'Low' ? 'Safe' : v === 'Medium' ? 'Caution' : 'Risk',
    protocol_diversity:    (v) => (v as number) >= 5  ? 'Safe' : (v as number) >= 3   ? 'Caution' : 'Risk',
  };
  return rules[metric]?.(value) ?? 'Caution';
}

function SignalBadge({ signal }: { signal: 'Safe' | 'Caution' | 'Risk' }) {
  const cls = signal === 'Safe' ? 'signal-safe' : signal === 'Caution' ? 'signal-caution' : 'signal-risk';
  return <span className={`signal-badge ${cls}`}>● {signal}</span>;
}

/* ── dimension metadata ───────────────────────────────────────────────── */
const dimensions = [
  { key: 'performance_score' as const, name: 'Performance', weight: 0.30, desc: 'Yield & PnL consistency' },
  { key: 'risk_score'        as const, name: 'Risk',        weight: 0.25, desc: 'Leverage & drawdown profile' },
  { key: 'stability_score'   as const, name: 'Stability',   weight: 0.20, desc: 'Execution uptime & variance' },
  { key: 'sentiment_score'   as const, name: 'Sentiment',   weight: 0.15, desc: 'Community trust & credibility' },
  { key: 'provenance_score'  as const, name: 'Provenance',  weight: 0.10, desc: 'Dev verification & audits' },
];

/* ── Genesis protocol data ─────────────────────────────────────────── */
const PROTOCOLS: Record<number, { name: string; type: string; note: string }[]> = {
  1: [
    { name: 'Aave V3',   type: 'Lending',           note: 'Core lending venue' },
    { name: 'Pendle',    type: 'Yield Derivatives',  note: 'Yield tokenization' },
    { name: 'Morpho',    type: 'Lending (optimised)', note: 'Capital-efficient lending' },
    { name: 'Aerodrome', type: 'DEX LP',             note: 'Base-native liquidity' },
  ],
  2: [
    { name: 'Moonwell',   type: 'Lending',      note: 'Base money market' },
    { name: 'Aerodrome',  type: 'DEX LP',       note: 'High-frequency LP' },
    { name: 'Uniswap V3', type: 'DEX LP',       note: 'Concentrated liquidity' },
    { name: 'Seamless',   type: 'Lending',      note: 'Native Base lending' },
    { name: 'Extra Fi',   type: 'Yield Vault',  note: 'Leveraged yield' },
  ],
  3: [
    { name: 'Uniswap V3', type: 'DEX Routing', note: 'Primary execution venue' },
    { name: 'Aave V3',    type: 'Lending',     note: 'Capital buffer' },
    { name: 'Curve',      type: 'DEX LP',      note: 'Stable pool routing' },
  ],
  4: [
    { name: 'Fluid',   type: 'Lending / Liquidity', note: 'Primary yield source' },
    { name: 'Wasabi',  type: 'Options / Perps',     note: 'Volatility yield' },
    { name: 'Harvest', type: 'Auto-compounder',     note: 'Yield aggregation' },
  ],
  5: [
    { name: 'Lido',        type: 'LST Staking',  note: 'stETH base yield' },
    { name: 'Rocket Pool', type: 'LST Staking',  note: 'rETH base yield' },
    { name: 'Convex',      type: 'Reward Boost', note: 'Emission amplifier' },
    { name: 'Curve',       type: 'DEX LP',       note: 'Stable pool depth' },
  ],
};

const COHORT_MAX = { tyr: 3.916, yieldPerTxn: 18.30, sharpe: 1.88 };

interface Props {
  agent: AgentFull;
  allAgents?: AgentSummary[];
  defaultTab?: number;
  onTabChange?: (i: number) => void;
  onCollapse: () => void;
}

export default function AgentPanel({ agent, allAgents, defaultTab = 0, onTabChange, onCollapse }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  function handleTab(i: number) { setActiveTab(i); onTabChange?.(i); }

  const depColor = agent.reward_dependency != null && agent.reward_dependency > 50 ? 'var(--red)' :
                   agent.reward_dependency != null && agent.reward_dependency > 25 ? 'var(--amber)' : 'var(--green)';

  const riskMetrics = [
    { label: 'Sharpe Ratio',          value: agent.sharpe.toFixed(2),          signal: getSignal('sharpe', agent.sharpe) },
    { label: 'Max Drawdown',          value: `${agent.max_drawdown}%`,         signal: getSignal('max_drawdown', agent.max_drawdown) },
    { label: 'Leverage Ratio',        value: `${agent.leverage}×`,             signal: getSignal('leverage', agent.leverage) },
    { label: 'Liquidation Proximity', value: agent.liquidation_proximity,      signal: getSignal('liquidation_proximity', agent.liquidation_proximity) },
    { label: 'Liquidity Exposure',    value: agent.liquidity_exposure,         signal: getSignal('liquidity_exposure', agent.liquidity_exposure) },
    { label: 'Protocol Diversity',    value: `${agent.protocol_diversity ?? '—'} protocols`, signal: getSignal('protocol_diversity', agent.protocol_diversity ?? 0) },
  ];

  function renderBondBreakdown() {
    const barH = 28; const gap = 12;
    const svgH = dimensions.length * (barH + gap) + 20;
    const labelW = 110; const barMaxW = 260; const valW = 50;
    const svgW = labelW + barMaxW + valW + 20;
    return (
      <div>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', maxWidth: 520 }}>
          {dimensions.map((dim, i) => {
            const y = i * (barH + gap) + 4;
            const score = agent[dim.key];
            const barW = (score / 100) * barMaxW;
            return (
              <g key={dim.key}>
                <text x={0} y={y + barH / 2 + 1} fill="var(--s2)" fontSize={11} fontFamily="var(--font)" fontWeight={600} textAnchor="start" dominantBaseline="middle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dim.name}</text>
                <rect x={labelW} y={y} width={barMaxW} height={barH} rx={4} fill="var(--border)" />
                <rect x={labelW} y={y} width={barW} height={barH} rx={4} fill={agent.color} opacity={0.8} />
                <text x={labelW + barMaxW + 12} y={y + barH / 2 + 1} fill="var(--white)" fontSize={13} fontFamily="var(--mono)" fontWeight={600} dominantBaseline="middle">{score}</text>
              </g>
            );
          })}
          {(() => {
            const refX = labelW + (agent.bond_score / 100) * barMaxW;
            return <line x1={refX} y1={0} x2={refX} y2={svgH - 10} stroke={agent.color} strokeWidth={2} strokeDasharray="4 3" opacity={0.6} />;
          })()}
        </svg>
        <div className="formula-box" style={{ marginTop: 20 }}>
          Bond Score = (Performance × 0.30) + (Risk × 0.25) + (Stability × 0.20) + (Sentiment × 0.15) + (Provenance × 0.10){' '}= <strong style={{ color: agent.color }}>{agent.bond_score}</strong>
        </div>
      </div>
    );
  }

  function renderRiskMetrics() {
    return (
      <table className="risk-table">
        <thead><tr><th>METRIC</th><th>VALUE</th><th>SIGNAL</th></tr></thead>
        <tbody>
          {riskMetrics.map(m => (
            <tr key={m.label}><td>{m.label}</td><td>{m.value}</td><td><SignalBadge signal={m.signal} /></td></tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderProtocols() {
    const protos = PROTOCOLS[agent.id] ?? [];
    const diversity = getSignal('protocol_diversity', agent.protocol_diversity ?? 0);
    const diversityLabel = diversity === 'Safe' ? 'Safe diversification' : diversity === 'Caution' ? 'Moderate diversification' : 'Concentrated exposure';
    return (
      <div>
        <div className="proto-intro">
          Protocols actively deployed during Genesis (Nov 2024 – Feb 2025).{' '}
          <strong>{protos.length} venues</strong> — {diversityLabel}.
          {agent.capital_apy_native != null && (
            <> Native APY floor: <strong style={{ color: agent.color }}>{agent.capital_apy_native.toFixed(2)}%</strong>.</>
          )}
        </div>
        <div className="proto-grid-cards">
          {protos.map(p => (
            <div key={p.name} className="proto-card" style={{ borderTop: `2px solid ${agent.color}` }}>
              <div className="proto-type">{p.type}</div>
              <div className="proto-name">{p.name}</div>
              <div className="proto-yield" style={{ color: 'var(--s2)', fontSize: 10 }}>{p.note}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderVolumeYield() {
    const vol    = agent.total_volume    ?? 0;
    const totalY = agent.total_yield     ?? 0;
    const nativeY= agent.native_yield    ?? 0;
    const rewardY= agent.reward_yield    ?? 0;
    const dep    = agent.reward_dependency ?? 0;
    const depColor = dep > 50 ? '#ef4444' : dep > 25 ? '#f59e0b' : '#22c55e';
    const nativePct = totalY > 0 ? (nativeY / totalY) * 100 : 0;
    const rewardPct = totalY > 0 ? (rewardY / totalY) * 100 : 0;
    const portfolioVol = 761806;
    const volShare = vol > 0 ? (vol / portfolioVol) * 100 : 0;
    const portfolioYield = 295.75;
    const yieldShare = totalY > 0 ? (totalY / portfolioYield) * 100 : 0;
    const agentTyr = agent.tyr ?? 0;
    const agentYieldPerTxn = (agent.total_yield != null && agent.transaction_count != null && agent.transaction_count > 0) ? agent.total_yield / agent.transaction_count : 0;
    const agentSharpe = agent.sharpe ?? 0;
    const tyrPct   = Math.min((agentTyr / COHORT_MAX.tyr) * 100, 100);
    const ytxnPct  = Math.min((agentYieldPerTxn / COHORT_MAX.yieldPerTxn) * 100, 100);
    const sharpePct = Math.min((agentSharpe / COHORT_MAX.sharpe) * 100, 100);
    const statBox: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px', flex: 1 };
    const label: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--s2)', marginBottom: 6 };
    const bigVal: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: agent.color, lineHeight: 1.1, marginBottom: 4 };
    const subVal: React.CSSProperties = { fontSize: 11, color: 'var(--s2)' };
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={statBox}><div style={label}>Total Volume</div><div style={bigVal}>${vol >= 1000 ? `${(vol / 1000).toFixed(1)}K` : vol.toFixed(0)}</div><div style={subVal}>{volShare.toFixed(1)}% of Genesis portfolio · {agent.transaction_count ?? '—'} txns</div></div>
          <div style={statBox}><div style={label}>Total Yield</div><div style={{ ...bigVal, color: '#22c55e' }}>${totalY.toFixed(2)}</div><div style={subVal}>{yieldShare.toFixed(1)}% of Genesis portfolio yield</div></div>
          <div style={statBox}><div style={label}>Reward Dependency</div><div style={{ ...bigVal, color: depColor }}>{dep.toFixed(1)}%</div><div style={subVal}>{dep > 50 ? '⚠ High — sustainability risk' : dep > 25 ? '○ Moderate' : '✓ Low — sustainable'}</div></div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...label, marginBottom: 10 }}>Yield Split — Native vs. Reward Emissions</div>
          <div style={{ height: 28, borderRadius: 6, overflow: 'hidden', display: 'flex', background: 'var(--border)' }}>
            <div style={{ width: `${nativePct}%`, background: agent.color, opacity: 0.9, transition: 'width 0.8s ease' }} />
            <div style={{ width: `${rewardPct}%`, background: agent.color, opacity: 0.35 }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--s1)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: agent.color, opacity: 0.9 }} />Native <strong>${nativeY.toFixed(2)}</strong> · {nativePct.toFixed(1)}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--s1)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: agent.color, opacity: 0.35 }} />Rewards <strong>${rewardY.toFixed(2)}</strong> · {rewardPct.toFixed(1)}%</div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...label, marginBottom: 10 }}>Volume Share of Genesis Portfolio ($761,806 total)</div>
          <div style={{ height: 20, borderRadius: 6, background: 'var(--border)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(volShare, 100)}%`, background: agent.color, opacity: 0.75, transition: 'width 0.8s ease' }} /></div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--s2)' }}>{volShare.toFixed(1)}% · ${vol >= 1000 ? `${(vol / 1000).toFixed(1)}K` : vol.toFixed(0)} of $761.8K</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'TYR', value: agent.tyr != null ? `${(agent.tyr * 100).toFixed(3)}%` : '—', sub: 'Yield per $ cycled' },
            { label: 'Yield / $1K Capital', value: agent.yield_per_1k_capital != null ? `$${agent.yield_per_1k_capital.toFixed(2)}` : '—', sub: 'Standardised productivity' },
            { label: 'Capital Turnover', value: agent.capital_turnover != null ? `${Math.round(agent.capital_turnover)}×` : '—', sub: 'Genesis cycles' },
            { label: 'Capital APY (Total)', value: agent.capital_apy_total != null ? `${agent.capital_apy_total.toFixed(2)}%` : '—', sub: 'Annualised return' },
            { label: 'Capital APY (Native)', value: agent.capital_apy_native != null ? `${agent.capital_apy_native.toFixed(2)}%` : '—', sub: 'Reward-stripped floor' },
            { label: 'Cadence', value: agent.cadence != null ? `${agent.cadence.toFixed(2)}d` : '—', sub: 'Avg days between txns' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={label}>{m.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--white)', lineHeight: 1.2 }}>{m.value}</div>
              <div style={subVal}>{m.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: '18px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--s2)', marginBottom: 14 }}>Cohort Efficiency Comparison — Genesis</div>
          {[
            { label: 'TYR', agentVal: agentTyr.toFixed(3) + '%', pct: tyrPct, maxLabel: 'SurfLiquid 3.916%' },
            { label: 'Yield / Txn', agentVal: agentYieldPerTxn > 0 ? `$${agentYieldPerTxn.toFixed(2)}` : '—', pct: ytxnPct, maxLabel: 'SurfLiquid $18.30' },
            { label: 'Sharpe', agentVal: agentSharpe.toFixed(2), pct: sharpePct, maxLabel: 'ZyFi 1.88' },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--s2)' }}>{row.label}</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--white)', fontWeight: 700 }}>{row.agentVal}</span>
                  <span style={{ fontSize: 9, color: 'var(--s2)' }}>max: {row.maxLabel}</span>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${row.pct}%`, background: agent.color, opacity: 0.8, transition: 'width 0.8s ease' }} /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabs = ['BOND SCORE', 'RISK METRICS', 'PROTOCOLS', 'VOLUME & YIELD'] as const;
  const tabRenderers = [renderBondBreakdown, renderRiskMetrics, renderProtocols, renderVolumeYield];

  return (
    <div>
      <div className="agent-hdr">
        <div>
          <div className="agent-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${agent.color}1A`, color: agent.color, border: `1px solid ${agent.color}4D`, borderRadius: 100, padding: '4px 14px', marginBottom: 14, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, display: 'inline-block', flexShrink: 0 }} />
            {agent.ticker} · {agent.strategy_type ?? 'Agent'}
          </div>
          <div style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: agent.color, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 10 }}>{agent.name}</div>
          {agent.strategy_description && <div style={{ fontSize: 13, color: 'var(--s1)', lineHeight: 1.75, maxWidth: 500 }}>{agent.strategy_description}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="big-stat" style={{ background: 'var(--card)', border: `1px solid ${agent.color}4D`, borderRadius: 'var(--r)', padding: '14px 18px' }}>
            <div className="bs-l">BOND SCORE</div>
            <div className="bs-v" style={{ fontSize: 30, color: agent.color }}>{agent.bond_score}</div>
            <div className="bs-s">Grade {agent.grade}</div>
          </div>
          <div className="big-stat" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
            <div className="bs-l">CAPITAL APY (TOTAL)</div>
            <div className="bs-v" style={{ fontSize: 24, color: agent.color }}>{agent.capital_apy_total != null ? `${agent.capital_apy_total.toFixed(2)}%` : '—'}</div>
            <div className="bs-s">{agent.capital_apy_native != null ? `${agent.capital_apy_native.toFixed(2)}% native floor` : ''}</div>
          </div>
          <div className="big-stat" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
            <div className="bs-l">TOTAL YIELD · REWARD DEP.</div>
            <div className="bs-v" style={{ fontSize: 20, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span>{agent.total_yield != null ? `$${agent.total_yield.toFixed(2)}` : '—'}</span>
              <span style={{ fontSize: 16, color: depColor }}>{agent.reward_dependency != null ? `${agent.reward_dependency.toFixed(1)}%` : ''}</span>
            </div>
            <div className="bs-s">{agent.native_yield != null ? `$${agent.native_yield.toFixed(2)} native · ` : ''}{agent.reward_yield != null ? `$${agent.reward_yield.toFixed(2)} rewards` : ''}</div>
          </div>
        </div>
      </div>
      <div className="kpi-row">
        <div className="kpi-cell"><div className="kpi-cell-label">Total Volume</div><div className="kpi-cell-value" style={{ color: agent.color, fontSize: 15 }}>{agent.total_volume != null ? `$${Math.round(agent.total_volume).toLocaleString()}` : '—'}</div><div className="kpi-cell-sub">{agent.capital_turnover != null ? `${Math.round(agent.capital_turnover)}× turnover` : ''}</div></div>
        <div className="kpi-cell"><div className="kpi-cell-label">Transactions</div><div className="kpi-cell-value" style={{ color: agent.color }}>{agent.transaction_count != null ? agent.transaction_count.toLocaleString() : '—'}</div><div className="kpi-cell-sub">{agent.strategy_type ?? ''}</div></div>
        <div className="kpi-cell"><div className="kpi-cell-label">Cadence</div><div className="kpi-cell-value" style={{ fontSize: 15 }}>{agent.cadence != null ? `${agent.cadence.toFixed(2)} d/tx` : '—'}</div><div className="kpi-cell-sub">Avg days between txns</div></div>
        <div className="kpi-cell"><div className="kpi-cell-label">TYR</div><div className="kpi-cell-value" style={{ fontSize: 15 }}>{agent.tyr != null ? `${(agent.tyr * 100).toFixed(3)}%` : '—'}</div><div className="kpi-cell-sub">Yield per $ cycled</div></div>
        <div className="kpi-cell"><div className="kpi-cell-label">Yield / $1K Cap.</div><div className="kpi-cell-value" style={{ fontSize: 15 }}>{agent.yield_per_1k_capital != null ? `$${agent.yield_per_1k_capital.toFixed(2)}` : '—'}</div><div className="kpi-cell-sub">Standardized productivity</div></div>
      </div>
      <div className="chart-switcher" style={{ marginBottom: 28 }}>
        <div className="cs-tabs">
          {tabs.map((label, i) => (
            <button key={label} className={`cs-tab${activeTab === i ? ' active' : ''}`} onClick={() => handleTab(i)} style={{ borderBottomColor: activeTab === i ? agent.color : 'transparent' }}>{label}</button>
          ))}
        </div>
        <div style={{ padding: 28, background: 'var(--card)' }}>{tabRenderers[activeTab]()}</div>
      </div>
      <div className="wt-note">
        <div className="stag" style={{ marginBottom: 10 }}>WATCHTOWER ASSESSMENT</div>
        <blockquote style={{ borderLeft: `2px solid ${agent.color}`, paddingLeft: 16, margin: 0, fontSize: 14, color: 'var(--s1)', lineHeight: 1.75, fontStyle: 'italic' }}>{agent.strategy_notes}</blockquote>
      </div>
      <div className="panel-footer">
        <span className="panel-footer-meta">Updated {new Date(agent.last_updated).toLocaleString()} · bond.credit Watchtower</span>
        <button className="expand-btn" onClick={onCollapse}>Close ✕</button>
      </div>
    </div>
  );
}
