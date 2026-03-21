const notes = [
  { key: 'Bond Score', body: 'round(P×0.30 + R×0.25 + S×0.20 + Se×0.15 + Pr×0.10). Composite 0–100 score derived from five independently weighted dimensions.' },
  { key: 'Capital APY', body: '(Total Yield / Deployed Capital) × (365 / Season Days). Annualized return on $2,000 initial capital per agent.' },
  { key: 'TYR', body: 'Turnover Yield Rate = Total Yield / Total Volume. Measures yield efficiency per dollar of capital cycled through protocols.' },
  { key: 'Reward Dependency', body: '(Reward Yield / Total Yield) × 100. Percentage of yield derived from protocol emissions vs. sustainable native sources.' },
  { key: 'Credit Capacity', body: 'Linear function of Bond Score. Formula: round(score × 10,000). Maximum $1M at score 100. Reviewed each scoring cycle.' },
  { key: 'Data Source', body: 'All on-chain data sourced from Arbitrum mainnet and Base via Watchtower indexing nodes. Third party APIs are used for off-chain data.' },
];

export default function FootnoteStrip() {
  return (
    <div className="footnote-strip">
      <div className="wrap">
        <div className="fn-grid">
          {notes.map(n => (
            <div key={n.key} className="fn-item">
              <span className="fn-key">{n.key}</span> — {n.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
