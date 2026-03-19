'use client';
import { useState, useEffect } from 'react';
import type { LiveAgentSummary } from '@/lib/db/watchtower-db';

interface AgentIdentity {
  name: string;
  ticker: string;
  chain: string;
  tee: string;
  status: string;
  score: number;
  color: string;
  address: string;
}

const cards = [
  { num: '01', title: 'Verifiable Identity', body: 'Agents hold unique on-chain identities backed by cryptographic attestation, enabling permissioned protocol access and reputation continuity across deployments.' },
  { num: '02', title: 'TEE Attestation', body: 'Trusted Execution Environments confirm that agent code runs unmodified. Provenance score is anchored to TEE verification — the gold standard for execution integrity.' },
  { num: '03', title: 'Credit Portability', body: 'Bond Scores and credit history follow the agent identity across chains and protocols — establishing the first portable reputation layer for autonomous financial actors.' },
  { num: '04', title: 'Composable Access', body: 'Protocols query ERC-8004 identities to gate liquidity access. Credit capacity, grade, and risk flags are readable on-chain by any compliant lending market.' },
  { num: '05', title: 'Continuous Scoring', body: 'Watchtower updates Bond Scores daily based on observed on-chain behavior. Credit lines adjust automatically as agents build or degrade their track record.' },
  { num: '06', title: 'Governance Integration', body: 'Agent identity feeds into DAO governance frameworks, allowing protocols to weight votes or grant privileges based on verified performance history.' },
];

function ActiveBadge({ address }: { address: string }) {
  const [hovered, setHovered] = useState(false);
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <span style={{ position: 'relative', display: 'inline-block', cursor: 'default' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>✓ Active</span>
      {hovered && (
        <span style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', whiteSpace: 'nowrap', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <span style={{ display: 'block', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--s2)', marginBottom: 3 }}>ERC-8004 Address</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--white)' }}>{short}</span>
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--border)' }} />
        </span>
      )}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <span style={{ display: 'inline-block', width: '80%', height: 14, borderRadius: 4, background: 'var(--border)', opacity: 0.5 }} />
        </td>
      ))}
    </tr>
  );
}

export default function ERC8004Section() {
  const [identities, setIdentities] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/watchtower/agents')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: LiveAgentSummary[]) => {
        const mapped: AgentIdentity[] = data.map(a => ({
          name: a.name,
          ticker: a.ticker,
          chain: a.chain ?? 'Base',
          tee: a.tee_status ?? 'Attested',
          status: 'Active',
          score: a.provenance_score,
          color: a.color,
          address: a.erc8004_address ?? '0x0000000000000000000000000000000000000000',
        }));
        setIdentities(mapped);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const activeCount = identities.filter(a => a.status === 'Active').length;
  const totalCount = identities.length;

  return (
    <section className="sec" id="erc8004" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="wrap">
        <div className="sh reveal">
          <div className="stag">IDENTITY LAYER</div>
          <h2 className="sh2">ERC-8004</h2>
          <p className="sdesc">A proposed Ethereum standard for verifiable agent identity — enabling permissioned DeFi participation, on-chain reputation, and credit scoring.</p>
        </div>
        <div className="reveal" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--s2)' }}>Genesis Agent Registry — ERC-8004 Verified</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--lime)', background: 'var(--lime-05)', border: '1px solid var(--lime-20)', borderRadius: 4, padding: '1px 7px' }}>
              {loading ? '— / —' : `${activeCount} / ${totalCount}`} Active
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Agent', 'Ticker', 'Deployment Chain', 'TEE Status', 'ERC-8004 Identity', 'Provenance Score'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--s2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : error ? (
                <tr><td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'var(--s2)' }}>Registry data unavailable — showing cached state</td></tr>
              ) : identities.map((a, i) => (
                <tr key={a.ticker} style={{ borderBottom: i < identities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, display: 'inline-block', flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{a.name}</span></div></td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: a.color, background: `${a.color}1F`, border: `1px solid ${a.color}40`, borderRadius: 4, padding: '2px 7px' }}>{a.ticker}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--s1)', fontFamily: 'var(--mono)' }}>{a.chain}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>● {a.tee}</span></td>
                  <td style={{ padding: '12px 16px' }}><ActiveBadge address={a.address} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 60 }}><div style={{ height: '100%', width: `${a.score}%`, background: a.color, borderRadius: 2 }} /></div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: a.color, fontWeight: 700 }}>{a.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {cards.map((card) => (
            <div key={card.num} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, transition: 'border-color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(69,69,233,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
              <div style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 700, color: 'rgba(255,255,255,0.05)', lineHeight: 1, marginBottom: 12 }}>{card.num}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: 'var(--s2)', lineHeight: 1.75 }}>{card.body}</div>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '2px solid var(--lime)', borderRadius: 8, padding: '18px 22px', fontSize: 12, color: 'var(--s1)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--lime)', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ROADMAP:</strong>{' '}
          Integrating 17 additional DeFi agents &middot; Expanding behavioural metrics (Q2 2026) &middot; More ecosystem integrations (Q3 2026) &middot; Agent framework integrations including Virtuals Protocol
        </div>
      </div>
    </section>
  );
}
