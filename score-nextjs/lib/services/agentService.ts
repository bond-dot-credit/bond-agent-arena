import { supabaseFetch, AgentSeason1Row, AgentAumHistoricalRow } from '../db/supabase';
import { Agent, PerformanceSnapshot } from '../types';
import { agentMetadata } from '../data/agentMetadata';

const BASE_VALUE = 2000;

// Get all agents with calculated metrics from Season 1 schema
export async function getAllAgents(): Promise<Agent[]> {
  const data: AgentSeason1Row[] = await supabaseFetch(
    '/rest/v1/agents?select=*&order=agent_name.asc',
    'scoringframeworkseason1'
  );

  if (!data || data.length === 0) return [];

  // Convert to Agent type with calculated metrics
  const agents = data.map((row, index) => {
    const metadata = agentMetadata[row.agent_name] || {
      riskScore: 0.80,
      validation: 'pending' as const,
      performanceScore: 70.0,
      medal: '',
      website: '',
    };

    // Calculate Rewards: total_yield_usd - usdc_native_yield
    const rewards = (row.total_yield_usd || 0) - (row.usdc_native_yield || 0);
    
    // Use APY from row if available, otherwise calculate ROI
    const apyPercent = row.apy_percent || 0;
    const roi = `${apyPercent >= 0 ? '+' : ''}${apyPercent.toFixed(1)}%`;

    return {
      rank: index + 1,
      agent: row.agent_name,
      contractAddress: row.agent_smart_wallet_address,
      roi,
      riskScore: metadata.riskScore,
      validation: metadata.validation,
      performanceScore: metadata.performanceScore,
      bondScore: 'Coming Soon',
      medal: metadata.medal,
      website: metadata.website,
      aua: row.total_balance_usd,
      aum: row.usdc_native_balance,
      nativeYield: row.usdc_native_yield,
      rewards: rewards,
      totalYieldUsd: row.total_yield_usd,
      apyPercent: apyPercent,
      expectedYield: `${apyPercent.toFixed(1)}% APY`,
    } as Agent;
  });

  // Sort by performance score (descending)
  return agents.sort((a, b) => b.performanceScore - a.performanceScore)
    .map((agent, index) => ({ ...agent, rank: index + 1 }));
}

// Get agent by contract address
export async function getAgentByAddress(address: string): Promise<Agent | null> {
  const data: AgentSeason1Row[] = await supabaseFetch(
    `/rest/v1/agents?agent_smart_wallet_address=eq.${address}&select=*`,
    'scoringframeworkseason1'
  );

  if (!data || data.length === 0) return null;

  const row = data[0];
  const metadata = agentMetadata[row.agent_name] || {
    riskScore: 0.80,
    validation: 'pending' as const,
    performanceScore: 70.0,
    medal: '',
    website: '',
  };

  const rewards = (row.total_yield_usd || 0) - (row.usdc_native_yield || 0);
  const apyPercent = row.apy_percent || 0;
  const roi = `${apyPercent >= 0 ? '+' : ''}${apyPercent.toFixed(1)}%`;

  return {
    rank: 1,
    agent: row.agent_name,
    contractAddress: row.agent_smart_wallet_address,
    roi,
    riskScore: metadata.riskScore,
    validation: metadata.validation,
    performanceScore: metadata.performanceScore,
    bondScore: 'Coming Soon',
    medal: metadata.medal,
    website: metadata.website,
    aua: row.total_balance_usd,
    aum: row.usdc_native_balance,
    nativeYield: row.usdc_native_yield,
    rewards: rewards,
    totalYieldUsd: row.total_yield_usd,
    apyPercent: apyPercent,
    expectedYield: `${apyPercent.toFixed(1)}% APY`,
  };
}

// Get performance snapshots for an agent
export async function getAgentPerformance(
  address: string,
  from?: number,
  to?: number,
  limit?: number
): Promise<PerformanceSnapshot[]> {
  // First get agent name from address
  const agent = await getAgentByAddress(address);
  if (!agent) return [];

  const agentName = agent.agent;

  // Fetch historical data from Season 1 schema
  // Note: we use yield_summation_historical table
  const data: any[] = await supabaseFetch(
    `/rest/v1/yield_summation_historical?agent_name=eq.${agentName}&select=run_timestamp,usdc_native_balance,total_balance_usd&order=run_timestamp.asc`,
    'scoringframeworkseason1'
  );

  if (!data || data.length === 0) return [];

  return data.map((snapshot) => ({
    timestamp: new Date(snapshot.run_timestamp).getTime(),
    balance: snapshot.usdc_native_balance || 0,
    totalAum: snapshot.total_balance_usd || snapshot.usdc_native_balance || 0,
  }));
}

// Get leaderboard (agents sorted by performance score)
export async function getLeaderboard() {
  return getAllAgents();
}
