import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AgentAPR {
  agentId: number;
  agentName: string;
  apr: number; // Annual Percentage Rate (e.g., 9.8 for 9.8%)
}

// Manual APR input - will be replaced with dynamic source later
const agentAPRs: AgentAPR[] = [
  { agentId: 1, agentName: 'Giza', apr: 9.8 },
  { agentId: 2, agentName: 'Sail.Money', apr: 7.3 },
  { agentId: 3, agentName: 'Almanak', apr: 5.2 },
  { agentId: 4, agentName: 'Surf', apr: 3.9 },
  { agentId: 5, agentName: 'Mamo', apr: 1.1 },
];

const BASE_CAPITAL = 2000; // Starting capital for each agent

/**
 * Calculate daily yield from APR
 * @param apr Annual Percentage Rate
 * @param capital Current capital amount
 * @returns Daily yield amount
 */
function calculateDailyYield(apr: number, capital: number): number {
  // APR to daily rate: APR / 365
  const dailyRate = apr / 365 / 100;
  return capital * dailyRate;
}

/**
 * Calculate half-hourly yield from daily yield
 * @param dailyYield Daily yield amount
 * @returns Half-hourly yield amount
 */
function calculateHalfHourlyYield(dailyYield: number): number {
  // 48 half-hour periods in a day
  return dailyYield / 48;
}

/**
 * Get the latest snapshot for an agent
 * @param agentId Agent ID
 * @returns Latest snapshot or null
 */
async function getLatestSnapshot(agentId: number) {
  const { data, error } = await supabase
    .from('performance_snapshots')
    .select('*')
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error(`Error fetching latest snapshot for agent ${agentId}:`, error);
    return null;
  }

  return data;
}

/**
 * Generate new snapshots for an agent over the next 3 days
 * @param agent Agent APR configuration
 */
async function generateSnapshotsForAgent(agent: AgentAPR) {
  console.log(`\nGenerating snapshots for ${agent.agentName} (APR: ${agent.apr}%)...`);

  // Get latest snapshot to determine current capital
  const latestSnapshot = await getLatestSnapshot(agent.agentId);
  let currentCapital = latestSnapshot ? parseFloat(latestSnapshot.total_value_usd) : BASE_CAPITAL;

  console.log(`Starting capital: $${currentCapital.toFixed(2)}`);

  // Calculate yields
  const dailyYield = calculateDailyYield(agent.apr, currentCapital);
  const halfHourlyYield = calculateHalfHourlyYield(dailyYield);

  console.log(`Daily yield: $${dailyYield.toFixed(4)}`);
  console.log(`Half-hourly yield: $${halfHourlyYield.toFixed(6)}`);

  // Generate snapshots for the next 3 days (144 half-hour periods)
  const snapshots = [];
  const now = new Date();

  for (let i = 0; i < 144; i++) {
    // Calculate timestamp (30 minutes apart)
    const timestamp = new Date(now.getTime() + i * 30 * 60 * 1000);

    // Add half-hourly yield with some volatility (±0.5%)
    const volatility = (Math.random() - 0.5) * 0.01;
    const yieldWithVolatility = halfHourlyYield * (1 + volatility);
    currentCapital += yieldWithVolatility;

    snapshots.push({
      agent_id: agent.agentId,
      usdc_amount: currentCapital,
      reward_token_amount: null,
      reward_token_symbol: null,
      reward_price_usd: null,
      total_value_usd: currentCapital,
      timestamp: timestamp.toISOString(),
    });
  }

  // Insert snapshots in batches of 100
  const batchSize = 100;
  for (let i = 0; i < snapshots.length; i += batchSize) {
    const batch = snapshots.slice(i, i + batchSize);
    const { error } = await supabase
      .from('performance_snapshots')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch for ${agent.agentName}:`, error);
    } else {
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} snapshots)`);
    }
  }

  console.log(`✓ Completed snapshots for ${agent.agentName}. Final capital: $${currentCapital.toFixed(2)}`);
}

/**
 * Main function to update all agent snapshots
 */
async function updateAllSnapshots() {
  console.log('=== Starting Snapshot Update ===');
  console.log(`Updating snapshots for ${agentAPRs.length} agents`);
  console.log(`Period: Next 3 days (144 snapshots per agent)\n`);

  for (const agent of agentAPRs) {
    await generateSnapshotsForAgent(agent);
  }

  console.log('\n=== Snapshot Update Complete ===');
}

// Run the script
updateAllSnapshots()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
