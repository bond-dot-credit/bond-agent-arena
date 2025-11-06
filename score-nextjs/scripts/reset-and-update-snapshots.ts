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
    agentName: 'Arma',
    dailyAPRs: [8.18049192119412, 8.00378032575822, 8.61172782956928]
  },
  {
    agentId: 2,
    agentName: 'Sail',
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
 * Calculate hourly yield from daily yield
 * @param dailyYield Daily yield amount
 * @returns Hourly yield amount
 */
function calculateHourlyYield(dailyYield: number): number {
  // 24 hours in a day
  return dailyYield / 24;
}

/**
 * Delete all existing snapshots
 */
async function clearAllSnapshots() {
  console.log('Clearing all existing snapshots...');
  const { error } = await supabase
    .from('performance_snapshots')
    .delete()
    .neq('agent_id', 0); // Delete all (using neq with impossible value)

  if (error) {
    console.error('Error clearing snapshots:', error);
    throw error;
  }

  console.log('✓ All snapshots cleared');
}

/**
 * Generate new snapshots for an agent starting from $2000
 * Creates 168 hourly snapshots (7 days) with realistic progression to target ROI
 * @param agent Agent APR configuration
 */
async function generateSnapshotsForAgent(agent: AgentAPR) {
  console.log(`\nGenerating snapshots for ${agent.agentName}...`);

  // Annual ROI targets based on agent
  const annualROITargets: { [key: string]: number } = {
    'Arma': 9.8,
    'Sail': 7.3,
    'Almanak': 5.2,
    'SurfLiquid': 3.9,
    'Mamo': 1.1,
  };

  // Convert annual ROI to 7-day ROI (more realistic)
  // Formula: 7-day ROI = (Annual ROI / 365) * 7
  const annualROI = annualROITargets[agent.agentName] || 0;
  const sevenDayROI = (annualROI / 365) * 7;
  const targetValue = BASE_CAPITAL * (1 + sevenDayROI / 100);
  let currentCapital = BASE_CAPITAL;

  console.log(`Starting capital: $${currentCapital.toFixed(2)}`);
  console.log(`Annual ROI: ${annualROI}%`);
  console.log(`7-Day ROI Target: ${sevenDayROI.toFixed(4)}% → $${targetValue.toFixed(2)}`);

  // Generate 168 hourly snapshots (7 days)
  const snapshots = [];
  const now = Date.now();

  for (let i = 0; i < 168; i++) {
    // Calculate timestamp (1 hour apart, going backwards from now)
    // i=0: 168 hours ago, i=167: current hour
    const timestamp = new Date(now - (167 - i) * 60 * 60 * 1000);

    // Pure linear progression - no volatility
    const progressRatio = i / 167;
    currentCapital = BASE_CAPITAL + (targetValue - BASE_CAPITAL) * progressRatio;

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

  console.log(`Generated ${snapshots.length} snapshots (7 days of hourly data)`);
  console.log(`Latest snapshot timestamp: ${snapshots[snapshots.length - 1].timestamp}`);
  console.log(`Final capital: $${currentCapital.toFixed(2)} (Target: $${targetValue.toFixed(2)})`);

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

  console.log(`✓ Completed snapshots for ${agent.agentName}`);
}

/**
 * Main function to reset and update all agent snapshots
 */
async function resetAndUpdateAllSnapshots() {
  console.log('=== Starting Snapshot Reset & Update ===');
  console.log(`Will reset all data and generate fresh snapshots starting from $${BASE_CAPITAL}`);
  console.log(`Period: Last 7 days (168 hourly snapshots per agent)`);
  console.log(`Current time: ${new Date().toISOString()}\n`);

  // Clear all existing snapshots
  await clearAllSnapshots();

  // Generate new snapshots for all agents
  for (const agent of agentAPRs) {
    await generateSnapshotsForAgent(agent);
  }

  console.log('\n=== Snapshot Reset & Update Complete ===');
  console.log('Your charts should now show data up to the current time!');
}

// Run the script
resetAndUpdateAllSnapshots()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
