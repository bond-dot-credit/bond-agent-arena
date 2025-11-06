import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CONFIGURE THIS: Manually set the APR for today for each agent
const dailyAPRs = {
  Arma: 8.26,        // Set the APR % for today
  Sail: 9.15,
  Almanak: 6.40,
  SurfLiquid: 3.9,
  Mamo: 6.9,
};

const agents = [
  { agentId: 1, agentName: 'Arma' },
  { agentId: 2, agentName: 'Sail' },
  { agentId: 3, agentName: 'Almanak' },
  { agentId: 4, agentName: 'SurfLiquid' },
  { agentId: 5, agentName: 'Mamo' },
];

/**
 * Calculate daily yield from APR
 */
function calculateDailyYield(apr: number, capital: number): number {
  const dailyRate = apr / 365 / 100;
  return capital * dailyRate;
}

/**
 * Get the latest snapshot for an agent
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
    console.error(`Error fetching latest snapshot:`, error);
    return null;
  }

  return data;
}

/**
 * Add one day of yield for an agent
 */
async function addDailyYieldForAgent(agent: typeof agents[0]) {
  const apr = dailyAPRs[agent.agentName as keyof typeof dailyAPRs];

  console.log(`\n--- ${agent.agentName} ---`);
  console.log(`APR: ${apr}%`);

  // Get latest snapshot
  const latestSnapshot = await getLatestSnapshot(agent.agentId);
  if (!latestSnapshot) {
    console.log(`No existing snapshots found for ${agent.agentName}`);
    return;
  }

  const currentCapital = parseFloat(latestSnapshot.total_value_usd);
  const latestTimestamp = new Date(latestSnapshot.timestamp);

  console.log(`Current capital: $${currentCapital.toFixed(2)}`);
  console.log(`Latest snapshot: ${latestTimestamp.toISOString()}`);

  // Calculate daily yield
  const dailyYield = calculateDailyYield(apr, currentCapital);
  console.log(`Daily yield: $${dailyYield.toFixed(4)}`);

  // Add some realistic volatility (±5%)
  const volatility = (Math.random() - 0.5) * 0.1;
  const yieldWithVolatility = dailyYield * (1 + volatility);
  const newCapital = currentCapital + yieldWithVolatility;

  // Create new snapshot 24 hours after the latest one
  const newTimestamp = new Date(latestTimestamp.getTime() + 24 * 60 * 60 * 1000);

  const snapshot = {
    agent_id: agent.agentId,
    usdc_amount: newCapital,
    reward_token_amount: null,
    reward_token_symbol: null,
    reward_price_usd: null,
    total_value_usd: newCapital,
    timestamp: newTimestamp.toISOString(),
  };

  // Insert snapshot
  const { error } = await supabase
    .from('performance_snapshots')
    .insert([snapshot]);

  if (error) {
    console.error(`Error inserting snapshot:`, error);
  } else {
    console.log(`✓ New capital: $${newCapital.toFixed(2)} (${yieldWithVolatility >= 0 ? '+' : ''}$${yieldWithVolatility.toFixed(4)})`);
    console.log(`New snapshot: ${newTimestamp.toISOString()}`);
  }
}

/**
 * Main function
 */
async function addDailyYield() {
  console.log('=== Adding Daily Yield ===');
  console.log(`Date: ${new Date().toLocaleDateString()}\n`);

  for (const agent of agents) {
    await addDailyYieldForAgent(agent);
  }

  console.log('\n=== Daily Yield Added ===');
  console.log('\nTo add yield for another day, run this script again!');
  console.log('Tip: Update the dailyAPRs at the top of the script to change APR values.');
}

addDailyYield()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
