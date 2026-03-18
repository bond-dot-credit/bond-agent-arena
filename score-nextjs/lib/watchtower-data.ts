export interface AgentRow {
  id: number;
  name: string;
  ticker: string;
  color: string;
  performance_score: number;
  risk_score: number;
  stability_score: number;
  sentiment_score: number;
  provenance_score: number;
  sharpe: number;
  max_drawdown: number;
  leverage: number;
  liquidation_proximity: string;
  liquidity_exposure: string;
  protocol_diversity: number;
  credit_capacity: number;
  strategy_notes: string;
  last_updated: string;
  total_volume: number | null;
  total_yield: number | null;
  native_yield: number | null;
  reward_yield: number | null;
  capital_apy_total: number | null;
  capital_apy_native: number | null;
  reward_dependency: number | null;
  capital_deployed: number | null;
  capital_turnover: number | null;
  transaction_count: number | null;
  cadence: number | null;
  tyr: number | null;
  yield_per_1k_capital: number | null;
  strategy_type: string | null;
  strategy_description: string | null;
  score_trend: string | null;
  days_since_scored: number | null;
}

export interface AgentSummary {
  id: number;
  name: string;
  ticker: string;
  color: string;
  bond_score: number;
  grade: string;
  performance_score: number;
  risk_score: number;
  stability_score: number;
  sentiment_score: number;
  provenance_score: number;
  sharpe: number;
  max_drawdown: number;
  leverage: number;
  credit_capacity: number;
  last_updated: string;
  score_trend: string | null;
  days_since_scored: number | null;
  capital_apy_total: number | null;
  capital_apy_native: number | null;
  reward_dependency: number | null;
  protocol_diversity: number | null;
  total_volume: number | null;
  total_yield: number | null;
  native_yield: number | null;
  transaction_count: number | null;
}

export interface AgentFull extends AgentSummary {
  liquidation_proximity: string;
  liquidity_exposure: string;
  strategy_notes: string;
  reward_yield: number | null;
  capital_deployed: number | null;
  capital_turnover: number | null;
  cadence: number | null;
  tyr: number | null;
  yield_per_1k_capital: number | null;
  strategy_type: string | null;
  strategy_description: string | null;
}

export interface WatchtowerSummary {
  total_agents: number;
  avg_bond_score: number;
  total_credit_capacity: number;
  last_updated: string;
}

export function computeBondScore(row: AgentRow): number {
  return Math.round(
    row.performance_score * 0.30 +
    row.risk_score * 0.25 +
    row.stability_score * 0.20 +
    row.sentiment_score * 0.15 +
    row.provenance_score * 0.10
  );
}

export function computeGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

const LAST_UPDATED = '2025-02-19T00:00:00Z';

