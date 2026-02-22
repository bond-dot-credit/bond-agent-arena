import { supabaseFetch, AgentSeason1Row, AgentAumHistoricalRow, SupabaseFetchError } from '../db/supabase';
import { Agent, PerformanceSnapshot } from '../types';
import { agentMetadata } from '../data/agentMetadata';
import { mockAgents } from '../data/mockAgents';

const BASE_VALUE = 2000;
const historicalAccessDeniedAgents = new Set<string>();
const agentByAddressCache = new Map<string, Agent>();
let supabaseAvailable: boolean | null = null;

async function isSupabaseAvailable(): Promise<boolean> {
  if (supabaseAvailable !== null) return supabaseAvailable;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      signal: AbortSignal.timeout(3000),
    });
    supabaseAvailable = response.ok;
    return supabaseAvailable;
  } catch {
    supabaseAvailable = false;
    return false;
  }
}

function getMockAgentByAddress(address: string): Agent | null {
  const normalizedAddress = address.toLowerCase();
  const mock = mockAgents.find(
    a => a.contractAddress.toLowerCase() === normalizedAddress
  );
  if (!mock) return null;
  
  return {
    ...mock,
    contractAddress: mock.contractAddress,
    aua: mock.aua || 2000,
    aum: mock.aum || 2000,
    nativeYield: 0,
    rewards: 0,
    totalYieldUsd: 0,
    apyPercent: parseFloat(mock.roi.replace('%', '').replace('+', '')),
    expectedYield: mock.roi,
  };
}

function getMockPerformanceSnapshots(agent: Agent): PerformanceSnapshot[] {
  const now = Date.now();
  const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
  const targetValue = BASE_VALUE * (1 + roiNum / 100);
  const snapshots: PerformanceSnapshot[] = [];
  
  // Generate 24 snapshots (24 hours of data)
  for (let i = 0; i < 24; i++) {
    const timestamp = now - (24 - i) * 60 * 60 * 1000;
    const progress = i / 23;
    const trendValue = BASE_VALUE + (targetValue - BASE_VALUE) * progress;
    const volatility = 0.005;
    const noise = (Math.random() - 0.5) * BASE_VALUE * volatility;
    const value = Math.max(trendValue + noise, BASE_VALUE * 0.95);
    
    snapshots.push({
      timestamp,
      balance: value,
      totalAum: value,
    });
  }
  
  return snapshots;
}

// Get all agents with calculated metrics from Season 1 schema
export async function getAllAgents(): Promise<Agent[]> {
  try {
    const available = await isSupabaseAvailable();
    if (!available) {
      console.warn("Supabase unavailable, using mock data");
      return mockAgents.map((agent, index) => ({
        ...agent,
        rank: index + 1,
        aua: agent.aua || 2000,
        aum: agent.aum || 2000,
        nativeYield: 0,
        rewards: 0,
        totalYieldUsd: 0,
        apyPercent: parseFloat(agent.roi.replace('%', '').replace('+', '')),
        expectedYield: agent.roi,
      }));
    }

    console.log("Fetching agents from Supabase Season 1 schema (agents table)...");
    const data: AgentSeason1Row[] = await supabaseFetch(
      '/rest/v1/agents?select=*&order=agent_name.asc',
      'scoringframeworkseason1'
    );

    console.log(`Fetched ${data?.length || 0} agents from Supabase.`);
    if (data && data.length > 0) {
      console.log("First agent sample:", data[0].agent_name);
    }

    if (!data || data.length === 0) {
      console.warn("No agent data returned from Supabase.");
      return [];
    }

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
        aua: row.total_balance_usd || row.usdc_native_balance_usd,
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
  } catch (error) {
    console.error("Error in getAllAgents:", error);
    return []; // Return empty array instead of crashing
  }
}

// Get agent by contract address
export async function getAgentByAddress(address: string): Promise<Agent | null> {
  const normalizedAddress = (address || '').toLowerCase();
  
  if (agentByAddressCache.has(normalizedAddress)) {
    return agentByAddressCache.get(normalizedAddress) || null;
  }

  try {
    const available = await isSupabaseAvailable();
    if (!available) {
      console.warn("Supabase unavailable, using mock agent data");
      const mockAgent = getMockAgentByAddress(address);
      if (mockAgent) {
        agentByAddressCache.set(normalizedAddress, mockAgent);
      }
      return mockAgent;
    }

    const data: any[] = await supabaseFetch(
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

    const agent = {
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
      aua: row.total_balance_usd || row.usdc_native_balance_usd,
      aum: row.usdc_native_balance,
      nativeYield: row.usdc_native_yield,
      rewards: rewards,
      totalYieldUsd: row.total_yield_usd,
      apyPercent: apyPercent,
      expectedYield: `${apyPercent.toFixed(1)}% APY`,
    };

    agentByAddressCache.set(normalizedAddress, agent);
    return agent;
  } catch (error) {
    console.error("Error in getAgentByAddress:", error);
    return null;
  }
}

// Get performance snapshots for an agent
export async function getAgentPerformance(
  address: string,
  from?: number,
  to?: number,
  limit?: number,
  preloadedAgent?: Agent | null
): Promise<PerformanceSnapshot[]> {
  // First get agent name from address (or use preloaded value from route).
  const agent = preloadedAgent ?? await getAgentByAddress(address);
  if (!agent) return [];

  const agentName = agent.agent;

  // Check if Supabase is available
  const available = await isSupabaseAvailable();
  if (!available) {
    console.warn("Supabase unavailable, using mock performance data");
    return getMockPerformanceSnapshots(agent);
  }

  if (historicalAccessDeniedAgents.has(agentName)) {
    return [{
      timestamp: Date.now(),
      balance: agent.aum || 0,
      totalAum: agent.aua || agent.aum || 0
    }];
  }

  // Fetch historical data from Season 1 schema
  // Note: we use yield_summation_historical table
  let data: any[] = [];
  try {
    data = await supabaseFetch(
      `/rest/v1/yield_summation_historical?agent_name=eq.${agentName}&select=run_timestamp,usdc_native_balance,total_balance_usd&order=run_timestamp.asc`,
      'scoringframeworkseason1'
    );
  } catch (error) {
    // Keep API responses resilient when historical table permissions vary.
    const isAuthDenied =
      error instanceof SupabaseFetchError &&
      (error.status === 401 || error.status === 403);

    if (isAuthDenied) {
      historicalAccessDeniedAgents.add(agentName);
      console.warn(`Historical query unavailable for ${agentName}; using current balance fallback.`);
    } else {
      console.warn(`Historical query failed for ${agentName}; using current balance fallback.`);
    }
  }

  if (!data || data.length === 0) {
    // If historical table is empty, return a single snapshot from the current agents table
    return [{
      timestamp: Date.now(),
      balance: agent.aum || 0,
      totalAum: agent.aua || agent.aum || 0
    }];
  }

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
