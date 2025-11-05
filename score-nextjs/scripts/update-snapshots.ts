import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AgentAPR {
  agentId: number;
  agentName: string;
  dailyAPRs: number[]; // Array of daily APRs for the next 3 days
}

// Real APR data from agents
// Each agent has 3 daily APR values (day 0 = today, day 1 = tomorrow, day 2 = day after)
const agentAPRs: AgentAPR[] = [
  {
    agentId: 1,
    agentName: 'Giza',
    dailyAPRs: [8.18049192119412, 8.00378032575822, 8.61172782956928]
  },
  {
    agentId: 2,
    agentName: 'Sail.Money',
    dailyAPRs: [9.80, 8.84, 8.9131]
  },
  {
    agentId: 3,
    agentName: 'Almanak',
    dailyAPRs: [6.19, 6.15, 6.87]
  },
  {
    agentId: 4,
    agentName: 'SurfLiquid',
    dailyAPRs: [3.9, 3.9, 3.9] // Placeholder - update with real data
  },
  {
    agentId: 5,
    agentName: 'Mamo',
    dailyAPRs: [6.9, 6.7, 7.1]
  },
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
  console.log(`\nGenerating snapshots for ${agent.agentName}...`);
  console.log(`Daily APRs: Day 0: ${agent.dailyAPRs[0].toFixed(4)}%, Day 1: ${agent.dailyAPRs[1].toFixed(4)}%, Day 2: ${agent.dailyAPRs[2].toFixed(4)}%`);

  // Get latest snapshot to determine current capital
  const latestSnapshot = await getLatestSnapshot(agent.agentId);
  let currentCapital = latestSnapshot ? parseFloat(latestSnapshot.total_value_usd) : BASE_CAPITAL;

  console.log(`Starting capital: $${currentCapital.toFixed(2)}`);

  // Generate snapshots for the past 3 days (144 half-hour periods going backwards)
  const snapshots = [];
  const now = new Date();

  for (let i = 0; i < 144; i++) {
    // Determine which day we're on (2, 1, or 0) - going from oldest to newest
    const dayIndex = 2 - Math.floor(i / 48);
    const dailyAPR = agent.dailyAPRs[dayIndex];

    // Calculate daily yield based on current day's APR
    const dailyYield = calculateDailyYield(dailyAPR, currentCapital);
    const halfHourlyYield = calculateHalfHourlyYield(dailyYield);

    // Calculate timestamp (30 minutes apart, going backwards from now)
    const timestamp = new Date(now.getTime() - (144 - i) * 30 * 60 * 1000);

    // Add half-hourly yield with high volatility (±15% for dramatic visualization)
    // But ensure it averages out to the correct APR over time
    const volatility = (Math.random() - 0.5) * 0.3;
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

  console.log(`Generated ${snapshots.length} snapshots`);
  console.log(`Day 0 yield: $${(calculateDailyYield(agent.dailyAPRs[0], BASE_CAPITAL)).toFixed(4)}`);
  console.log(`Day 1 yield: $${(calculateDailyYield(agent.dailyAPRs[1], BASE_CAPITAL)).toFixed(4)}`);
  console.log(`Day 2 yield: $${(calculateDailyYield(agent.dailyAPRs[2], BASE_CAPITAL)).toFixed(4)}`);

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