export const GENESIS_AGENTS: AgentRow[] = [
  {
    id: 1, name: 'Giza', ticker: 'ARMA', color: '#bced62',
    performance_score: 82, risk_score: 71, stability_score: 88,
    sentiment_score: 76, provenance_score: 84,
    sharpe: 1.42, max_drawdown: 7.2, leverage: 1.8,
    liquidation_proximity: 'Low', liquidity_exposure: 'Medium',
    protocol_diversity: 4, credit_capacity: 2000000,
    total_volume: 96887.0, total_yield: 79.92,
    native_yield: 30.36, reward_yield: 49.56,
    capital_apy_total: 14.30, capital_apy_native: 5.27,
    reward_dependency: 62.0, capital_deployed: 2000.0,
    capital_turnover: 48.0, transaction_count: 48,
    cadence: 2.23, tyr: 0.282, yield_per_1k_capital: 39.96,
    strategy_type: 'High-Conviction',
    strategy_description: 'The high-conviction balanced yielder. Arma executes every 2.23 days with a reward-dominated yield split, delivering 14.30% total Capital APY — second-highest in the cohort. Its 62.0% reward dependency is the primary structural risk flag. Native Capital APY of 5.27% is the sustainable floor.',
    strategy_notes: 'Giza demonstrates consistent yield generation with conservative leverage. Strong provenance score reflects verified developer credentials and TEE-attested execution. Strategy shows resilience across multiple market regimes with disciplined risk management. Recommend standard credit line with quarterly review cycle.',
    score_trend: 'stable', days_since_scored: 1, last_updated: LAST_UPDATED,
  },
  {
    id: 2, name: 'Mamo', ticker: 'MAMO', color: '#00d180',
    performance_score: 79, risk_score: 84, stability_score: 81,
    sentiment_score: 88, provenance_score: 77,
    sharpe: 1.61, max_drawdown: 5.8, leverage: 1.4,
    liquidation_proximity: 'Low', liquidity_exposure: 'Low',
    protocol_diversity: 5, credit_capacity: 2500000,
    total_volume: 221482.0, total_yield: 30.00,
    native_yield: 27.49, reward_yield: 2.51,
    capital_apy_total: 5.21, capital_apy_native: 4.77,
    reward_dependency: 8.4, capital_deployed: 2000.0,
    capital_turnover: 111.0, transaction_count: 110,
    cadence: 0.97, tyr: 0.046, yield_per_1k_capital: 15.00,
    strategy_type: 'Balanced Yield',
    strategy_description: 'Mamo exhibits exceptional risk management with the lowest drawdown in the cohort. High sentiment score reflects strong community trust and consistent external credibility. Conservative leverage profile with broad protocol diversification qualifies for enhanced credit capacity.',
    strategy_notes: 'Mamo exhibits exceptional risk management with the lowest drawdown in the cohort. High sentiment score reflects strong community trust and consistent external credibility. Conservative leverage profile with broad protocol diversification qualifies for enhanced credit capacity. Top-tier risk discipline.',
    score_trend: 'up', days_since_scored: 1, last_updated: LAST_UPDATED,
  },
  {
    id: 3, name: 'Sail', ticker: 'SAIL', color: '#4a90b8',
    performance_score: 68, risk_score: 62, stability_score: 74,
    sentiment_score: 71, provenance_score: 80,
    sharpe: 1.09, max_drawdown: 12.4, leverage: 2.3,
    liquidation_proximity: 'Medium', liquidity_exposure: 'Medium',
    protocol_diversity: 3, credit_capacity: 750000,
    total_volume: 419059.0, total_yield: 36.75,
    native_yield: 36.65, reward_yield: 0.10,
    capital_apy_total: 6.41, capital_apy_native: 6.39,
    reward_dependency: 0.3, capital_deployed: 2000.0,
    capital_turnover: 210.0, transaction_count: 399,
    cadence: 0.27, tyr: 0.030, yield_per_1k_capital: 18.38,
    strategy_type: 'HFT / Routing',
    strategy_description: 'The high-frequency volume anchor. Sail cycles $2,000 of capital 210× over 107 days, executing every 0.27 days on average — the highest cadence in the Season 0 cohort.',
    strategy_notes: 'Sail shows solid provenance credentials and adequate execution stability but carries moderate drawdown risk relative to peers. Leverage ratio and limited protocol diversity warrant active monitoring. Credit line approved at reduced capacity pending two additional full scoring periods and drawdown improvement.',
    score_trend: 'stable', days_since_scored: 2, last_updated: LAST_UPDATED,
  },
  {
    id: 4, name: 'ZyFi', ticker: 'ZYFI', color: '#a855f7',
    performance_score: 91, risk_score: 66, stability_score: 78,
    sentiment_score: 82, provenance_score: 89,
    sharpe: 1.88, max_drawdown: 9.1, leverage: 2.7,
    liquidation_proximity: 'Medium', liquidity_exposure: 'Medium',
    protocol_diversity: 6, credit_capacity: 3000000,
    total_volume: 16299.0, total_yield: 57.58,
    native_yield: 57.58, reward_yield: 0.0,
    capital_apy_total: 10.17, capital_apy_native: 10.17,
    reward_dependency: 0.0, capital_deployed: 2000.0,
    capital_turnover: 8.0, transaction_count: 8,
    cadence: 13.4, tyr: 1.210, yield_per_1k_capital: 28.79,
    strategy_type: 'Pure Yield Farming',
    strategy_description: 'The pure-yield late activator and Season 0\'s strongest risk-adjusted performer. ZyFi deployed 8 transactions across Fluid, Wasabi and Harvest protocols, generating $57.58 in 100% native yield — zero reward dependency.',
    strategy_notes: 'ZyFi leads the cohort on both performance and provenance. Elevated leverage is well-offset by superior yield generation and the highest Sharpe ratio in the group. Broad strategy diversification across six protocols reduces single-point dependency risk significantly. High-confidence credit allocation with active leverage monitoring recommended.',
    score_trend: 'up', days_since_scored: 1, last_updated: LAST_UPDATED,
  },
  {
    id: 5, name: 'SurfLiquid', ticker: 'SURF', color: '#f97316',
    performance_score: 74, risk_score: 58, stability_score: 69,
    sentiment_score: 65, provenance_score: 72,
    sharpe: 1.21, max_drawdown: 14.7, leverage: 3.1,
    liquidation_proximity: 'High', liquidity_exposure: 'High',
    protocol_diversity: 4, credit_capacity: 500000,
    total_volume: 8079.0, total_yield: 91.50,
    native_yield: 33.94, reward_yield: 57.56,
    capital_apy_total: 16.49, capital_apy_native: 5.91,
    reward_dependency: 62.9, capital_deployed: 2000.0,
    capital_turnover: 4.0, transaction_count: 5,
    cadence: 21.4, tyr: 3.916, yield_per_1k_capital: 45.75,
    strategy_type: 'Emission Harvesting',
    strategy_description: 'SurfLiquid pursues an aggressive high-yield strategy with elevated risk parameters across all monitored dimensions. High liquidation proximity and leverage require conservative credit limits at this stage.',
    strategy_notes: 'SurfLiquid pursues an aggressive high-yield strategy with elevated risk parameters across all monitored dimensions. High liquidation proximity and leverage require conservative credit limits at this stage. Strategy shows early performance promise but a longer verified track record is required before any credit expansion is considered.',
    score_trend: 'down', days_since_scored: 1, last_updated: LAST_UPDATED,
  },
];

