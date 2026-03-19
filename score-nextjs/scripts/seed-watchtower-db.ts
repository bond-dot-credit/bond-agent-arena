import 'dotenv/config';
import { GENESIS_AGENTS } from '../lib/watchtower-data.js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

const PROTOCOLS: Record<string, string[]> = {
  'Giza':       ['Aave V3', 'Pendle', 'Morpho', 'Aerodrome'],
  'Mamo':       ['Moonwell', 'Aerodrome', 'Uniswap V3', 'Seamless', 'Extra Fi'],
  'Sail':       ['Uniswap V3', 'Aave V3', 'Curve'],
  'ZyFi':       ['Fluid', 'Wasabi', 'Harvest'],
  'SurfLiquid': ['Lido', 'Rocket Pool', 'Convex', 'Curve'],
};
const CHAINS: Record<string, string> = {
  'Giza': 'Base + Arbitrum', 'Mamo': 'Base', 'Sail': 'Base + Arbitrum',
  'ZyFi': 'Base + Arbitrum', 'SurfLiquid': 'Base',
};
const ADDRESSES: Record<string, string> = {
  'Giza':       '0x3a8B1a9Df3E4c52C6b9F2e7D0A5c8B4e1F6d9C2a',
  'Mamo':       '0x7f2C4b8E9D1a6F3c0B5e2A9d4C7f1E8b3D6a5F0c',
  'Sail':       '0x5e1D7c3A8f4B2e9C6d0F5a3B8e2D7c4A1f9E6b0d',
  'ZyFi':       '0x9b4F6e2C8a1D5f3B7e0C4A9d6F2e8B5c3A7f1D4e',
  'SurfLiquid': '0x2d8E5b1C9f4A7e3D6c0B8F2a5E9d1C4b7A3f6E8c',
};

async function seed() {
  if (!supabaseUrl || !supabaseKey) { console.error('Missing SUPABASE env vars'); process.exit(1); }
  const rows = GENESIS_AGENTS.map(a => ({
    agent_key: a.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: a.name, ticker: a.ticker, color: a.color,
    chain: CHAINS[a.name] || 'Base',
    protocols: PROTOCOLS[a.name] || [],
    tee_status: 'Attested',
    erc8004_address: ADDRESSES[a.name] || null,
    strategy_type: a.strategy_type, strategy_description: a.strategy_description,
    strategy_notes: a.strategy_notes,
    liquidation_proximity: a.liquidation_proximity, liquidity_exposure: a.liquidity_exposure,
    performance_score: a.performance_score, risk_score: a.risk_score,
    stability_score: a.stability_score, sentiment_score: a.sentiment_score,
    provenance_score: a.provenance_score,
    sharpe_ratio: a.sharpe, max_drawdown: a.max_drawdown, leverage: a.leverage,
    credit_capacity: a.credit_capacity,
    signal: a.risk_score >= 70 ? 'safe' : a.risk_score >= 50 ? 'caution' : 'risk',
    score_trend: a.score_trend,
    days_since_scored: a.days_since_scored,
    capital_apy_total: a.capital_apy_total, capital_apy_native: a.capital_apy_native,
    reward_dependency: a.reward_dependency, total_yield: a.total_yield,
    native_yield: a.native_yield, reward_yield: a.reward_yield,
    total_volume: a.total_volume, transaction_count: a.transaction_count,
    cadence_days: a.cadence, capital_deployed: a.capital_deployed,
    capital_turnover: a.capital_turnover, tyr: a.tyr,
    yield_per_1k: a.yield_per_1k_capital, protocol_diversity: a.protocol_diversity,
    season: 'genesis',
  }));
  const res = await fetch(`${supabaseUrl}/rest/v1/watchtower_agents`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) { console.error('Seed failed:', await res.text()); process.exit(1); }
  const data = await res.json();
  console.log(`Seeded ${data.length} agents into watchtower_agents`);
}
seed().catch(console.error);
