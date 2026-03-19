import { supabaseFetch } from './supabase';
import { computeBondScore, computeGrade, AGENT_SUMMARIES, AGENT_FULLS, getWatchtowerSummary } from '../watchtower-data';
import type { AgentRow, AgentSummary, AgentFull, WatchtowerSummary } from '../watchtower-data';

// Extended type with live fields from DB
export interface LiveAgentSummary extends AgentSummary {
  chain?: string;
  tee_status?: string;
  erc8004_address?: string;
  protocols?: string[];
  signal?: string;
}

export interface LiveAgentFull extends AgentFull {
  chain?: string;
  tee_status?: string;
  erc8004_address?: string;
  protocols?: string[];
  signal?: string;
}

interface DBRow {
  id: number;
  agent_key: string;
  name: string;
  ticker: string;
  color: string;
  chain: string | null;
  protocols: string[] | null;
  tee_status: string | null;
  erc8004_address: string | null;
  strategy_type: string | null;
  strategy_description: string | null;
  strategy_notes: string | null;
  liquidation_proximity: string | null;
  liquidity_exposure: string | null;
  performance_score: number;
  risk_score: number;
  stability_score: number;
  sentiment_score: number;
  provenance_score: number;
  sharpe_ratio: number;
  max_drawdown: number;
  leverage: number;
  credit_capacity: number;
  signal: string | null;
  score_trend: string | null;
  days_since_scored: number | null;
  capital_apy_total: number | null;
  capital_apy_native: number | null;
  reward_dependency: number | null;
  total_yield: number | null;
  native_yield: number | null;
  reward_yield: number | null;
  total_volume: number | null;
  transaction_count: number | null;
  cadence_days: number | null;
  capital_deployed: number | null;
  capital_turnover: number | null;
  tyr: number | null;
  yield_per_1k: number | null;
  protocol_diversity: number | null;
  season: string;
  last_scored_at: string;
  updated_at: string;
}

// Fields that can be updated via PUT /api/watchtower/agents/[id]
export interface AgentUpdatePayload {
  performance_score?: number;
  risk_score?: number;
  stability_score?: number;
  sentiment_score?: number;
  provenance_score?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  leverage?: number;
  liquidation_proximity?: string;
  liquidity_exposure?: string;
  protocol_diversity?: number;
  credit_capacity?: number;
  score_trend?: string;
  days_since_scored?: number;
  strategy_notes?: string;
  capital_apy_total?: number;
  capital_apy_native?: number;
  reward_dependency?: number;
  total_yield?: number;
  native_yield?: number;
  reward_yield?: number;
  total_volume?: number;
  transaction_count?: number;
  cadence_days?: number;
  capital_deployed?: number;
  capital_turnover?: number;
  tyr?: number;
  yield_per_1k?: number;
  signal?: string;
}

function toSummary(r: DBRow): LiveAgentSummary {
  const fakeRow = {
    performance_score: r.performance_score, risk_score: r.risk_score,
    stability_score: r.stability_score, sentiment_score: r.sentiment_score,
    provenance_score: r.provenance_score,
  } as AgentRow;
  const bond_score = computeBondScore(fakeRow);
  return {
    id: r.id, name: r.name, ticker: r.ticker, color: r.color,
    bond_score, grade: computeGrade(bond_score),
    performance_score: r.performance_score, risk_score: r.risk_score,
    stability_score: r.stability_score, sentiment_score: r.sentiment_score,
    provenance_score: r.provenance_score,
    sharpe: Number(r.sharpe_ratio), max_drawdown: Number(r.max_drawdown),
    leverage: Number(r.leverage), credit_capacity: r.credit_capacity,
    last_updated: r.updated_at, score_trend: r.score_trend,
    days_since_scored: r.days_since_scored,
    capital_apy_total: r.capital_apy_total ? Number(r.capital_apy_total) : null,
    capital_apy_native: r.capital_apy_native ? Number(r.capital_apy_native) : null,
    reward_dependency: r.reward_dependency ? Number(r.reward_dependency) : null,
    protocol_diversity: r.protocol_diversity,
    total_volume: r.total_volume ? Number(r.total_volume) : null,
    total_yield: r.total_yield ? Number(r.total_yield) : null,
    native_yield: r.native_yield ? Number(r.native_yield) : null,
    transaction_count: r.transaction_count,
    chain: r.chain ?? undefined,
    tee_status: r.tee_status ?? undefined,
    erc8004_address: r.erc8004_address ?? undefined,
    protocols: r.protocols ?? undefined,
    signal: r.signal ?? undefined,
  };
}

function toFull(r: DBRow): LiveAgentFull {
  return {
    ...toSummary(r),
    liquidation_proximity: r.liquidation_proximity ?? 'Low',
    liquidity_exposure: r.liquidity_exposure ?? 'Low',
    strategy_notes: r.strategy_notes ?? '',
    reward_yield: r.reward_yield ? Number(r.reward_yield) : null,
    capital_deployed: r.capital_deployed ? Number(r.capital_deployed) : null,
    capital_turnover: r.capital_turnover ? Number(r.capital_turnover) : null,
    cadence: r.cadence_days ? Number(r.cadence_days) : null,
    tyr: r.tyr ? Number(r.tyr) : null,
    yield_per_1k_capital: r.yield_per_1k ? Number(r.yield_per_1k) : null,
    strategy_type: r.strategy_type,
    strategy_description: r.strategy_description,
  };
}

export async function getAgents(): Promise<LiveAgentSummary[]> {
  try {
    const rows: DBRow[] = await supabaseFetch(
      '/rest/v1/watchtower_agents?select=*&order=performance_score.desc'
    );
    if (!Array.isArray(rows) || rows.length === 0) return AGENT_SUMMARIES as LiveAgentSummary[];
    return rows.map(toSummary);
  } catch {
    console.warn('[watchtower-db] DB unavailable, using static fallback');
    return AGENT_SUMMARIES as LiveAgentSummary[];
  }
}

export async function getAgentById(id: number): Promise<LiveAgentFull | null> {
  try {
    const rows: DBRow[] = await supabaseFetch(
      `/rest/v1/watchtower_agents?id=eq.${id}&select=*&limit=1`
    );
    if (!Array.isArray(rows) || rows.length === 0) return AGENT_FULLS.find(a => a.id === id) as LiveAgentFull ?? null;
    return toFull(rows[0]);
  } catch {
    return AGENT_FULLS.find(a => a.id === id) as LiveAgentFull ?? null;
  }
}

export async function updateAgent(id: number, payload: AgentUpdatePayload): Promise<LiveAgentFull | null> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY || ''
  ).trim();

  const res = await fetch(`${supabaseUrl}/rest/v1/watchtower_agents?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
  const rows: DBRow[] = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return toFull(rows[0]);
}

export async function getSummary(): Promise<WatchtowerSummary> {
  try {
    const rows: DBRow[] = await supabaseFetch(
      '/rest/v1/watchtower_agents?select=id,performance_score,risk_score,stability_score,sentiment_score,provenance_score,credit_capacity,updated_at'
    );
    if (!Array.isArray(rows) || rows.length === 0) return getWatchtowerSummary();
    const scores = rows.map(r => computeBondScore(r as unknown as AgentRow));
    return {
      total_agents: rows.length,
      avg_bond_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      total_credit_capacity: rows.reduce((s, r) => s + r.credit_capacity, 0),
      last_updated: rows[0]?.updated_at ?? new Date().toISOString(),
    };
  } catch {
    return getWatchtowerSummary();
  }
}