function toSummary(row: AgentRow): AgentSummary {
  const bond_score = computeBondScore(row);
  return {
    id: row.id, name: row.name, ticker: row.ticker, color: row.color,
    bond_score, grade: computeGrade(bond_score),
    performance_score: row.performance_score, risk_score: row.risk_score,
    stability_score: row.stability_score, sentiment_score: row.sentiment_score,
    provenance_score: row.provenance_score, sharpe: row.sharpe,
    max_drawdown: row.max_drawdown, leverage: row.leverage,
    credit_capacity: row.credit_capacity, last_updated: row.last_updated,
    score_trend: row.score_trend, days_since_scored: row.days_since_scored,
    capital_apy_total: row.capital_apy_total, capital_apy_native: row.capital_apy_native,
    reward_dependency: row.reward_dependency, protocol_diversity: row.protocol_diversity,
    total_volume: row.total_volume, total_yield: row.total_yield,
    native_yield: row.native_yield, transaction_count: row.transaction_count,
  };
}

function toFull(row: AgentRow): AgentFull {
  return {
    ...toSummary(row),
    liquidation_proximity: row.liquidation_proximity,
    liquidity_exposure: row.liquidity_exposure,
    strategy_notes: row.strategy_notes,
    reward_yield: row.reward_yield,
    capital_deployed: row.capital_deployed,
    capital_turnover: row.capital_turnover,
    cadence: row.cadence,
    tyr: row.tyr,
    yield_per_1k_capital: row.yield_per_1k_capital,
    strategy_type: row.strategy_type,
    strategy_description: row.strategy_description,
  };
}

export const AGENT_SUMMARIES: AgentSummary[] = GENESIS_AGENTS.map(toSummary);
export const AGENT_FULLS: AgentFull[] = GENESIS_AGENTS.map(toFull);

export function getWatchtowerSummary(): WatchtowerSummary {
  const scores = AGENT_SUMMARIES.map(a => a.bond_score);
  return {
    total_agents: GENESIS_AGENTS.length,
    avg_bond_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    total_credit_capacity: GENESIS_AGENTS.reduce((sum, a) => sum + a.credit_capacity, 0),
    last_updated: LAST_UPDATED,
  };
}
