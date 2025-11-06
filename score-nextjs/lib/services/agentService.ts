import { supabase, AgentRow, PerformanceSnapshotRow } from '../db/supabase';
import { Agent, PerformanceSnapshot } from '../types';

// Convert database row to Agent type
function convertAgentRow(row: AgentRow, rank: number, roi: string, bondScore: string): Agent {
  return {
    rank,
    agent: row.name,
    contractAddress: row.contract_address,
    vaultType: row.vault_type,
    roi,
    riskScore: row.risk_score,
    validation: row.validation,
    performanceScore: row.performance_score,
    bondScore,
    medal: row.medal_url || undefined,
  };
}

// Get all agents with calculated metrics
export async function getAllAgents(): Promise<Agent[]> {
  const { data: agents, error } = await supabase
    .from('agentss')
    .select('*')
    .order('performance_score', { ascending: false });

  if (error) throw error;
  if (!agents) return [];

  // Get latest snapshot for each agent to calculate ROI and bond score
  const agentsWithMetrics = await Promise.all(
    agents.map(async (agent, index) => {
      const { data: snapshots } = await supabase
        .from('performance_snapshots')
        .select('total_value_usd')
        .eq('agent_id', agent.id)
        .order('timestamp', { ascending: false })
        .limit(2);

      const baseValue = 2000;
      const currentValue = snapshots?.[0]?.total_value_usd || baseValue;
      const roiPercent = ((currentValue - baseValue) / baseValue) * 100;
      const roi = `${roiPercent >= 0 ? '+' : ''}${roiPercent.toFixed(1)}%`;

      // Calculate bond score
      const bondScoreValue = roiPercent;
      const bondScore = `${bondScoreValue >= 0 ? '+' : ''}${bondScoreValue.toFixed(1)}`;

      return convertAgentRow(agent, index + 1, roi, bondScore);
    })
  );

  return agentsWithMetrics;
}

// Get agent by contract address
export async function getAgentByAddress(address: string): Promise<Agent | null> {
  const { data: agent, error } = await supabase
    .from('agentss')
    .select('*')
    .eq('contract_address', address)
    .single();

  if (error || !agent) return null;

  // Calculate metrics
  const { data: snapshots } = await supabase
    .from('performance_snapshots')
    .select('total_value_usd')
    .eq('agent_id', agent.id)
    .order('timestamp', { ascending: false })
    .limit(1);

  const baseValue = 2000;
  const currentValue = snapshots?.[0]?.total_value_usd || baseValue;
  const roiPercent = ((currentValue - baseValue) / baseValue) * 100;
  const roi = `${roiPercent >= 0 ? '+' : ''}${roiPercent.toFixed(1)}%`;
  const bondScoreValue = roiPercent;
  const bondScore = `${bondScoreValue >= 0 ? '+' : ''}${bondScoreValue.toFixed(1)}`;

  return convertAgentRow(agent, 1, roi, bondScore);
}

// Get performance snapshots for an agent
export async function getAgentPerformance(
  address: string,
  from?: number,
  to?: number,
  limit?: number
): Promise<PerformanceSnapshot[]> {
  // First get agent ID
  const { data: agent } = await supabase
    .from('agentss')
    .select('id')
    .eq('contract_address', address)
    .single();

  if (!agent) return [];

  let query = supabase
    .from('performance_snapshots')
    .select('*')
    .eq('agent_id', agent.id)
    .order('timestamp', { ascending: false }); // Get latest first

  // Apply time filtering if provided
  if (from) {
    query = query.gte('timestamp', new Date(from).toISOString());
  }
  if (to) {
    query = query.lte('timestamp', new Date(to).toISOString());
  }

  // Apply limit if provided
  if (limit) {
    query = query.limit(limit);
  }

  const { data: snapshots, error } = await query;

  if (error) throw error;
  if (!snapshots) return [];

  // Reverse to get chronological order (oldest to newest)
  const orderedSnapshots = snapshots.reverse();

  return orderedSnapshots.map((snapshot: PerformanceSnapshotRow) => ({
    timestamp: new Date(snapshot.timestamp).getTime(),
    usdcAmount: snapshot.usdc_amount,
    rewardTokenAmount: snapshot.reward_token_amount || undefined,
    rewardTokenSymbol: snapshot.reward_token_symbol || undefined,
    rewardPriceUsd: snapshot.reward_price_usd || undefined,
    totalValueUsd: snapshot.total_value_usd,
  }));
}

// Get leaderboard (agents sorted by total value)
export async function getLeaderboard() {
  const agents = await getAllAgents();

  // Sort by ROI
  const sorted = agents.sort((a, b) => {
    const roiA = parseFloat(a.roi.replace('%', '').replace('+', ''));
    const roiB = parseFloat(b.roi.replace('%', '').replace('+', ''));
    return roiB - roiA;
  });

  return sorted.map((agent, index) => ({
    ...agent,
    rank: index + 1,
  }));
}
