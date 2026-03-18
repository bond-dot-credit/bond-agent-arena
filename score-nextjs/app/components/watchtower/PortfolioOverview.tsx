'use client';
import { useState } from 'react';
import type React from 'react';

/* ── Genesis static dataset (Agentic Alpha, Nov 2024 – Feb 2025) ──────── */

const GENESIS_APY = [
  { name: 'Sail',       native: 6.39,  total: 6.41,  color: '#4a90b8' },
  { name: 'Mamo',       native: 4.77,  total: 5.21,  color: '#00d180' },
  { name: 'Giza',       native: 5.27,  total: 14.30, color: '#bced62' },
  { name: 'ZyFi',       native: 10.17, total: 10.17, color: '#a855f7' },
  { name: 'SurfLiquid', native: 5.91,  total: 16.49, color: '#f97316' },
];

// Sorted by volume desc
const GENESIS_VOL = [
  { name: 'Sail',       volume: 419059, txns: 399, share: 55.0, color: '#4a90b8' },
  { name: 'Mamo',       volume: 221482, txns: 110, share: 29.1, color: '#00d180' },
  { name: 'Giza',       volume: 96887,  txns: 48,  share: 12.7, color: '#bced62' },
  { name: 'ZyFi',       volume: 16299,  txns: 8,   share: 2.1,  color: '#a855f7' },
  { name: 'SurfLiquid', volume: 8079,   txns: 5,   share: 1.1,  color: '#f97316' },
];

// Sorted by total yield desc
const GENESIS_YIELD = [
  { name: 'SurfLiquid', native: 33.94, reward: 57.56, color: '#f97316' },
  { name: 'Giza',       native: 30.36, reward: 49.56, color: '#bced62' },
  { name: 'ZyFi',       native: 57.58, reward: 0.00,  color: '#a855f7' },
  { name: 'Sail',       native: 36.65, reward: 0.10,  color: '#4a90b8' },
  { name: 'Mamo',       native: 27.49, reward: 2.51,  color: '#00d180' },
];

const summaryStats = [
  { label: 'Total Volume', value: '$761,806', sub: '107 days',       accent: false },
  { label: 'Total Yield',  value: '$295.75',  sub: 'Genesis cohort', accent: false },
  { label: 'Capital APY',  value: '10.45%',   sub: 'blended',        accent: true  },
  { label: 'Native APY',   value: '6.49%',    sub: 'ex-rewards',     accent: false },
  { label: 'Risk-Adj APY', value: '8.47%',    sub: '0.5× reward',    accent: false },
];

const poLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--s2)', marginBottom: 6,
};

