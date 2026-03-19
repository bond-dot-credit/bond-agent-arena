'use client';

import { useState } from 'react';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';

const REPORT_SECTIONS = [
  {
    num: '01',
    title: 'Five-Dimension Credit Scoring',
    desc: 'How Watchtower converts 107 days of raw on-chain behavior into five algorithmic scores — Performance, Risk, Stability, Sentiment, and Provenance — and why a single score is insufficient for financial underwriting.',
  },
  {
    num: '02',
    title: 'Agent-by-Agent Credit Profiles',
    desc: 'Individual breakdowns for all five Genesis agents: Capital APY (native vs. total), Sharpe ratio, reward dependency, transaction cadence, drawdown, and the Bond Score that determines credit capacity.',
  },
  {
    num: '03',
    title: 'Portfolio Risk & Concentration Analysis',
    desc: 'HHI concentration at 0.521, reward dependency exposure across the cohort, drawdown analysis, and the three strategic priorities Watchtower identified heading into Season 1.',
  },
  {
    num: '04',
    title: 'ERC-8004 Provenance & Methodology',
    desc: 'How onchain identity anchoring and TEE attestation create tamper-proof credit histories — and why verifiable provenance is the foundation that makes Bond Scores institutionally underwritable.',
  },
];

const GENESIS_AGENTS = [
  { handle: 'Giza / Arma', ticker: 'GIZA',  color: '#3b82f6', score: 72, apy: '14.30%', note: 'High-conviction balanced yielder' },
  { handle: 'Mamo',        ticker: 'MAMO',  color: '#22c55e', score: 68, apy: '5.21%',  note: 'Daily rhythm · most stable cadence' },
  { handle: 'Sail',        ticker: 'SAIL',  color: '#4a90b8', score: 65, apy: '6.41%',  note: 'High-frequency volume anchor' },
  { handle: 'ZyFi',        ticker: 'ZYFI',  color: '#a855f7', score: 78, apy: '10.17%', note: 'Best Sharpe · zero reward dep.' },
  { handle: 'SurfLiquid',  ticker: 'SURF',  color: '#f97316', score: 71, apy: '16.49%', note: 'Highest absolute yield · 62.9% reward dep.' },
];

const KEY_FINDINGS = [
  {
    label: 'REWARD DEPENDENCY RISK',
    body: 'ZyFi and SurfLiquid generate 62%+ of yield from reward emissions. Sustainable native floors range from 5.27% to 10.17%. Reward-adjusted underwriting cuts headline APY by up to 5.3 percentage points.',
  },
  {
    label: 'VOLUME CONCENTRATION',
    body: "Sail accounts for 55% of the portfolio's $761,806 total volume, driving HHI to 0.521 — a high-concentration signal. Season 1 target: reduce single-agent share below 45% by scaling ZyFi and Arma.",
  },
  {
    label: 'BEST RISK-ADJUSTED PERFORMER',
    body: 'ZyFi leads on Sharpe ratio (1.88) with 100% native yield and zero reward dependency. 10.17% Capital APY on 8 transactions makes it the priority Season 1 scale candidate at up to $5M credit capacity.',
  },
];

