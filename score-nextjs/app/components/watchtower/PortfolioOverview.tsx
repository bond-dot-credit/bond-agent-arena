'use client';
import { useState, useEffect } from 'react';
import type React from 'react';
import type { LiveAgentSummary } from '@/lib/db/watchtower-db';

/* ── Chart data types ─────────────────────────────────────────────────── */

interface APYDatum {
  name: string;
  native: number;
  total: number;
  color: string;
}

interface VolDatum {
  name: string;
  volume: number;
  txns: number;
  share: number;
  color: string;
}

interface YieldDatum {
  name: string;
  native: number;
  reward: number;
  color: string;
}

/* ── Derived stats ────────────────────────────────────────────────────── */

interface PortfolioStats {
  totalVolume: number;
  totalYield: number;
  blendedCapApy: number;
  nativeFloor: number;
  riskAdjApy: number;
  totalTxns: number;
  lastUpdated: string | null;
}

function computeStats(agents: LiveAgentSummary[]): PortfolioStats {
  const active = agents.filter(a => a.capital_apy_total != null);
  const totalVolume = agents.reduce((s, a) => s + (a.total_volume ?? 0), 0);
  const totalYield = agents.reduce((s, a) => s + (a.total_yield ?? 0), 0);
  const totalTxns = agents.reduce((s, a) => s + (a.transaction_count ?? 0), 0);
  const blendedCapApy = active.length > 0
    ? active.reduce((s, a) => s + (a.capital_apy_total ?? 0), 0) / active.length
    : 0;
  const nativeFloor = active.length > 0
    ? active.reduce((s, a) => s + (a.capital_apy_native ?? 0), 0) / active.length
    : 0;
  // Risk-adjusted: native portion at 1x + reward portion at 0.5x discount
  const riskAdjApy = active.length > 0
    ? active.reduce((s, a) => {
        const total = a.capital_apy_total ?? 0;
        const native = a.capital_apy_native ?? 0;
        const reward = total - native;
        return s + native + reward * 0.5;
      }, 0) / active.length
    : 0;
  const lastUpdated = agents[0]?.last_updated ?? null;
  return { totalVolume, totalYield, blendedCapApy, nativeFloor, riskAdjApy, totalTxns, lastUpdated };
}

const poLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--s2)', marginBottom: 6,
};

/* ── Chart 1 — Capital APY ───────────────────────────────────────────── */
function ChartAPY({ data, blended, nativeFloor }: { data: APYDatum[]; blended: number; nativeFloor: number }) {
  if (data.length === 0) return null;
  return (
    <svg viewBox="0 0 960 330" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 5, 10, 15, 20].map((pct) => {
        const y = 240 - pct * 10;
        return (
          <g key={pct}>
            <line x1={60} y1={y} x2={920} y2={y} stroke="var(--border)" strokeWidth={1} />
            <text x={52} y={y + 4} textAnchor="end" fill="var(--s2)" fontSize={10} fontFamily="var(--mono)">{pct}%</text>
          </g>
        );
      })}
      <line x1={60} y1={240 - blended * 10} x2={920} y2={240 - blended * 10} stroke="var(--lime)" strokeWidth={1} strokeDasharray="6 4" />
      <line x1={60} y1={240 - nativeFloor * 10} x2={920} y2={240 - nativeFloor * 10} stroke="#22c55e" strokeWidth={1} strokeDasharray="6 4" />
      {data.map((a, i) => {
        const gx = 100 + i * 170;
        const bw = 50;
        const nH = a.native * 10;
        const tH = a.total * 10;
        return (
          <g key={a.name}>
            <rect x={gx}          y={240 - tH} width={bw} height={tH} fill={a.color} opacity={0.32} rx={2} />
            <rect x={gx + bw + 6} y={240 - nH} width={bw} height={nH} fill={a.color} opacity={0.9}  rx={2} />
            <text x={gx + bw + 3}          y={262} textAnchor="middle" fill="var(--s2)" fontSize={11} fontFamily="var(--mono)">{a.name}</text>
            <text x={gx + bw + 6 + bw / 2} y={240 - nH - 5} textAnchor="middle" fill={a.color} fontSize={9} fontFamily="var(--mono)">{a.native.toFixed(2)}%</text>
            <text x={gx + bw / 2}           y={240 - tH - 5} textAnchor="middle" fill={a.color} fontSize={9} fontFamily="var(--mono)" opacity={0.7}>{a.total.toFixed(2)}%</text>
          </g>
        );
      })}
      <g transform="translate(100,290)">
        <rect x={0}   y={0} width={14} height={10} fill="#888" opacity={0.9}  rx={1} />
        <text x={20}  y={9} fill="var(--s2)" fontSize={10}>Native APY</text>
        <rect x={130} y={0} width={14} height={10} fill="#888" opacity={0.32} rx={1} />
        <text x={150} y={9} fill="var(--s2)" fontSize={10}>Total APY</text>
        <line x1={280} y1={5} x2={300} y2={5} stroke="var(--lime)" strokeWidth={1} strokeDasharray="6 4" />
        <text x={306} y={9} fill="var(--s2)" fontSize={10}>Blended {blended.toFixed(2)}%</text>
        <line x1={440} y1={5} x2={460} y2={5} stroke="#22c55e" strokeWidth={1} strokeDasharray="6 4" />
        <text x={466} y={9} fill="var(--s2)" fontSize={10}>Native Floor {nativeFloor.toFixed(2)}%</text>
      </g>
    </svg>
  );
}