/* ── Chart 1 — Capital APY ───────────────────────────────────────────── */
function ChartAPY() {
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
      <line x1={60} y1={240 - 10.45 * 10} x2={920} y2={240 - 10.45 * 10} stroke="var(--lime)" strokeWidth={1} strokeDasharray="6 4" />
      <line x1={60} y1={240 - 6.49 * 10}  x2={920} y2={240 - 6.49 * 10}  stroke="#22c55e" strokeWidth={1} strokeDasharray="6 4" />
      {GENESIS_APY.map((a, i) => {
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
        <text x={306} y={9} fill="var(--s2)" fontSize={10}>Blended 10.45%</text>
        <line x1={440} y1={5} x2={460} y2={5} stroke="#22c55e" strokeWidth={1} strokeDasharray="6 4" />
        <text x={466} y={9} fill="var(--s2)" fontSize={10}>Native Floor 6.49%</text>
      </g>
    </svg>
  );
}

/* ── Chart 2 — Volume by Agent ───────────────────────────────────────── */
function ChartVolume() {
  const labelX = 120;
  const barEnd = 860;
  const barMaxW = barEnd - labelX;
  const maxVol = 420000;
  const totalVol = 761806;
  const rowH = 44;
  const svgH = GENESIS_VOL.length * rowH + 60;
  const avgVol = totalVol / GENESIS_VOL.length; // 152361

  return (
    <svg viewBox={`0 0 960 ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* avg reference line */}
      {(() => {
        const refX = labelX + (avgVol / maxVol) * barMaxW;
        return (
          <g>
            <line x1={refX} y1={0} x2={refX} y2={svgH - 28} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={refX + 4} y={12} fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">avg $152K</text>
          </g>
        );
      })()}
      {GENESIS_VOL.map((a, i) => {
        const y = i * rowH + 20;
        const bw = (a.volume / maxVol) * barMaxW;
        const fmtVol = a.volume >= 100000 ? `$${(a.volume / 1000).toFixed(0)}K` : `$${(a.volume / 1000).toFixed(1)}K`;
        return (
          <g key={a.name}>
            {/* bg track */}
            <rect x={labelX} y={y + 6} width={barMaxW} height={22} rx={3} fill="var(--border)" opacity={0.4} />
            {/* bar */}
            <rect x={labelX} y={y + 6} width={bw} height={22} rx={3} fill={a.color} opacity={0.75} />
            {/* agent label */}
            <text x={labelX - 8} y={y + 21} textAnchor="end" fill="var(--s1)" fontSize={11} fontFamily="var(--mono)" fontWeight={600}>{a.name}</text>
            {/* volume value */}
            <text x={labelX + bw + 10} y={y + 21} fill={a.color} fontSize={11} fontFamily="var(--mono)" fontWeight={700}>{fmtVol}</text>
            {/* share */}
            <text x={labelX + bw + 10} y={y + 33} fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">{a.share.toFixed(1)}% · {a.txns} txns</text>
          </g>
        );
      })}
      {/* x-axis labels */}
      {[0, 100000, 200000, 300000, 400000].map(v => {
        const x = labelX + (v / maxVol) * barMaxW;
        return (
          <text key={v} x={x} y={svgH - 8} textAnchor="middle" fill="var(--s2)" fontSize={9} fontFamily="var(--mono)">
            {v === 0 ? '$0' : `$${v / 1000}K`}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Chart 3 — Yield Composition ─────────────────────────────────────── */
function ChartYield() {
  const labelX = 120;
  const barEnd = 780;
  const barMaxW = barEnd - labelX;
  const maxYield = 95; // slightly above SurfLiquid 91.50
  const rowH = 44;
  const svgH = GENESIS_YIELD.length * rowH + 60;

  return (
    <svg viewBox={`0 0 960 ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {GENESIS_YIELD.map((a, i) => {
        const y = i * rowH + 20;
        const total = a.native + a.reward;
        const nativeW = (a.native / maxYield) * barMaxW;
        const rewardW = (a.reward / maxYield) * barMaxW;
        const totalW = nativeW + rewardW;
        const rewardPct = total > 0 ? ((a.reward / total) * 100).toFixed(0) : '0';
        return (
          <g key={a.name}>
            {/* bg track */}
            <rect x={labelX} y={y + 6} width={barMaxW} height={22} rx={3} fill="var(--border)" opacity={0.4} />
            {/* native bar */}
            <rect x={labelX} y={y + 6} width={nativeW} height={22} rx={3} fill={a.color} opacity={0.9} />
            {/* reward bar (stacked) */}
            {a.reward > 0 && (
              <rect x={labelX + nativeW} y={y + 6} width={rewardW} height={22}
                rx={3} fill={a.color} opacity={0.3} />
            )}
            {/* agent label */}
            <text x={labelX - 8} y={y + 21} textAnchor="end" fill="var(--s1)" fontSize={11} fontFamily="var(--mono)" fontWeight={600}>{a.name}</text>
            {/* total yield */}
            <text x={labelX + totalW + 10} y={y + 21} fill={a.color} fontSize={11} fontFamily="var(--mono)" fontWeight={700}>${total.toFixed(2)}</text>
            {/* reward dep badge */}
            {a.reward > 0 ? (
              <text x={labelX + totalW + 10} y={y + 33} fill="var(--amber)" fontSize={9} fontFamily="var(--mono)">{rewardPct}% reward dep.</text>
            ) : (
              <text x={labelX + totalW + 10} y={y + 33} fill="#22c55e" fontSize={9} fontFamily="var(--mono)">0% — native only</text>
            )}
          </g>
        );
      })}
      {/* legend */}
      <g transform={`translate(${labelX}, ${svgH - 22})`}>
        <rect x={0} y={0} width={12} height={10} fill="#888" opacity={0.9} rx={1} />
        <text x={18} y={9} fill="var(--s2)" fontSize={10}>Native yield</text>
        <rect x={130} y={0} width={12} height={10} fill="#888" opacity={0.3} rx={1} />
        <text x={148} y={9} fill="var(--s2)" fontSize={10}>Reward emissions</text>
      </g>
    </svg>
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

  return (
    <section className="sec" id="portfolio" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="wrap">

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
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)',
                color: 'var(--s2)', background: 'var(--bg2)', fontFamily: 'var(--mono)',
              }}>
                STATIC · AGENTIC ALPHA RECAP
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 10, lineHeight: 1.3 }}>
              Agents Overview
            </div>
            <p style={{ fontSize: 13, color: 'var(--s2)', lineHeight: 1.75, margin: 0 }}>
              Aggregate performance across all five agents over 107 days. $10,000 deployed at $2,000 per agent
              across Ethereum mainnet and Base. The Genesis cohort generated $295.75 in total yield
              at a blended 10.45% Capital APY — with a 6.49% sustainable native floor.
            </p>
          </div>
          <div style={{
            background: 'var(--card)', padding: '28px 24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderLeft: '2px solid var(--lime)',
          }}>
            <div style={poLabel}>Portfolio APY</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 700, color: 'var(--lime)', lineHeight: 1 }}>
              10.45%
            </div>
            <div style={{ fontSize: 11, color: 'var(--s2)', marginTop: 8 }}>6.49% native-only floor</div>
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
                {s.value}
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
          <div style={{ padding: '20px 24px', background: 'var(--card)' }}>
            {chartTab === 0 && <ChartAPY />}
            {chartTab === 1 && <ChartVolume />}
            {chartTab === 2 && <ChartYield />}
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
              label: 'Avg Daily Volume', value: '$7,120', sub: 'per day · 107 days',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" opacity="0.6"/>
                  <text x="6" y="9" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="monospace">$</text>
                </svg>
              ),
              label: 'Avg Daily Yield', value: '$2.76', sub: 'per day · Genesis',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="1,9 4,4 7,7 11,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
                  <circle cx="11" cy="2" r="1.2" fill="currentColor"/>
                </svg>
              ),
              label: 'Avg Txns / Day', value: '5.33', sub: '570 txns total',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <line x1="1" y1="11" x2="11" y2="1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
                  <circle cx="3" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
                  <circle cx="9" cy="3" r="1.5" fill="currentColor"/>
                </svg>
              ),
              label: 'Avg Yield / Txn', value: '$0.519', sub: '$295.75 ÷ 570 txns',
            },
          ] as { icon: React.ReactNode; label: string; value: string; sub: string }[]).map((s) => (
            <div key={s.label} style={{ background: 'var(--card)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...poLabel, marginBottom: 4, color: 'var(--s2)' }}>
                <span style={{ display: 'flex', color: 'var(--s2)' }}>{s.icon}</span>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>
                {s.value}
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
          Blended 10.45% APY includes reward-emission yield from Giza (62.0% dep.) and SurfLiquid (62.9% dep.).
          Stripping rewards, the <strong style={{ color: 'var(--white)' }}>native floor is 6.49%</strong> — the underwriting baseline for Season 1 credit decisions.
          Risk-adjusted at 0.5× reward discount: <strong style={{ color: 'var(--white)' }}>8.47%</strong>.
        </div>

      </div>
    </section>
  );
}
