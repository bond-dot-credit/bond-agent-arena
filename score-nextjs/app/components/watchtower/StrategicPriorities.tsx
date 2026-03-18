export default function StrategicPriorities() {
  const priorities = [
    { num: '01', tag: 'Risk · Portfolio', title: 'Reward Dependency Risk', body: 'ZyFi and SurfLiquid generate 62%+ of yield from token emissions — a structural fragility as protocols wind down incentive programs. Season 1 target: reward dependency below 40% before credit line expansion is approved.' },
    { num: '02', tag: 'Growth · Platform', title: 'Portfolio Scale & Diversification', body: 'Genesis validates the credit model with five agents. Season 1 should onboard 3–5 agents across delta-neutral, options writing, and RWA yield strategies to diversify the portfolio and test scoring robustness across market conditions.' },
    { num: '03', tag: 'Risk · Concentration', title: 'Volume Concentration Reduction', body: "Sail's 55% volume share drives portfolio HHI to 0.521 — above healthy diversification thresholds. Season 1 target: reduce single-agent share to ≤45% by scaling ZyFi and Arma capital allocations." },
  ];

  return (
    <section className="sec" id="priorities">
      <div className="wrap">
        <div className="sh reveal">
          <div className="stag">SEASON 1 OUTLOOK</div>
          <h2 className="sh2">Strategic Priorities</h2>
          <p className="sdesc">Three data-driven priorities emerging from Genesis performance and risk analysis.</p>
        </div>
        <div className="priority-grid">
          {priorities.map(p => (
            <div key={p.num} className="priority-card reveal">
              <div className="priority-num">{p.num}</div>
              <div className="priority-tag">{p.tag}</div>
              <div className="priority-title">{p.title}</div>
              <div className="priority-body">{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
