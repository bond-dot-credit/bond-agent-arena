'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { AgentSummary, AgentFull } from '@/lib/watchtower-data';
import AgentPanel from './AgentPanel';

function getGradeClass(grade: string): string {
  if (grade === 'A+' || grade === 'A') return 'grade-a';
  if (grade === 'B+' || grade === 'B') return 'grade-b';
  return 'grade-c';
}

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function ScoreCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min((now - start) / 1400, 1);
          setValue(Math.round((1 - Math.pow(1 - p, 4)) * target));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <div ref={ref} className="bond-score-number">{value}</div>;
}

function DimBar({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="dim-row" ref={ref}>
      <span className="dim-label">{label}</span>
      <div className="dim-track"><div className="dim-fill" style={{ width: visible ? `${value}%` : '0%', background: color }} /></div>
      <span className="dim-val">{value}</span>
    </div>
  );
}

export default function AgentCards() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeData, setActiveData] = useState<AgentFull | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const isFetching = useRef(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchAgents = useCallback(() => {
    fetch('/api/watchtower/agents')
      .then(r => r.json())
      .then((data: AgentSummary[]) => { setAgents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const selectAgent = useCallback(async (id: number) => {
    if (id === activeId || isFetching.current) return;
    isFetching.current = true;
    setActiveId(id);
    const wasHidden = !reportVisible;
    setReportVisible(true);
    setFading(true);
    if (wasHidden) {
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
    setTimeout(async () => {
      try {
        const data: AgentFull = await fetch(`/api/watchtower/agents/${id}`).then(r => r.json());
        setActiveData(data);
        setFading(false);
      } catch {
        setFading(false);
      }
      isFetching.current = false;
    }, 220);
  }, [activeId, reportVisible]);

  const q = search.trim().toLowerCase();
  const filtered = q ? agents.filter(a => a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q)) : agents;
  const activeAgent = agents.find(a => a.id === activeId);

  if (loading) {
    return (
      <div className="agents-grid-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="agent-card-5">
            <div className="skel-line" style={{ width: '70%', height: 12 }} />
            <div className="skel-line" style={{ width: '40%', height: 44, margin: '12px auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(5)].map((_, j) => <div key={j} className="skel-line" style={{ width: '100%', height: 6 }} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="agent-search-wrap">
        <div className="agent-search-inner">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="#71717a" strokeWidth="1.4" />
            <line x1="8.7" y1="8.7" x2="13" y2="13" stroke="#71717a" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input className="agent-search" type="text" placeholder="Search agents by name or ticker…" value={search} onChange={e => setSearch(e.target.value)} spellCheck={false} />
          {search && (<button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--s2)', cursor: 'pointer', fontSize: 13, padding: '0 4px', lineHeight: 1 }} aria-label="Clear search">✕</button>)}
        </div>
        <span className="agent-search-count">{filtered.length} of {agents.length} agents</span>
      </div>
      <div className="agents-grid-5">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '48px 0', textAlign: 'center', color: 'var(--s2)', fontSize: 14 }}>No agents match &ldquo;{search}&rdquo;</div>
        ) : filtered.map(agent => {
          const isActive = agent.id === activeId;
          const trendSymbol = agent.score_trend === 'up' ? '↑' : agent.score_trend === 'down' ? '↓' : '→';
          const trendColor  = agent.score_trend === 'up' ? '#22c55e' : agent.score_trend === 'down' ? '#ef4444' : 'var(--s2)';
          return (
            <div key={agent.id} className={`agent-card-5${isActive ? ' active' : ''}`} onClick={() => selectAgent(agent.id)} style={{ outlineColor: isActive ? `${agent.color}99` : 'transparent' }}>
              <div className="card-header" style={{ padding: 0, border: 'none' }}>
                <div className="card-header-left"><div className="card-dot" style={{ background: agent.color }} /><span className="card-name">{agent.name}</span></div>
                <div className="card-header-right">
                  <span className="ticker-badge" style={{ color: agent.color, background: `${agent.color}1F`, border: `1px solid ${agent.color}40` }}>{agent.ticker}</span>
                  <span className={`grade-badge ${getGradeClass(agent.grade)}`}>{agent.grade}</span>
                </div>
              </div>
              <div className="bond-score-display" style={{ padding: '4px 0' }}>
                <div className="bond-score-label">BOND SCORE</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ScoreCounter target={agent.bond_score} />
                  <span style={{ fontSize: 18, color: trendColor }}>{trendSymbol}</span>
                </div>
              </div>
              {agent.capital_apy_total != null && (
                <div className="card-apy-row">
                  <div className="card-apy-item"><span className="card-apy-label">Total APY</span><span className="card-apy-val" style={{ color: agent.color }}>{agent.capital_apy_total.toFixed(2)}%</span></div>
                  <div className="card-apy-divider" />
                  <div className="card-apy-item"><span className="card-apy-label">Native APY</span><span className="card-apy-val">{agent.capital_apy_native != null ? `${agent.capital_apy_native.toFixed(2)}%` : '—'}</span></div>
                </div>
              )}
              {(agent.total_volume != null || agent.total_yield != null) && (
                <div className="card-apy-row">
                  <div className="card-apy-item"><span className="card-apy-label">Volume</span><span className="card-apy-val">{agent.total_volume != null ? fmt$(agent.total_volume) : '—'}</span></div>
                  <div className="card-apy-divider" />
                  <div className="card-apy-item"><span className="card-apy-label">Yield</span><span className="card-apy-val" style={{ color: '#22c55e' }}>{agent.total_yield != null ? `$${agent.total_yield.toFixed(2)}` : '—'}</span></div>
                  {agent.transaction_count != null && (<><div className="card-apy-divider" /><div className="card-apy-item"><span className="card-apy-label">Txns</span><span className="card-apy-val">{agent.transaction_count}</span></div></>)}
                </div>
              )}
              <div className="dim-bars" style={{ padding: 0 }}>
                <DimBar label="PERF" value={agent.performance_score} color={agent.color} />
                <DimBar label="RISK" value={agent.risk_score}        color={agent.color} />
                <DimBar label="STAB" value={agent.stability_score}   color={agent.color} />
                <DimBar label="SENT" value={agent.sentiment_score}   color={agent.color} />
                <DimBar label="PROV" value={agent.provenance_score}  color={agent.color} />
              </div>
              <div className="card-hint">{isActive ? 'Viewing ↓' : 'View Report →'}</div>
            </div>
          );
        })}
      </div>
      <div ref={reportRef} className={`agent-report${reportVisible ? ' visible' : ''}`} style={{ borderColor: activeAgent ? `${activeAgent.color}55` : undefined }}>
        <div className="agent-tabs">
          {agents.map(a => {
            const isActive = a.id === activeId;
            return (
              <button key={a.id} className={`agent-tab${isActive ? ' active' : ''}`} onClick={() => selectAgent(a.id)} style={{ borderBottomColor: isActive ? a.color : 'transparent', color: isActive ? a.color : undefined }}>
                <span className="agent-tab-dot" style={{ background: a.color }} />
                {a.name}
              </button>
            );
          })}
        </div>
        <div className={`dashboard-content${fading ? ' fading' : ''}`}>
          {fading || !activeData ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, marginBottom: 24 }}>
                <div>
                  <div className="skel-line" style={{ width: '45%', height: 20, marginBottom: 10 }} />
                  <div className="skel-line" style={{ width: '60%', height: 30, marginBottom: 12 }} />
                  <div className="skel-line" style={{ width: '85%', height: 11, marginBottom: 8 }} />
                  <div className="skel-line" style={{ width: '70%', height: 11 }} />
                </div>
                <div>
                  <div className="skel-line" style={{ height: 70, marginBottom: 8 }} />
                  <div className="skel-line" style={{ height: 70, marginBottom: 8 }} />
                  <div className="skel-line" style={{ height: 70 }} />
                </div>
              </div>
              <div className="skel-line" style={{ height: 68, marginBottom: 20 }} />
              <div className="skel-line" style={{ height: 220 }} />
            </div>
          ) : (
            <AgentPanel agent={activeData} allAgents={agents} defaultTab={activeTabIndex} onTabChange={setActiveTabIndex} onCollapse={() => { setActiveId(null); setActiveData(null); setReportVisible(false); }} />
          )}
        </div>
      </div>
    </div>
  );
}