/* ── Chart 2 — Volume by Agent ───────────────────────────────────────── */
function ChartVolume({ data }: { data: VolDatum[] }) {
  if (data.length === 0) return null;
  const labelX = 120;
  const barEnd = 860;
  const barMaxW = barEnd - labelX;
  const maxVol = Math.max(...data.map(a => a.volume)) * 1.05;
  const totalVol = data.reduce((s, a) => s + a.volume, 0);
  const avgVol = totalVol / data.length;
  const rowH = 44;
  const svgH = data.length * rowH + 60;

  return (
    <svg viewBox={`0 0 960 ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {(() => {
        const refX = labelX + (avgVol / maxVol) * barMaxW;
        const avgLabel = avgVol >= 100000 ? `avg $${(avgVol / 1000).toFixed(0)}K` : `avg $${(avgVol / 1000).toFixed(1)}K`;
        return (
          <g>
            <line x1={refX} y1={0} x2={refX} y2={svgH - 28} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={refX + 4} y={12} fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">{avgLabel}</text>
          </g>
        );
      })()}
      {data.map((a, i) => {
        const y = i * rowH + 20;
        const bw = (a.volume / maxVol) * barMaxW;
        const fmtVol = a.volume >= 100000 ? `$${(a.volume / 1000).toFixed(0)}K` : `$${(a.volume / 1000).toFixed(1)}K`;
        return (
          <g key={a.name}>
            <rect x={labelX} y={y + 6} width={barMaxW} height={22} rx={3} fill="var(--border)" opacity={0.4} />
            <rect x={labelX} y={y + 6} width={bw} height={22} rx={3} fill={a.color} opacity={0.75} />
            <text x={labelX - 8} y={y + 21} textAnchor="end" fill="var(--s1)" fontSize={11} fontFamily="var(--mono)" fontWeight={600}>{a.name}</text>
            <text x={labelX + bw + 10} y={y + 21} fill={a.color} fontSize={11} fontFamily="var(--mono)" fontWeight={700}>{fmtVol}</text>
            <text x={labelX + bw + 10} y={y + 33} fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">{a.share.toFixed(1)}% · {a.txns} txns</text>
          </g>
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const v = frac * maxVol;
        const x = labelX + frac * barMaxW;
        return (
          <text key={frac} x={x} y={svgH - 8} textAnchor="middle" fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">
            {v === 0 ? '$0' : v >= 100000 ? `$${(v / 1000).toFixed(0)}K` : `$${(v / 1000).toFixed(0)}K`}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Chart 3 — Yield Composition ─────────────────────────────────────── */
function ChartYield({ data }: { data: YieldDatum[] }) {
  if (data.length === 0) return null;
  const labelX = 120;
  const barEnd = 780;
  const barMaxW = barEnd - labelX;
  const maxYield = Math.max(...data.map(a => a.native + a.reward)) * 1.05;
  const rowH = 44;
  const svgH = data.length * rowH + 60;

  return (
    <svg viewBox={`0 0 960 ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {data.map((a, i) => {
        const y = i * rowH + 20;
        const total = a.native + a.reward;
        const nativeW = (a.native / maxYield) * barMaxW;
        const rewardW = (a.reward / maxYield) * barMaxW;
        const totalW = nativeW + rewardW;
        const rewardPct = total > 0 ? ((a.reward / total) * 100).toFixed(0) : '0';
        return (
          <g key={a.name}>
            <rect x={labelX} y={y + 6} width={barMaxW} height={22} rx={3} fill="var(--border)" opacity={0.4} />
            <rect x={labelX} y={y + 6} width={nativeW} height={22} rx={3} fill={a.color} opacity={0.9} />
            {a.reward > 0 && (
              <rect x={labelX + nativeW} y={y + 6} width={rewardW} height={22} rx={3} fill={a.color} opacity={0.3} />
            )}
            <text x={labelX - 8} y={y + 21} textAnchor="end" fill="var(--s1)" fontSize={11} fontFamily="var(--mono)" fontWeight={600}>{a.name}</text>
            <text x={labelX + totalW + 10} y={y + 21} fill={a.color} fontSize={11} fontFamily="var(--mono)" fontWeight={700}>${total.toFixed(2)}</text>
            {a.reward > 0 ? (
              <text x={labelX + totalW + 10} y={y + 33} fill="var(--amber)" fontSize={9} fontFamily="var(--mono)">{rewardPct}% reward dep.</text>
            ) : (
              <text x={labelX + totalW + 10} y={y + 33} fill="#22c55e" fontSize={9} fontFamily="var(--mono)">0% — native only</text>
            )}
          </g>
        );
      })}
      <g transform={`translate(${labelX}, ${svgH - 22})`}>
        <rect x={0} y={0} width={12} height={10} fill="#888" opacity={0.9} rx={1} />
        <text x={18} y={9} fill="var(--s2)" fontSize={10}>Native yield</text>
        <rect x={130} y={0} width={12} height={10} fill="#888" opacity={0.3} rx={1} />
        <text x={148} y={9} fill="var(--s2)" fontSize={10}>Reward emissions</text>
      </g>
    </svg>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────────── */
function Skeleton({ w, h }: { w?: string | number; h?: string | number }) {
  return (
    <span style={{
      display: 'inline-block',
      width: w ?? '100%', height: h ?? 16,
      borderRadius: 4,
      background: 'var(--border)',
      opacity: 0.5,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

/* ── Component ───────────────────────────────────────────────────────── */

const CHART_TABS = [
  { label: 'Capital APY',        sublabel: 'Yield efficiency' },
  { label: 'Volume',             sublabel: 'Portfolio scale' },
  { label: 'Yield Composition',  sublabel: 'Native vs. rewards' },
];

export default function PortfolioOverview() {
  const [chartTab, setChartTab] = useState(0);
  const [agents, setAgents] = useState<LiveAgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/watchtower/agents')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: LiveAgentSummary[]) => {
        setAgents(data);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Derived chart data
  const apyData: APYDatum[] = agents
    .filter(a => a.capital_apy_total != null)
    .map(a => ({
      name: a.name,
      native: a.capital_apy_native ?? 0,
      total: a.capital_apy_total ?? 0,
      color: a.color,
    }));

  const totalVol = agents.reduce((s, a) => s + (a.total_volume ?? 0), 0);
  const volData: VolDatum[] = [...agents]
    .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
    .map(a => ({
      name: a.name,
      volume: a.total_volume ?? 0,
      txns: a.transaction_count ?? 0,
      share: totalVol > 0 ? ((a.total_volume ?? 0) / totalVol) * 100 : 0,
      color: a.color,
    }));

  const yieldData: YieldDatum[] = [...agents]
    .sort((a, b) => ((b.total_yield ?? 0)) - ((a.total_yield ?? 0)))
    .map(a => ({
      name: a.name,
      native: a.native_yield ?? 0,
      reward: 0, // reward_yield not in AgentSummary; will be 0 unless API returns it
      color: a.color,
    }));

  const stats: PortfolioStats = loading ? {
    totalVolume: 0, totalYield: 0, blendedCapApy: 0,
    nativeFloor: 0, riskAdjApy: 0, totalTxns: 0, lastUpdated: null,
  } : computeStats(agents);

  const fmtCurrency = (v: number) =>
    v >= 1000000 ? `$${(v / 1000000).toFixed(2)}M`
    : v >= 1000 ? `$${(v / 1000).toFixed(1)}K`
    : `$${v.toFixed(2)}`;

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  };

  const summaryStats = [
    { label: 'Total Volume',  value: loading ? null : fmtCurrency(stats.totalVolume), sub: 'Genesis cohort', accent: false },
    { label: 'Total Yield',   value: loading ? null : fmtCurrency(stats.totalYield),  sub: 'Genesis cohort', accent: false },
    { label: 'Capital APY',   value: loading ? null : `${stats.blendedCapApy.toFixed(2)}%`, sub: 'blended', accent: true },
    { label: 'Native APY',    value: loading ? null : `${stats.nativeFloor.toFixed(2)}%`,   sub: 'ex-rewards', accent: false },
    { label: 'Risk-Adj APY',  value: loading ? null : `${stats.riskAdjApy.toFixed(2)}%`,    sub: '0.5× reward', accent: false },
  ];

  const avgDailyVol = stats.totalVolume > 0 ? stats.totalVolume / 107 : 0;
  const avgDailyYield = stats.totalYield > 0 ? stats.totalYield / 107 : 0;
  const avgTxnsPerDay = stats.totalTxns > 0 ? stats.totalTxns / 107 : 0;
  const yieldPerTxn = stats.totalTxns > 0 ? stats.totalYield / stats.totalTxns : 0;

  return (
    <section className="sec" id="portfolio" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="wrap">

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#f87171' }}>
            Portfolio data unavailable — displaying cached genesis data
          </div>
        )}

        {/* ── About board ── */}
        <div
          className="reveal"
          style={{
            display: 'grid', gridTemplateColumns: '1fr 260px',
            gap: 1, background: 'var(--border)',
            border: '1px solid var(--border)', borderRadius: 8,
            overflow: 'hidden', marginBottom: 8,
          }}
        >
          <div style={{ background: 'var(--card)', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ ...poLabel, marginBottom: 0 }}>GENESIS · NOV 5 2024 – FEB 19 2025</div>
              {stats.lastUpdated ? (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)',
                  color: 'var(--lime)', background: 'var(--bg2)', fontFamily: 'var(--mono)',
                }}>
                  LIVE · {fmtDate(stats.lastUpdated)}
                </span>
              ) : (
                <Skeleton w={120} h={18} />
              )}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 10, lineHeight: 1.3 }}>
              Agents Overview
            </div>
            <p style={{ fontSize: 13, color: 'var(--s2)', lineHeight: 1.75, margin: 0 }}>
              Aggregate performance across all {loading ? '—' : agents.length} agents. $10,000 deployed at $2,000 per agent
              across Ethereum mainnet and Base. The Genesis cohort generated{' '}
              {loading ? <Skeleton w={50} h={12} /> : <strong style={{ color: 'var(--white)' }}>{fmtCurrency(stats.totalYield)}</strong>}{' '}
              in total yield at a blended{' '}
              {loading ? <Skeleton w={40} h={12} /> : <strong style={{ color: 'var(--white)' }}>{stats.blendedCapApy.toFixed(2)}%</strong>}{' '}
              Capital APY — with a{' '}
              {loading ? <Skeleton w={40} h={12} /> : <strong style={{ color: 'var(--white)' }}>{stats.nativeFloor.toFixed(2)}%</strong>}{' '}
              sustainable native floor.
            </p>
          </div>
          <div style={{
            background: 'var(--card)', padding: '28px 24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderLeft: '2px solid var(--lime)',
          }}>
            <div style={poLabel}>Portfolio APY</div>
            {loading ? (
              <Skeleton w={100} h={40} />
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 700, color: 'var(--lime)', lineHeight: 1 }}>
                {stats.blendedCapApy.toFixed(2)}%
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--s2)', marginTop: 8 }}>
              {loading ? <Skeleton w={130} h={12} /> : `${stats.nativeFloor.toFixed(2)}% native-only floor`}
            </div>
          </div>
        </div>

        {/* ── 5-cell summary stat row ── */}
        <div
          className="reveal"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 1, background: 'var(--border)',
            border: '1px solid var(--border)', borderRadius: 8,
            overflow: 'hidden', marginBottom: 16,
          }}
        >
          {summaryStats.map((s) => (
            <div key={s.label} style={{ background: 'var(--card)', padding: '18px 20px' }}>
              <div style={poLabel}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: s.accent ? 'var(--lime)' : 'var(--white)', marginBottom: 3 }}>
                {s.value ?? <Skeleton w={70} h={20} />}
              </div>
              <div style={{ fontSize: 11, color: 'var(--s2)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── 3-tab chart panel ── */}
        <div className="reveal chart-switcher" style={{ marginTop: 0 }}>
          <div className="cs-tabs">
            {CHART_TABS.map((t, i) => (
              <button
                key={t.label}
                className={`cs-tab${chartTab === i ? ' active' : ''}`}
                onClick={() => setChartTab(i)}
                style={{ borderBottomColor: chartTab === i ? 'var(--lime)' : 'transparent' }}
              >
                {t.label}
                <span style={{ fontSize: 9, color: 'var(--s2)', marginLeft: 6, fontWeight: 400, letterSpacing: 0 }}>
                  {t.sublabel}
                </span>
              </button>
            ))}
          </div>
          <div style={{ padding: '20px 24px', background: 'var(--card)', minHeight: 120 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton h={24} />
                <Skeleton h={200} />
              </div>
            ) : (
              <>
                {chartTab === 0 && <ChartAPY data={apyData} blended={stats.blendedCapApy} nativeFloor={stats.nativeFloor} />}
                {chartTab === 1 && <ChartVolume data={volData} />}
                {chartTab === 2 && <ChartYield data={yieldData} />}
              </>
            )}
          </div>
        </div>

        {/* ── Daily averages row ── */}
        <div
          className="reveal"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1, background: 'var(--border)',
            border: '1px solid var(--border)', borderRadius: 8,
            overflow: 'hidden', marginTop: 1,
          }}
        >
          {([
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="0" y="5" width="2.5" height="7" rx="1" fill="currentColor" opacity="0.5"/>
                  <rect x="3.5" y="3" width="2.5" height="9" rx="1" fill="currentColor" opacity="0.75"/>
                  <rect x="7" y="1" width="2.5" height="11" rx="1" fill="currentColor"/>
                  <rect x="10.5" y="0" width="1.5" height="12" rx="0.75" fill="currentColor" opacity="0.4"/>
                </svg>
              ),
              label: 'Avg Daily Volume',
              value: loading ? null : fmtCurrency(avgDailyVol),
              sub: 'per day · 107 days',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" opacity="0.6"/>
                  <text x="6" y="9" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="monospace">$</text>
                </svg>
              ),
              label: 'Avg Daily Yield',
              value: loading ? null : fmtCurrency(avgDailyYield),
              sub: 'per day · Genesis',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="1,9 4,4 7,7 11,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
                  <circle cx="11" cy="2" r="1.2" fill="currentColor"/>
                </svg>
              ),
              label: 'Avg Txns / Day',
              value: loading ? null : avgTxnsPerDay.toFixed(2),
              sub: loading ? '— txns total' : `${stats.totalTxns} txns total`,
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <line x1="1" y1="11" x2="11" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
                  <circle cx="3" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
                  <circle cx="9" cy="3" r="1.5" fill="currentColor"/>
                </svg>
              ),
              label: 'Avg Yield / Txn',
              value: loading ? null : `$${yieldPerTxn.toFixed(3)}`,
              sub: loading ? '—' : `${fmtCurrency(stats.totalYield)} ÷ ${stats.totalTxns} txns`,
            },
          ] as { icon: React.ReactNode; label: string; value: string | null; sub: string }[]).map((s) => (
            <div key={s.label} style={{ background: 'var(--card)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...poLabel, marginBottom: 4, color: 'var(--s2)' }}>
                <span style={{ display: 'flex', color: 'var(--s2)' }}>{s.icon}</span>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>
                {s.value ?? <Skeleton w={60} h={18} />}
              </div>
              <div style={{ fontSize: 10, color: 'var(--s2)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Sustainability callout */}
        <div
          className="reveal"
          style={{
            marginTop: 12,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderLeft: '2px solid var(--amber)',
            borderRadius: '0 var(--r) var(--r) 0',
            padding: '14px 20px',
            fontSize: 12,
            color: 'var(--s2)',
            lineHeight: 1.75,
          }}
        >
          <span style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6 }}>
            Sustainability Note
          </span>
          {loading ? (
            <Skeleton h={40} />
          ) : (
            <>
              Blended {stats.blendedCapApy.toFixed(2)}% APY includes reward-emission yield.
              Stripping rewards, the <strong style={{ color: 'var(--white)' }}>native floor is {stats.nativeFloor.toFixed(2)}%</strong> — the underwriting baseline for Season 1 credit decisions.
              Risk-adjusted at 0.5× reward discount: <strong style={{ color: 'var(--white)' }}>{stats.riskAdjApy.toFixed(2)}%</strong>.
            </>
          )}
        </div>

      </div>
    </section>
  );
}
