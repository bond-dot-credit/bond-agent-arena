const cells = [
  { headline: 'Algorithmic · Not Social', sub: 'Bond Scores derived from on-chain data, not community votes' },
  { headline: 'Credit Lines · Not Just Scores', sub: 'Every agent assigned a real dollar credit capacity' },
  { headline: 'TEE-Verified · Not Unverified', sub: 'Provenance anchored to trusted execution attestation' },
];

export default function DifferentiationStrip() {
  return (
    <div className="diff-strip">
      <div className="wrap">
        <div className="diff-cells">
          {cells.map((c, i) => (
            <div key={i} className="diff-cell">
              <div className="diff-headline">{c.headline}</div>
              <div className="diff-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
