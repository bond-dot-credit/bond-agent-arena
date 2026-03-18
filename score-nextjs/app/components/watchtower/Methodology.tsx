'use client';
import { useState } from 'react';

const dimensions = [
  { num: '01', name: 'Performance Score', weight: '30% weight', desc: 'Measures yield generation efficiency: Capital APY (total and native), yield per $1K capital, TYR (Turnover Yield Rate), and reward dependency ratio. Heavy discount applied to reward-only yield streams — sustainable native yield signals stronger credit quality.', example: "Genesis example: ZyFi's Performance Score of 91 reflects 10.17% Capital APY with 0% reward dependency — the highest sustainable yield in the cohort. By contrast, SurfLiquid scores 74 despite 16.49% total APY, penalized for 62.9% reward dependency." },
  { num: '02', name: 'Risk Score', weight: '25% weight', desc: 'Quantifies downside exposure: Sharpe ratio (risk-adjusted return), maximum drawdown, leverage ratio, liquidation proximity, and liquidity exposure. Agents with high Sharpe ratios and low drawdowns receive favorable risk scores. Leverage above 3× triggers automatic flags.', example: "Genesis example: Mamo's Risk Score of 84 reflects 1.4× leverage and 5.8% max drawdown — the lowest in the cohort. SurfLiquid scores 58: leverage at 3.1× (above the 3× Caution threshold) and high liquidation proximity." },
  { num: '03', name: 'Stability Score', weight: '20% weight', desc: 'Evaluates behavioral consistency: cadence regularity, protocol diversity (number of venues used), and strategy adherence over the observation window. Agents that operate at consistent frequencies across multiple protocols demonstrate more predictable risk profiles.', example: "Genesis example: Mamo's Stability Score of 81 reflects a 0.97-day cadence across 5 protocols — near-perfect daily execution rhythm. Sail's 74 reflects high cadence but limited diversity at only 3 venues." },
  { num: '04', name: 'Sentiment Score', weight: '15% weight', desc: 'Aggregates external signals: developer reputation, community trust, audit history, and social credibility of the operator team. Sentiment captures information not visible on-chain — operator track record, public commitments, and ecosystem standing.', example: "Genesis example: Mamo's Sentiment Score of 88 is the highest in Genesis, reflecting strong developer reputation and community trust signals. SurfLiquid scores 65 — early-stage with limited public credibility track record." },
  { num: '05', name: 'Provenance Score', weight: '10% weight', desc: 'Verifies execution integrity: TEE attestation status, ERC-8004 compliance, code auditability, and on-chain identity continuity. Agents with TEE-attested execution receive the maximum provenance multiplier.', example: "Genesis example: ZyFi scores 89 and Giza scores 84 — both TEE-attested with full ERC-8004 compliance. All five Genesis agents hold attested identities, making provenance a differentiator primarily for future cohorts." },
];

export default function Methodology() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="sec" id="methodology" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="wrap">
        <div className="sh reveal">
          <div className="stag">SCORING FRAMEWORK</div>
          <h2 className="sh2">Methodology</h2>
          <p className="sdesc">Bond Score = weighted composite of five independently evaluated dimensions. Formula: round(P·0.30 + R·0.25 + S·0.20 + Se·0.15 + Pr·0.10)</p>
        </div>
        <div className="reveal" style={{ background: 'var(--lime-05)', border: '1px solid var(--lime-20)', borderLeft: '2px solid var(--lime)', borderRadius: '0 var(--r) var(--r) 0', padding: '16px 20px', marginBottom: 20, fontSize: 13, color: 'var(--s1)', lineHeight: 1.8 }}>
          <span style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 8 }}>Why five dimensions?</span>
          A single yield metric cannot underwrite an autonomous agent. A strategy may generate high APY through unsustainable emissions (Performance), while carrying dangerous leverage (Risk), executing inconsistently (Stability), operating from an unverified team (Sentiment), or running unattested code (Provenance). Bond Score captures all five failure modes simultaneously — because institutional credit decisions require a complete risk picture, not a single number.
        </div>
        <div className="reveal" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {dimensions.map((dim, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={dim.num} style={{ borderBottom: i < dimensions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, background: isOpen ? 'var(--card2)' : 'var(--card)', cursor: 'pointer', transition: 'background 0.15s', userSelect: 'none' }} onClick={() => setOpenIndex(isOpen ? null : i)}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--lime)', minWidth: 28 }}>{dim.num}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--white)', flex: 1 }}>{dim.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--lime)', background: 'var(--lime-05)', border: '1px solid var(--lime-20)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap' }}>{dim.weight}</span>
                  <span style={{ fontSize: 11, color: 'var(--s2)', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                </div>
                <div style={{ overflow: 'hidden', maxHeight: isOpen ? 600 : 0, transition: 'max-height 0.4s cubic-bezier(.22,1,.36,1)' }}>
                  <div style={{ padding: '16px 24px 20px', background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--s2)', lineHeight: 1.75, margin: '0 0 12px' }}>{dim.desc}</p>
                    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '2px solid var(--lime)', borderRadius: '0 6px 6px 0', padding: '10px 14px', fontSize: 12, color: 'var(--s2)', lineHeight: 1.7 }}>
                      <span style={{ fontWeight: 700, color: 'var(--lime)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Genesis — </span>
                      {dim.example}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="formula-box reveal" style={{ marginTop: 16 }}>
          Bond Score = (Performance × 0.30) + (Risk × 0.25) + (Stability × 0.20) + (Sentiment × 0.15) + (Provenance × 0.10)
        </div>
      </div>
    </section>
  );
}