export default function ReportPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    setErrorMsg('');
    const name = trimmed.split('@')[0];
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, name, userType: 'reader' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      } else {
        setSubmittedEmail(trimmed);
        setStatus('success');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  return (
    <>
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <header className="tge-hero">
          <div className="wrap">
            <div className="tge-hero-grid">
              <div className="tge-hero-text">
                <div className="chip" style={{ borderColor: 'rgba(69,69,233,0.35)', background: 'rgba(69,69,233,0.06)' }}>
                  <div className="chip-dot" style={{ background: 'var(--lime)', boxShadow: '0 0 6px rgba(69,69,233,0.5)' }} />
                  <span style={{ color: 'var(--lime)' }}>Agent Credit Report</span>
                  <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
                  <span>Nov 2024 – Feb 2025</span>
                </div>

                <h1 className="tge-h1">
                  Agentic Alpha<br />
                  <span style={{ color: 'var(--lime)' }}>Genesis</span><br />
                  <span style={{ fontSize: '0.52em', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--s1)', lineHeight: 1.3, display: 'block', marginTop: 6 }}>
                    Inaugural Capital Deployment Report
                  </span>
                </h1>

                <p className="tge-sub">
                  Five autonomous agents. $10,000 deployed. 107 days of continuous on-chain monitoring.
                  This is the first institutional-grade credit report for agentic capital — built on
                  verified transaction history, not community ratings.
                </p>

                {status === 'success' ? (
                  <div className="tge-success">
                    <div className="tge-success-check">✓</div>
                    <div className="tge-success-title">You&rsquo;re on the list.</div>
                    <div className="tge-success-sub">
                      Season 1 updates will be sent to <strong>{submittedEmail}</strong>.
                    </div>
                  </div>
                ) : (
                  <form className="tge-form" onSubmit={handleSubmit} noValidate>
                    <div className="tge-input-row">
                      <input
                        className="tge-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        spellCheck={false}
                        autoComplete="email"
                      />
                      <button className="tge-btn" type="submit" disabled={status === 'loading'}>
                        {status === 'loading' ? (
                          <span className="tge-btn-loading">
                            <span className="tge-spinner" />
                            Subscribing…
                          </span>
                        ) : 'Get Genesis Report'}
                      </button>
                    </div>
                    {status === 'error' && (
                      <p className="tge-form-error">{errorMsg}</p>
                    )}
                  </form>
                )}

                <p className="tge-note">
                  No spam. Get notified when Season 1 data and the next credit report drop.
                </p>
              </div>

              <div className="tge-showcase-embed">
                <div className="tge-showcase-frame-wrap">
                  <iframe
                    src="/showcase.html"
                    title="Agentic Alpha Genesis — Showcase"
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin"
                    allowTransparency={true}
                    className="tge-showcase-iframe"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <div className="tge-stats-strip">
          <div className="wrap">
            <div className="tge-stats">
              <div className="tge-stat">
                <div className="tge-stat-v">5</div>
                <div className="tge-stat-l">Agents Monitored</div>
              </div>
              <div className="tge-stat-div" />
              <div className="tge-stat">
                <div className="tge-stat-v">107</div>
                <div className="tge-stat-l">Days of Continuous Data</div>
              </div>
              <div className="tge-stat-div" />
              <div className="tge-stat">
                <div className="tge-stat-v">$295.75</div>
                <div className="tge-stat-l">Aggregate Yield</div>
              </div>
              <div className="tge-stat-div" />
              <div className="tge-stat">
                <div className="tge-stat-v">10.45%</div>
                <div className="tge-stat-l">Blended Capital APY</div>
              </div>
              <div className="tge-stat-div" />
              <div className="tge-stat">
                <div className="tge-stat-v">570</div>
                <div className="tge-stat-l">Verified Transactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── What the report covers ────────────────────────────────────── */}
        <section className="sec tge-inside">
          <div className="wrap">
            <div className="sh reveal">
              <div className="stag" style={{ color: 'var(--lime)' }}>
                WHAT THIS REPORT COVERS
              </div>
              <h2 className="sh2">Four sections. The full Genesis picture.</h2>
              <p className="sdesc">
                The Genesis Report is the first complete agentic credit analysis — covering scoring methodology,
                individual agent profiles, portfolio-level risk, and the provenance infrastructure
                that makes every data point verifiable.
              </p>
            </div>
            <div className="tge-inside-grid">
              {REPORT_SECTIONS.map(item => (
                <div key={item.num} className="tge-inside-card reveal">
                  <div className="tge-card-num">{item.num}</div>
                  <h3 className="tge-card-title">{item.title}</h3>
                  <p className="tge-card-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key findings ──────────────────────────────────────────────── */}
        <section className="sec" style={{ background: 'var(--bg2)' }}>
          <div className="wrap">
            <div className="sh reveal">
              <div className="stag" style={{ color: 'var(--lime)' }}>
                KEY FINDINGS
              </div>
              <h2 className="sh2">What 107 days revealed.</h2>
              <p className="sdesc">
                Three structural insights from the Genesis cohort that shape how bond.credit underwrites
                agentic capital — and what changes in Season 1.
              </p>
            </div>
            <div className="tge-findings-grid">
              {KEY_FINDINGS.map((f, i) => (
                <div key={i} className="tge-finding-card reveal">
                  <div className="tge-finding-label">{f.label}</div>
                  <p className="tge-finding-body">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Genesis cohort ────────────────────────────────────────────── */}
        <section className="sec tge-agents">
          <div className="wrap">
            <div className="sh reveal">
              <div className="stag" style={{ color: 'var(--lime)' }}>
                GENESIS COHORT
              </div>
              <h2 className="sh2">Five agents. Five credit profiles.</h2>
              <p className="sdesc">
                Each agent operated autonomously for 107 days under continuous Watchtower observation.
                Bond Scores reflect verified on-chain performance — not community votes or self-reported metrics.
              </p>
            </div>
            <div className="tge-agents-grid">
              {GENESIS_AGENTS.map(a => (
                <div key={a.ticker} className="tge-agent-card reveal">
                  <div className="tge-agent-top">
                    <div className="tge-agent-dot" style={{ background: a.color }} />
                    <span className="tge-agent-handle">{a.handle}</span>
                    <span className="ticker-badge" style={{ color: a.color, background: `${a.color}1F`, border: `1px solid ${a.color}40` }}>{a.ticker}</span>
                  </div>
                  <div className="tge-agent-score" style={{ color: a.color }}>{a.score}</div>
                  <div className="tge-agent-label">Bond Score</div>
                  <div className="tge-agent-apy" style={{ color: a.color }}>{a.apy}</div>
                  <div className="tge-agent-label" style={{ marginTop: 0 }}>Capital APY</div>
                  <div className="tge-agent-role" style={{ marginTop: 8 }}>{a.note}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--s2)', marginTop: 24, textAlign: 'center', fontFamily: 'var(--mono)' }}>
              Full credit reports with transaction-level data available on the{' '}
              <a href="/watchtower" style={{ color: 'var(--lime)', textDecoration: 'none' }}>Watchtower dashboard ↗</a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
