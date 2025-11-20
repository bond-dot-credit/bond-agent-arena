import { supabaseFetch, AgentAumRow, AgentAumHistoricalRow } from '../db/supabase';
import { Agent, PerformanceSnapshot } from '../types';
import { agentMetadata } from '../data/agentMetadata';

const BASE_VALUE = 2000;

// Get all agents with calculated metrics
export async function getAllAgents(): Promise<Agent[]> {
  const data: AgentAumRow[] = await supabaseFetch(
    '/rest/v1/agent_aum?select=agent_name,smart_account_address,token_symbol,balance,total_aum,tx_time,run_ts&order=agent_name.asc'
  );

  if (!data || data.length === 0) return [];

  // Convert to Agent type with calculated metrics
  const agents = data.map((row, index) => {
    const metadata = agentMetadata[row.agent_name] || {
      vaultType: 'Yield Optimizers',
      riskScore: 0.80,
      validation: 'pending' as const,
      performanceScore: 70.0,
      medal: '',
      website: '',
    };

    // Calculate ROI: (balance - 2000) / 2000 * 100
    const roiPercent = ((row.balance - BASE_VALUE) / BASE_VALUE) * 100;
    const roi = `${roiPercent >= 0 ? '+' : ''}${roiPercent.toFixed(1)}%`;

    return {
      rank: index + 1,
      agent: row.agent_name,
      contractAddress: row.smart_account_address,
      vaultType: metadata.vaultType,
      roi,
      riskScore: metadata.riskScore,
      validation: metadata.validation,
      performanceScore: metadata.performanceScore,
      bondScore: 'Coming Soon',
      medal: metadata.medal,
      website: metadata.website,
      aua: row.balance,
      aum: row.total_aum,
    } as Agent;
  });

  // Sort by performance score (descending)
  return agents.sort((a, b) => b.performanceScore - a.performanceScore)
    .map((agent, index) => ({ ...agent, rank: index + 1 }));
}

// Get agent by contract address
export async function getAgentByAddress(address: string): Promise<Agent | null> {
  const data: AgentAumRow[] = await supabaseFetch(
    `/rest/v1/agent_aum?smart_account_address=eq.${address}&select=agent_name,smart_account_address,token_symbol,balance,total_aum,tx_time,run_ts`
  );

  if (!data || data.length === 0) return null;

  const row = data[0];
  const metadata = agentMetadata[row.agent_name] || {
    vaultType: 'Yield Optimizers',
    riskScore: 0.80,
    validation: 'pending' as const,
    performanceScore: 70.0,
    medal: '',
    website: '',
  };

  const roiPercent = ((row.balance - BASE_VALUE) / BASE_VALUE) * 100;
  const roi = `${roiPercent >= 0 ? '+' : ''}${roiPercent.toFixed(1)}%`;

  return {
    rank: 1,
    agent: row.agent_name,
    contractAddress: row.smart_account_address,
    vaultType: metadata.vaultType,
    roi,
    riskScore: metadata.riskScore,
    validation: metadata.validation,
    performanceScore: metadata.performanceScore,
    bondScore: 'Coming Soon',
    medal: metadata.medal,
    website: metadata.website,
    aua: row.balance,
    aum: row.total_aum,
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

  // Fetch historical data
  const data: AgentAumHistoricalRow[] = await supabaseFetch(
    `/rest/v1/agent_aum_historical?agent_name=eq.${agentName}&select=run_ts,balance,total_aum&order=run_ts.asc`
  );

  if (!data || data.length === 0) return [];

  return data.map((snapshot) => ({
    timestamp: new Date(snapshot.run_ts).getTime(),
    balance: snapshot.balance,
    totalAum: snapshot.total_aum,
  }));
}

// Get leaderboard (agents sorted by performance score)
export async function getLeaderboard() {
  return getAllAgents();
}
