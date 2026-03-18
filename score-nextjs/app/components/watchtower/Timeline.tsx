const events = [
  { date: 'NOV 5, 2024', color: '#ccff00', title: 'Genesis Launch', desc: '5 agents deployed with $10,000 total capital ($2,000 each). Watchtower monitoring begins with continuous on-chain data collection across Ethereum mainnet and Base.' },
  { date: 'NOV 14, 2024', color: '#bced62', title: 'Arma Establishes Cadence', desc: 'Giza / Arma locks in a 2.43-day transaction cadence — the most consistent high-conviction rhythm in the Genesis cohort.' },
  { date: 'NOV 21, 2024', color: '#4a90b8', title: 'Sail Crosses $100K Volume', desc: 'Sail reaches $100,000 in cumulative volume on Day 16 — the fastest to the milestone. High-frequency routing at 0.27-day average cadence.' },
  { date: 'DEC 6–8, 2024', color: '#00d180', title: 'Mamo Peak Activity', desc: 'Mamo executes 9 transactions in a single day — its highest daily activity in Genesis. Near-daily cadence (0.97 days) distinguishes it as the most behaviorally stable agent.' },
  { date: 'DEC 17, 2024', color: '#f97316', title: 'SurfLiquid First 3 Txns', desc: 'SurfLiquid completes its first 3 transactions and captures $68.55 in reward yield — the earliest signal of its aggressive emission-harvesting strategy.' },
  { date: 'DEC 29, 2024', color: '#ccff00', title: 'Sail Crosses $200K · HHI 0.521', desc: 'Portfolio volume surpasses $200K. HHI reaches 0.521 — signaling high volume concentration that becomes a Season 1 strategic priority.' },
  { date: 'JAN 13–15, 2025', color: '#bced62', title: 'Arma 6-Txn Burst', desc: 'Arma executes 6 transactions in 48 hours — the most concentrated activity cluster in Genesis. High-conviction execution style peaks during this window.' },
  { date: 'FEB 19, 2025', color: '#ccff00', title: 'Genesis Close', desc: '$295.75 aggregate yield · 10.45% blended Capital APY · 107 days · 570 transactions. Five agents maintain active credit lines entering Season 1 review.' },
];

const left  = events.slice(0, 4);
const right = events.slice(4, 8);

function TlColumn({ items }: { items: typeof events }) {
  return (
    <div className="tl-wrap">
      <div className="tl-spine" />
      {items.map((ev, idx) => (
        <div key={ev.date} className="tl-item reveal" style={idx === items.length - 1 ? { marginTop: -28 } : undefined}>
          <div className="tl-dot" style={{ borderColor: ev.color }}>
            <div className="tl-dot-inner" style={{ background: ev.color }} />
          </div>
          <div>
            <div className="tl-date">{ev.date}</div>
            <div className="tl-title">{ev.title}</div>
            <div className="tl-desc">{ev.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Timeline() {
  return (
    <section className="sec" id="timeline" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <div className="sh reveal">
          <div className="stag">NOV 2024 – FEB 2025</div>
          <h2 className="sh2">Genesis Timeline</h2>
          <p className="sdesc">Eight key milestones across 107 days of continuous agent operation, scoring, and credit evaluation.</p>
        </div>
        <div className="tl-grid">
          <TlColumn items={left} />
          <TlColumn items={right} />
        </div>
      </div>
    </section>
  );
}
